import {createClient} from 'npm:@supabase/supabase-js@2.57.4';
import {AwsClient} from 'npm:aws4fetch@1.0.20';
import {UUID,LANGUAGES,publicationMime,canDownload,boundedBytes} from './access.ts';
const cors={'Access-Control-Allow-Origin':'https://jeyukida-eng.github.io','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Expose-Headers':'Content-Disposition'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'private, no-store','Vary':'Authorization','X-Content-Type-Options':'nosniff'}});
export async function handle(req:Request){
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(!['GET','POST'].includes(req.method))return json({ok:false,message:'GET or POST only'},405);
 try{
  const url=new URL(req.url),action=url.searchParams.get('action')||'list',bookId=url.searchParams.get('bookId')||'';
  if(!UUID.test(bookId))return json({ok:false,message:'작품을 확인해 주세요.'},400);
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const token=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');let user:any=null;
  if(token){const {data,error}=await admin.auth.getUser(token);if(!error&&data.user&&!data.user.is_anonymous)user=data.user;}
  if(action!=='list'&&!user)return json({ok:false,message:'로그인 후 이용해 주세요.'},401);
  const {data:book,error:be}=await admin.from('books').select('id,owner_id,title,price,published,completed,age_rating,adult_review_status').eq('id',bookId).maybeSingle();if(be)throw be;
  const owner=user?.id===book?.owner_id;
  if(!book||(!owner&&(!book.published||!book.completed)))return json({ok:false,message:'소장용 작품을 찾지 못했습니다.'},404);
  let adultVerified=false;
  if(book.age_rating==='19'&&!owner){
   if(user){const {data:v,error}=await admin.from('adult_verifications').select('expires_at,revoked_at').eq('user_id',user.id).maybeSingle();if(error)throw error;adultVerified=!!v&&!v.revoked_at&&Date.parse(v.expires_at)>Date.now()}
   if(book.adult_review_status!=='approved'||!adultVerified)return json({ok:false,message:'성인인증 및 작품 심사 승인이 필요합니다.'},403);
  }
  let orders:any[]=[];
  if(user&&!owner){const {data,error}=await admin.from('payment_orders').select('buyer_id,book_id,product_key,status,environment').eq('buyer_id',user.id).eq('book_id',bookId).eq('product_key','book:'+bookId).eq('status','confirmed').eq('environment','test');if(error)throw error;orders=data||[]}
  const allowed=canDownload({book,user,orders,adultVerified});
  if(action==='list'&&req.method==='GET'){
   const {data,error}=await admin.from('book_download_files').select('id,language,format,filename,byte_size,updated_at').eq('book_id',bookId).order('language');if(error)throw error;
   return json({ok:true,title:book.title,price:Number(book.price),canDownload:allowed,owner,environment:'test',files:(data||[]).map(f=>({id:f.id,language:f.language,format:f.format,filename:f.filename,byte_size:f.byte_size,updated_at:f.updated_at}))});
  }
  if(action==='read'&&!allowed)return json({ok:false,message:'이 작품의 결제 승인을 먼저 완료해 주세요.'},403);
  if(action==='upload'&&!owner)return json({ok:false,message:'본인 작품에만 판매 파일을 등록할 수 있습니다.'},403);
  const account=Deno.env.get('PYEODA_R2_ACCOUNT_ID')||'',key=Deno.env.get('PYEODA_R2_ACCESS_KEY_ID')||'',secret=Deno.env.get('PYEODA_R2_SECRET_ACCESS_KEY')||'',bucket=Deno.env.get('PYEODA_R2_PRIVATE_BUCKET')||'';
  if(!/^[a-f0-9]{32}$/i.test(account)||!key||!secret||!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket))return json({ok:false,message:'파일 저장소 연결을 확인해 주세요.'},503);
  const r2=new AwsClient({accessKeyId:key,secretAccessKey:secret,service:'s3',region:'auto',retries:0});
  const objectUrl=(path:string)=>`https://${account}.r2.cloudflarestorage.com/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`;
  if(action==='upload'&&req.method==='POST'){
   if(Deno.env.get('PYEODA_R2_UPLOADS_ENABLED')!=='true')return json({ok:false,message:'파일 저장소 점검 중입니다.'},503);
   const language=url.searchParams.get('language')||'',format=url.searchParams.get('format')||'';
   if(!LANGUAGES.includes(language)||!['pdf','epub'].includes(format))return json({ok:false,message:'언어와 파일 형식을 확인해 주세요.'},400);
   const bytes=await boundedBytes(req,50*1024*1024),mime=publicationMime(bytes,format);if(!mime)return json({ok:false,message:'올바른 PDF 또는 EPUB 파일을 선택해 주세요.'},400);
   const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
   const object_key=`downloads/${bookId}/${language}/${format}/${hash}.${format}`;
   const filename=(book.title.replace(/[\\/:*?"<>|\r\n]/g,'_').slice(0,120)||'book')+'_'+language+'.'+format;
   const put=await r2.fetch(objectUrl(object_key),{method:'PUT',headers:{'Content-Type':mime,'x-amz-meta-sha256':hash},body:bytes,signal:AbortSignal.timeout(30000)});if(!put.ok)throw new Error('PUT_FAILED');await put.body?.cancel();
   const head=await r2.fetch(objectUrl(object_key),{method:'HEAD',signal:AbortSignal.timeout(15000)});if(!head.ok||Number(head.headers.get('content-length'))!==bytes.length||head.headers.get('x-amz-meta-sha256')!==hash)throw new Error('VERIFY_FAILED');
   const {error}=await admin.from('book_download_files').upsert({book_id:bookId,owner_id:user.id,language,format,filename,object_key,sha256:hash,byte_size:bytes.length,updated_at:new Date().toISOString()},{onConflict:'book_id,language,format'});if(error)throw error;
   return json({ok:true,message:'판매 파일을 등록했습니다.'});
  }
  if(action==='read'&&req.method==='GET'){
   const id=url.searchParams.get('id')||'';if(!UUID.test(id))return json({ok:false,message:'파일을 확인해 주세요.'},400);
   const {data:file,error}=await admin.from('book_download_files').select('*').eq('id',id).eq('book_id',bookId).maybeSingle();if(error)throw error;if(!file)return json({ok:false,message:'등록된 파일을 찾지 못했습니다.'},404);
   const response=await r2.fetch(objectUrl(file.object_key),{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('READ_FAILED');
   return new Response(response.body,{headers:{...cors,'Content-Type':file.format==='pdf'?'application/pdf':'application/epub+zip','Content-Disposition':`attachment; filename="book.${file.format}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,'Cache-Control':'private, no-store','Vary':'Authorization','X-Content-Type-Options':'nosniff'}});
  }
  return json({ok:false,message:'요청을 확인해 주세요.'},400);
 }catch(error:any){const large=error?.message==='FILE_TOO_LARGE';console.error('book-downloads',large?'size':'unavailable');return json({ok:false,message:large?'파일은 50MB 이하로 등록해 주세요.':'파일을 처리하지 못했습니다. 다시 시도해 주세요.'},large?413:503)}
}
Deno.serve(handle);
