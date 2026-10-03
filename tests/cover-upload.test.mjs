import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {test} from 'node:test';
for(const file of ['pyeoda/index.html','pyeoda-app/index.html','downloads/pyeoda-mobile-latest.html']){
 const source=fs.readFileSync(file,'utf8');const helper=source.slice(source.indexOf('async function dataUrlBlob('),source.indexOf('async function uploadBookCoverToServer('));
 const c=vm.createContext({Blob,Uint8Array,atob,fetch:()=>{throw Error('No network conversion allowed')}});vm.runInContext(helper,c);
 test(file+': cover bytes decode without a blocked data URL request',async()=>{for(const mime of ['png','jpeg','webp']){const b=await c.dataUrlBlob('data:image/'+mime+';base64,AQIDBA==');assert.equal(b.type,'image/'+mime);assert.deepEqual([...new Uint8Array(await b.arrayBuffer())],[1,2,3,4]);}await assert.rejects(()=>c.dataUrlBlob('data:image/svg+xml;base64,AQIDBA=='));await assert.rejects(()=>c.dataUrlBlob('https://example.com/a.jpg'));});
 test(file+': upload failure is saved and shown instead of success',()=>{assert(source.includes("data.serverCoverUploadError=e?.message"));assert(source.includes('if(data.serverCoverUploadError)'));assert(source.includes("publicUrl+'?v='+Date.now()"));});
}
