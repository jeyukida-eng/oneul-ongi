import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { AwsClient } from 'npm:aws4fetch@1.0.20';
import { UUID, imageMime, canReadAsset, boundedBytes } from './access.ts';
const cors={'Access-Control-Allow-Origin':'https://jeyukida-eng.github.io','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json','Cache-Control':'private, no-store','Vary':'Authorization'}});
const names=['PYEODA_R2_ACCOUNT_ID','PYEODA_R2_ACCESS_KEY_ID','PYEODA_R2_SECRET_ACCESS_KEY','PYEODA_R2_PRIVATE_BUCKET'];
function configuration(){
 const values=names.map(name=>Deno.env.get(name)||'');
 const ready=values.every(Boolean)&&/^[a-f0-9]{32}$/i.test(values[0])&&/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(values[3]);
 return {ready,account:values[0],key:values[1],secret:values[2],bucket:values[3]};
}
function quota(name:string){const raw=Deno.env.get(name);if(!raw)return null;const value=Number(raw);if(!Number.isSafeInteger(value)||value<=0)throw new Error('CONFIG_INVALID');return value;}
export async function handle(req:Request){
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(!['GET','POST'].includes(req.method))return json({ok:false,message:'GET or POST only'},405);
 const url=new URL(req.url),action=url.searchParams.get('action')||'read',config=configuration();
 if(req.method==='GET'&&action==='status')return json({ok:true,configured:config.ready,enabled:config.ready&&Deno.env.get('PYEODA_R2_UPLOADS_ENABLED')==='true'});
 try{
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const token=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');let user:any=null;
  if(token){const {data,error}=await admin.auth.getUser(token);if(!error&&data.user&&!data.user.is_anonymous)user=data.user;}
  if(action==='upload'&&!user)return json({ok:false,message:'작가 로그인이 필요합니다.'},401);
  if(!config.ready)return json({ok:false,code:'R2_NOT_CONFIGURED',message:'이미지 저장소 연결을 준비하고 있습니다. 기존 원고는 유지됩니다.'},503);
  const r2=new AwsClient({accessKeyId:config.key,secretAccessKey:config.secret,service:'s3',region:'auto',retries:0});
  const objectUrl=(key:string)=>`https://${config.account}.r2.cloudflarestorage.com/${config.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  if(req.method==='POST'&&action==='upload'){
   if(Deno.env.get('PYEODA_R2_UPLOADS_ENABLED')!=='true')return json({ok:false,code:'R2_UPLOADS_DISABLED',message:'이미지 저장소 점검 중입니다. 잠시 후 다시 저장해 주세요.'},503);
   const bookId=url.searchParams.get('bookId')||'',episodeNo=Number(url.searchParams.get('episodeNo'));
   if(!UUID.test(bookId)||!Number.isSafeInteger(episodeNo)||episodeNo<1)return json({ok:false,message:'작품과 회차를 확인해 주세요.'},400);
   const {data:book,error:bookError}=await admin.from('books').select('id,owner_id').eq('id',bookId).maybeSingle();if(bookError)throw bookError;
   if(!book||book.owner_id!==user.id)return json({ok:false,message:'본인 작품에만 그림을 저장할 수 있습니다.'},403);
   const bytes=await boundedBytes(req,10*1024*1024),mime=imageMime(bytes);
   if(!mime||req.headers.get('content-type')?.split(';')[0]!==mime)return json({ok:false,message:'PNG, JPG, WEBP 그림만 저장할 수 있습니다.'},400);
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
   const {data:asset,error:reserveError}=await admin.rpc('reserve_manuscript_asset',{p_owner:user.id,p_book:bookId,p_episode:episodeNo,p_hash:hash,p_mime:mime,p_bytes:bytes.length,p_total_limit:quota('PYEODA_R2_TOTAL_LIMIT_BYTES'),p_owner_limit:quota('PYEODA_R2_OWNER_LIMIT_BYTES')});
   if(reserveError)throw reserveError;
   if(asset.status!=='ready'){
    const put=await r2.fetch(objectUrl(asset.object_key),{method:'PUT',headers:{'Content-Type':mime,'x-amz-meta-sha256':hash},body:bytes,signal:AbortSignal.timeout(30000)});
    if(!put.ok)throw new Error('R2_UPLOAD_FAILED');await put.body?.cancel();
    const head=await r2.fetch(objectUrl(asset.object_key),{method:'HEAD',signal:AbortSignal.timeout(15000)});
    if(!head.ok||Number(head.headers.get('content-length'))!==bytes.length||head.headers.get('x-amz-meta-sha256')!==hash)throw new Error('R2_VERIFY_FAILED');
    const {error}=await admin.from('manuscript_assets').update({status:'ready',verified_at:new Date().toISOString()}).eq('id',asset.id);if(error)throw error;
   }
   return json({ok:true,assetId:asset.id,byteSize:asset.byte_size});
  }
  if(req.method!=='GET'||action!=='read')return json({ok:false,message:'요청을 확인해 주세요.'},400);
  const id=url.searchParams.get('id')||'';if(!UUID.test(id))return json({ok:false,message:'그림 ID가 올바르지 않습니다.'},400);
  const {data:asset,error}=await admin.from('manuscript_assets').select('*').eq('id',id).eq('status','ready').maybeSingle();if(error)throw error;
  if(!asset?.book_id)return json({ok:false,message:'그림을 찾지 못했습니다.'},404);
  const {data:book,error:bookError}=await admin.from('books').select('id,owner_id,published,age_rating,adult_review_status').eq('id',asset.book_id).maybeSingle();if(bookError)throw bookError;
  const {data:episode,error:epError}=await admin.from('episodes').select('episode_no,published,price,body_html').eq('book_id',asset.book_id).eq('episode_no',asset.episode_no).maybeSingle();if(epError)throw epError;
  let adultVerified=false;const purchases=new Set<string>();
  if(user&&book?.owner_id!==user.id){
   if(book?.age_rating==='19'){
    const {data:v,error:e}=await admin.from('adult_verifications').select('expires_at,revoked_at').eq('user_id',user.id).maybeSingle();if(e)throw e;adultVerified=!!v&&!v.revoked_at&&Date.parse(v.expires_at)>Date.now();
   }
   if(episode&&episode.episode_no>5&&Number(episode.price)>0){
    const {data:orders,error:e}=await admin.from('payment_orders').select('product_key').eq('buyer_id',user.id).eq('book_id',book!.id).eq('environment','test').eq('status','confirmed');if(e)throw e;for(const o of orders||[])purchases.add(o.product_key);
   }
  }
  if(!canReadAsset({book,episode,user,adultVerified,purchases,assetId:id}))return json({ok:false,message:'이 그림을 열람할 권한이 없습니다.'},403);
  // Proxy rather than returning a transferable signed URL: validates permission
  // on each request and avoids bucket CORS and expiring URLs in saved markup.
  const image=await r2.fetch(objectUrl(asset.object_key),{signal:AbortSignal.timeout(15000)});
  if(!image.ok)throw new Error('R2_READ_FAILED');
  return new Response(image.body,{headers:{...cors,'Content-Type':asset.mime_type,'Cache-Control':'private, no-store','Vary':'Authorization','X-Content-Type-Options':'nosniff'}});
 }catch(error:any){
  const quotaHit=String(error?.message||'').includes('ASSET_QUOTA_EXCEEDED');
  const sizeHit=String(error?.message||'').includes('ASSET_SIZE_LIMIT');
  console.error('manuscript-assets failed',quotaHit?'quota':sizeHit?'size':'unavailable');
  return json({ok:false,message:quotaHit?'이미지 저장 한도에 도달했습니다. 관리자에게 문의해 주세요.':sizeHit?'그림은 한 장당 10MB 이하로 선택해 주세요.':'그림을 처리하지 못했습니다. 기존 원고는 유지됩니다. 다시 시도해 주세요.'},quotaHit?409:sizeHit?413:503);
 }
}
Deno.serve(handle);
