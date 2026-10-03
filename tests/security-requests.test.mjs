import fs from 'node:fs';import {stripTypeScriptTypes} from 'node:module';import vm from 'node:vm';import assert from 'node:assert/strict';import {test} from 'node:test';
function fixture(file,{user=null,error=null}={}){
 let handler,rpcCalls=0;const src=fs.readFileSync(file,'utf8').replace(/^import .*;\s*$/gm,'').replace(/export /g,'');
 const context=vm.createContext({Request,Response,Uint8Array,TextDecoder,URL,AbortSignal,crypto,Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://example.invalid':''},serve:f=>handler=f},createClient:()=>({auth:{getUser:async()=>({data:{user},error:user?null:new Error('unauthorized')})},rpc:()=>{rpcCalls++;return {single:async()=>({data:null,error:error||{message:'COVER_OWNER_REQUIRED'}})}}}),console:{error(){}},fetch:()=>{throw new Error('Unexpected paid/external call')},setTimeout,clearTimeout});
 vm.runInContext(stripTypeScriptTypes(src,{mode:'transform'}),context);return{handle:handler||context.handle,rpcCalls:()=>rpcCalls};
}
const payment='supabase/functions/confirm-test-payment/payment-core.ts';
for(const file of [payment,'supabase/functions/public-episodes/index.ts']){
 test(file+': excessive request body is rejected before external work',async()=>{const f=fixture(file);const r=await f.handle(new Request('https://example.invalid',{method:'POST',body:'x'.repeat(17000)}),'confirm');assert.equal(r.status,413);assert.equal(f.rpcCalls(),0)});
 test(file+': malformed or non-object JSON is rejected',async()=>{for(const body of ['{','null','[]']){const f=fixture(file);const r=await f.handle(new Request('https://example.invalid',{method:'POST',body}),'confirm');assert.equal(r.status,400)}});
}
test('payment approval requires a verified permanent account',async()=>{const f=fixture(payment);const r=await f.handle(new Request('https://example.invalid',{method:'POST',body:'{}'}),'confirm');assert.equal(r.status,401)});
const cover='supabase/functions/generate-cover/index.ts',uid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
test('cover generation rejects anonymous sign-in',async()=>{const f=fixture(cover,{user:{id:uid,is_anonymous:true}});const r=await f.handle(new Request('https://example.invalid',{method:'POST',headers:{authorization:'Bearer fake'},body:'{}'}));assert.equal(r.status,401);assert.equal(f.rpcCalls(),0)});
test('cover generation caps untrusted streams without a length header',async()=>{const f=fixture(cover,{user:{id:uid}});const r=await f.handle(new Request('https://example.invalid',{method:'POST',headers:{authorization:'Bearer fake'},body:'x'.repeat(33000)}));assert.equal(r.status,413);assert.equal(f.rpcCalls(),0)});
for(const [message,status] of [['COVER_OWNER_REQUIRED',403],['COVER_RATE_LIMIT',429]])test('cover reservation enforces '+message,async()=>{const f=fixture(cover,{user:{id:uid},error:{message}});const r=await f.handle(new Request('https://example.invalid',{method:'POST',headers:{authorization:'Bearer fake'},body:JSON.stringify({coverKey:uid,prompt:'A gentle pencil illustration'})}));assert.equal(r.status,status);assert.equal(f.rpcCalls(),1)});
