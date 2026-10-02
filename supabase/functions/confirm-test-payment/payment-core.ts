import { createClient } from "npm:@supabase/supabase-js@2.57.4";
const cors = {"Access-Control-Allow-Origin":"https://jeyukida-eng.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const demos = {"사는 게 익숙해질 줄 알았다":4900,"문 앞에 두고 갑니다":5900,"바람이 기억한 이름":3900,"작은 가게의 큰 하루":4500,"서랍 속 여름":4900,"밤의 우체국":5500,"돌담 너머의 편지":4900,"새벽 세 시의 세탁소":5200};
const summary = row => ({orderId:row.order_id,productName:row.product_name,amount:row.amount,status:row.status,method:row.method,approvedAt:row.approved_at,createdAt:row.created_at,environment:row.environment});
const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
async function adultAccess(admin,book,user){
 if(book.age_rating!=='19')return true;
 if(user?.id===book.owner_id||user?.app_metadata?.pyeoda_admin===true)return true;
 if(!user||user.is_anonymous||book.adult_review_status!=='approved')return false;
 const {data,error}=await admin.from('adult_verifications').select('expires_at,revoked_at').eq('user_id',user.id).maybeSingle();
 return !error&&!!data&&!data.revoked_at&&Date.parse(data.expires_at)>Date.now();
}
export async function handle(req,mode){
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(req.method!=='POST')return json({ok:false,message:'POST only'},405);
 try{
  const input=await req.json();
  const clientKey=Deno.env.get('TOSS_TEST_CLIENT_KEY')||'';
  const secretKey=Deno.env.get('TOSS_TEST_SECRET_KEY')||'';
  // This deployment cannot use a live key, even if an administrator sets one accidentally.
  const ready=/^test_(?:g?ck)_/.test(clientKey)&&/^test_(?:g?sk)_/.test(secretKey);
  if(mode==='create'&&input.action==='config')return json({ok:true,testMode:true,ready,clientKey:ready?clientKey:null});
  const token=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
  const admin=createClient(Deno.env.get('SUPABASE_URL'),Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:auth,error:authError}=await admin.auth.getUser(token);
  if(authError||!auth?.user||auth.user.is_anonymous)return json({ok:false,code:'LOGIN_REQUIRED',message:'간편 로그인 후 테스트 결제를 이용해 주세요.'},401);
  const uid=auth.user.id;
  if(mode==='create'&&input.action==='list'){
   const {data,error}=await admin.from('payment_orders').select('*').eq('buyer_id',uid).eq('environment','test').order('created_at',{ascending:false}).limit(30);
   if(error)throw error;
   return json({ok:true,orders:data.map(summary)});
  }
  if(mode==='create'){
   if(!ready)return json({ok:false,code:'TEST_KEYS_REQUIRED',message:'테스트 결제 키 연결을 준비 중입니다. 실제 결제는 진행되지 않습니다.'},503);
   let amount=0,name='',productKey='',bookId=null;
   if(input.type==='points'){
    const points=Number(input.points);
    if(![5000,10000,30000].includes(points))return json({ok:false,message:'지원하지 않는 포인트 상품입니다.'},400);
    amount=points;name=`테스트 포인트 ${points.toLocaleString('ko-KR')}P`;productKey=`test-points:${points}`;
   }else if(input.type==='test'){
    amount=1000;name='펴다 테스트 결제';productKey='demo:checkout';
   }else if(input.bookId){
    const {data:book,error}=await admin.from('books').select('id,title,price,published,owner_id,age_rating,adult_review_status').eq('id',input.bookId).maybeSingle();
    if(error||!book||(!book.published&&book.owner_id!==uid))return json({ok:false,message:'테스트할 작품을 찾지 못했습니다.'},404);
    if(!await adultAccess(admin,book,auth.user))return json({ok:false,code:'ADULT_ACCESS_REQUIRED',message:'성인인증 및 작품 심사 승인이 필요합니다.'},403);
    bookId=book.id;
    if(input.type==='episode'){
     const no=Number(input.episodeNo);
     const {data:ep}=await admin.from('episodes').select('episode_no,price,published').eq('book_id',book.id).eq('episode_no',no).maybeSingle();
     if(!ep||no<=5||(!ep.published&&book.owner_id!==uid)||Number(ep.price)<=0)return json({ok:false,message:'첫 5화는 무료입니다. 가격이 설정된 6화 이후만 테스트할 수 있습니다.'},400);
     amount=Number(ep.price);name=`${book.title} · ${no}화`;productKey=`episode:${book.id}:${no}`;
    }else{amount=Number(book.price);name=book.title;productKey=`book:${book.id}`;}
   }else{
    name=String(input.title||'');amount=demos[name]||0;productKey=`demo:${name}`;
   }
   if(!Number.isSafeInteger(amount)||amount<100||amount>1000000)return json({ok:false,message:'서버에 등록된 유료 테스트 상품이 아닙니다.'},400);
   const {count,error:countError}=await admin.from('payment_orders').select('id',{count:'exact',head:true}).eq('buyer_id',uid).gte('created_at',new Date(Date.now()-60000).toISOString());
   if(countError)throw countError;
   if(count>=10)return json({ok:false,message:'잠시 후 다시 시도해 주세요.'},429);
   const {data:row,error}=await admin.from('payment_orders').insert({order_id:'pyeoda_test_'+crypto.randomUUID().replaceAll('-',''),provider:'toss',environment:'test',product_key:productKey,product_name:name,amount,currency:'KRW',buyer_id:uid,book_id:bookId,status:'pending'}).select('*').single();
   if(error)throw error;
   return json({ok:true,testMode:true,clientKey,customerKey:uid,order:summary(row)});
  }
  const orderId=String(input.orderId||'');
  const {data:order,error:orderError}=await admin.from('payment_orders').select('*').eq('order_id',orderId).eq('buyer_id',uid).eq('environment','test').maybeSingle();
  if(orderError||!order)return json({ok:false,code:'ORDER_NOT_FOUND',message:'본인의 테스트 주문을 찾을 수 없습니다.'},404);
  if(input.action==='fail'){
   // A browser cancellation must never overwrite an approval or an in-flight approval.
   if(order.status==='pending'&&!order.payment_key){
    const {error}=await admin.from('payment_orders').update({status:input.code==='PAY_PROCESS_CANCELED'?'canceled':'failed',failed_code:String(input.code||'CHECKOUT_FAILED').slice(0,100),failed_message:String(input.message||'결제가 중단되었습니다.').slice(0,500),updated_at:new Date().toISOString()}).eq('id',order.id).eq('status','pending').is('payment_key',null);
    if(error)throw error;
   }
   return json({ok:true,testMode:true,order:summary(order)});
  }
  const amount=Number(input.amount),paymentKey=String(input.paymentKey||'');
  if(!paymentKey||paymentKey.length>200||!Number.isSafeInteger(amount)||order.amount!==amount)return json({ok:false,code:'AMOUNT_MISMATCH',message:'주문 금액 또는 승인 정보가 일치하지 않습니다.'},400);
  if(order.payment_key&&order.payment_key!==paymentKey)return json({ok:false,code:'PAYMENT_KEY_MISMATCH',message:'다른 결제 정보로 승인할 수 없습니다.'},409);
  if(order.book_id){const {data:book}=await admin.from('books').select('owner_id,age_rating,adult_review_status').eq('id',order.book_id).maybeSingle();if(!book||!await adultAccess(admin,book,auth.user))return json({ok:false,code:'ADULT_ACCESS_REQUIRED',message:'성인인증 및 작품 심사 승인이 필요합니다.'},403);}
  if(order.status==='confirmed')return json({ok:true,testMode:true,alreadyConfirmed:true,order:summary(order)});
  if(order.status!=='pending')return json({ok:false,code:'ORDER_CLOSED',message:'종료된 주문입니다. 다시 결제를 시작해 주세요.'},409);
  if(!ready)return json({ok:false,code:'TEST_KEYS_REQUIRED',message:'테스트 키 연결이 필요합니다. 결제는 승인되지 않았습니다.'},503);
  if(!order.payment_key){
   const {data:bound,error}=await admin.from('payment_orders').update({payment_key:paymentKey,updated_at:new Date().toISOString()}).eq('id',order.id).eq('status','pending').is('payment_key',null).select('id');
   if(error)throw error;
   if(!bound.length){
    const {data:current}=await admin.from('payment_orders').select('payment_key,status').eq('id',order.id).single();
    if(!current||current.payment_key!==paymentKey||!['pending','confirmed'].includes(current.status))return json({ok:false,message:'다른 결제 요청이 처리 중입니다.'},409);
   }
  }
  const headers={Authorization:'Basic '+btoa(secretKey+':'),'Content-Type':'application/json','Idempotency-Key':orderId};
  let response=await fetch('https://api.tosspayments.com/v1/payments/confirm',{method:'POST',headers,body:JSON.stringify({paymentKey,orderId,amount}),signal:AbortSignal.timeout(20000)});
  let result=await response.json();
  if(!response.ok&&result.code==='ALREADY_PROCESSED_PAYMENT'){
   response=await fetch('https://api.tosspayments.com/v1/payments/'+encodeURIComponent(paymentKey),{headers,signal:AbortSignal.timeout(20000)});result=await response.json();
  }
  if(!response.ok){
   const retryable=response.status>=500||response.status===429;
   if(!retryable){
    const {error}=await admin.from('payment_orders').update({status:'failed',failed_code:String(result.code||'CONFIRM_FAILED').slice(0,100),failed_message:String(result.message||'승인 실패').slice(0,500),updated_at:new Date().toISOString()}).eq('id',order.id).eq('status','pending');
    if(error)throw error;
   }
   return json({ok:false,code:result.code||'CONFIRM_FAILED',message:String(result.message||'승인을 확인하지 못했습니다. 다시 확인해 주세요.'),retryable},retryable?502:400);
  }
  if(result.orderId!==orderId||result.paymentKey!==paymentKey||result.totalAmount!==amount||result.status!=='DONE')return json({ok:false,code:'PROVIDER_MISMATCH',message:'토스 승인 응답이 주문과 일치하지 않습니다. 다시 확인해 주세요.',retryable:true},502);
  const safe={orderId:result.orderId,totalAmount:result.totalAmount,status:result.status,method:result.method,approvedAt:result.approvedAt};
  const {data:row,error}=await admin.from('payment_orders').update({status:'confirmed',method:result.method,approved_at:result.approvedAt,provider_response:safe,failed_code:null,failed_message:null,updated_at:new Date().toISOString()}).eq('id',order.id).in('status',['pending','confirmed']).select('*').single();
  if(error)return json({ok:false,code:'SAVE_RETRY_REQUIRED',message:'토스 승인 후 주문 저장을 다시 확인해야 합니다. 승인 확인을 다시 눌러 주세요.',retryable:true},503);
  return json({ok:true,testMode:true,order:summary(row)});
 }catch(error){
  console.error('test payment error',error?.name||'Error');
  return json({ok:false,code:'PAYMENT_RETRY_REQUIRED',message:'결제 상태를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.',retryable:true},503);
 }
}
