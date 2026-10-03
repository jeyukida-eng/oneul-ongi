import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {stripTypeScriptTypes} from 'node:module';
import * as access from '../supabase/functions/manuscript-assets/access.ts';
let source=readFileSync(new URL('../supabase/functions/manuscript-assets/index.ts',import.meta.url),'utf8');
source=source.replace(/^import .*;\n/gm,'').replace('Deno.serve(handle);','');
source=stripTypeScriptTypes(source);
const factory=new Function('createClient','AwsClient','Deno',...Object.keys(access),source.replace('export async function handle','async function handle')+'\nreturn handle;');
const id='e1681ea4-7b32-4e76-a640-a4c5d288d1d6',bookId='b1681ea4-7b32-4e76-a640-a4c5d288d1d6';
function setup({configured=true,enabled=true,user={id:'owner'},owner='owner',ready=false,putOK=true,headOK=true,quotaError=false}={}){
 const env={SUPABASE_URL:'https://local.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'server-only',...(configured?{PYEODA_R2_ACCOUNT_ID:'a'.repeat(32),PYEODA_R2_ACCESS_KEY_ID:'key',PYEODA_R2_SECRET_ACCESS_KEY:'secret',PYEODA_R2_PRIVATE_BUCKET:'pyeoda-private'}:{}),PYEODA_R2_UPLOADS_ENABLED:String(enabled)};
 const operations=[];let reserved,verified=false,hash;
 const asset={id,book_id:bookId,episode_no:6,status:ready?'ready':'pending',byte_size:8,mime_type:'image/png',object_key:'manuscripts/key'};
 const book={id:bookId,owner_id:owner,published:true,age_rating:'all'};
 function chain(table){let update=false;const q={select(){return q},eq(){return q},update(){update=true;return q},async maybeSingle(){return {data:table==='books'?book:table==='manuscript_assets'?{...asset,status:'ready'}:table==='episodes'?{episode_no:6,published:true,price:0,body_html:`<img data-pyeoda-asset="${id}">`}:null,error:null}},then(resolve){verified=update;resolve({data:[],error:null})}};return q;}
 const admin={auth:{async getUser(){return {data:{user},error:null}}},from:chain,async rpc(name,args){operations.push('reserve');reserved=args;hash=args.p_hash;return quotaError?{error:{message:'ASSET_QUOTA_EXCEEDED'}}:{data:asset,error:null}}};
 class R2{async fetch(url,options={}){const method=options.method||'GET';operations.push(method);if(method==='PUT')return new Response('',{status:putOK?200:503});if(method==='HEAD')return new Response(null,{status:headOK?200:503,headers:{'content-length':'8','x-amz-meta-sha256':hash}});return new Response(new Uint8Array([137,80,78,71,13,10,26,10]),{headers:{'content-type':'image/png'}});}}
 const handle=factory(()=>admin,R2,{env:{get:name=>env[name]}},...Object.values(access));return {handle,operations,get reserved(){return reserved},get verified(){return verified}};
}
function upload(headers={'content-type':'image/png',authorization:'Bearer jwt'},bytes=new Uint8Array([137,80,78,71,13,10,26,10])){return new Request(`https://local?action=upload&bookId=${bookId}&episodeNo=6`,{method:'POST',headers,body:bytes});}
test('not configured status is explicit and uploads do not touch R2',async()=>{const s=setup({configured:false});assert.deepEqual(await (await s.handle(new Request('https://local?action=status'))).json(),{ok:true,configured:false,enabled:false});assert.equal((await s.handle(upload())).status,503);assert.deepEqual(s.operations,[]);});
test('upload needs a verified nonanonymous owner',async()=>{for(const options of [{user:null},{user:{id:'owner',is_anonymous:true}},{owner:'other'}]){const s=setup(options);assert.ok([401,403].includes((await s.handle(upload())).status));assert.deepEqual(s.operations,[]);}});
test('successful upload reserves exact bytes, verifies remote object, then marks ready',async()=>{const s=setup();const response=await s.handle(upload());assert.equal(response.status,200);assert.equal((await response.json()).assetId,id);assert.deepEqual(s.operations,['reserve','PUT','HEAD']);assert.equal(s.reserved.p_bytes,8);assert.equal(s.reserved.p_total_limit,null);assert.equal(s.verified,true);});
test('deduplicated ready asset needs no second R2 write',async()=>{const s=setup({ready:true});assert.equal((await s.handle(upload())).status,200);assert.deepEqual(s.operations,['reserve']);});
test('failed PUT or HEAD never marks a reference usable',async()=>{for(const options of [{putOK:false},{headOK:false}]){const s=setup(options);assert.equal((await s.handle(upload())).status,503);assert.equal(s.verified,false);}});
test('configured quota rejects before R2 write',async()=>{const s=setup({quotaError:true});assert.equal((await s.handle(upload())).status,409);assert.deepEqual(s.operations,['reserve']);});
test('raster type spoofing fails before reservation',async()=>{const s=setup();assert.equal((await s.handle(upload(undefined,new TextEncoder().encode('<svg>')))).status,400);assert.deepEqual(s.operations,[]);});
test('guest can read a live free image through private proxy with no shared cache',async()=>{const s=setup({user:null});const response=await s.handle(new Request(`https://local?action=read&id=${id}`));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal((await response.arrayBuffer()).byteLength,8);});
