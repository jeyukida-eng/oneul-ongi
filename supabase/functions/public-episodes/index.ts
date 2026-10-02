import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
const cors={'Access-Control-Allow-Origin':'https://jeyukida-eng.github.io','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'private, no-store','Vary':'Authorization'}});
export async function handle(req){
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(!['GET','POST'].includes(req.method))return json({ok:false,message:'GET or POST only'},405);
 try{
  const input=req.method==='POST'?await req.json():{};
  const bookId=input.bookId||new URL(req.url).searchParams.get('book_id');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId||''))return json({ok:false,message:'작품 ID가 올바르지 않습니다.'},400);
  const admin=createClient(Deno.env.get('SUPABASE_URL'),Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
  const token=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
  let user=null;
  if(token){const {data}=await admin.auth.getUser(token);if(data?.user&&!data.user.is_anonymous)user=data.user;}
  const {data:book,error:bookError}=await admin.from('books').select('id,published,owner_id').eq('id',bookId).maybeSingle();
  if(bookError)throw bookError;
  if(!book||(!book.published&&book.owner_id!==user?.id))return json({ok:false,message:'공개 작품을 찾지 못했습니다.'},404);
  const {data:episodes,error}=await admin.from('episodes').select('id,episode_no,title,price,body,body_html,published,created_at,updated_at').eq('book_id',bookId).eq('published',true).order('episode_no',{ascending:true});
  if(error)throw error;
  const owner=user?.id===book.owner_id;
  let purchased=new Set();
  if(user&&!owner){
   const {data:orders,error:orderError}=await admin.from('payment_orders').select('product_key').eq('buyer_id',user.id).eq('environment','test').eq('status','confirmed').eq('book_id',bookId);
   if(orderError)throw orderError;
   purchased=new Set(orders.map(order=>order.product_key));
  }
  const full=purchased.has('book:'+bookId);
  const safe=(episodes||[]).map(ep=>{
   const price=ep.episode_no<=5?0:ep.price;
   const unlocked=price===0||owner||full||purchased.has(`episode:${bookId}:${ep.episode_no}`);
   return {...ep,price,locked:!unlocked,testMode:price>0,body:unlocked?ep.body:'',body_html:unlocked?ep.body_html:''};
  });
  return json({ok:true,bookId,testMode:true,episodes:safe});
 }catch(error){console.error('paid episode read failed',error?.name);return json({ok:false,message:'회차를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.'},503);}
}
Deno.serve(handle);
