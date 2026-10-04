import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {stripTypeScriptTypes} from 'node:module';
import {createRequire} from 'node:module';
const lib=createRequire(import.meta.url)('pdf-lib');
const watermarkSource=stripTypeScriptTypes(readFileSync('supabase/functions/book-downloads/watermark.ts','utf8').replace(/^import .*;\n/gm,'')).replace(/export /g,'');
const watermark=new Function(...Object.keys(lib),watermarkSource+';return {watermarkPdf,loadPublication,PDF_LIMIT};')(...Object.values(lib));
const publicationSourceCode=stripTypeScriptTypes(readFileSync('supabase/functions/book-downloads/publication.ts','utf8')).replace(/export /g,'');
const publication=new Function(publicationSourceCode+';return {PURCHASE_LANGUAGES,publicationSource,translationChunks,translatePublicationChunk};')();
import * as access from '../supabase/functions/book-downloads/access.ts';
const book={id:'b1681ea4-7b32-4e76-a640-a4c5d288d1d6',owner_id:'owner',published:true,completed:true,price:4900,age_rating:'all',title:'책'},user={id:'buyer'};
const order={id:'f1681ea4-7b32-4e76-a640-a4c5d288d1d6',buyer_id:user.id,book_id:book.id,product_key:'book:'+book.id,status:'confirmed',environment:'test'};
const document=await lib.PDFDocument.create();document.addPage().drawText('Original text');const pdf=await document.save();
test('whole-book approval unlocks all PDF languages at the same book price',()=>{assert(access.canDownload({book,user,orders:[order]}));assert.equal(book.price,4900)});
test('pending, failed, live, episode-only, other-user and other-book orders never grant test file access',()=>{for(const change of [{status:'pending'},{status:'failed'},{environment:'live'},{product_key:'episode:'+book.id+':6'},{buyer_id:'other'},{book_id:'other'}])assert.equal(access.canDownload({book,user,orders:[{...order,...change}]}),false)});
test('guest and anonymous accounts cannot download, while verified owner can preview draft files',()=>{assert.equal(access.canDownload({book,orders:[order]}),false);assert.equal(access.canDownload({book,user:{...user,is_anonymous:true},orders:[order]}),false);assert(access.canDownload({book:{...book,published:false},user:{id:'owner'},orders:[]}))});
test('adult purchases require both current verification and approved review',()=>{const adult={...book,age_rating:'19',adult_review_status:'approved'};assert.equal(access.canDownload({book:adult,user,orders:[order]}),false);assert(access.canDownload({book:adult,user,orders:[order],adultVerified:true}));assert.equal(access.canDownload({book:{...adult,adult_review_status:'pending'},user,orders:[order],adultVerified:true}),false)});
test('signature check rejects HTML and arbitrary ZIP renamed PDF or EPUB',()=>{assert.equal(access.publicationMime(pdf,'pdf'),'application/pdf');assert.equal(access.publicationMime(new TextEncoder().encode('<script>bad</script>'),'pdf'),null);assert.equal(access.publicationMime(new Uint8Array([80,75,3,4]),'epub'),null);const epub=new Uint8Array(58);epub.set([80,75,3,4]);epub[26]=8;epub.set(new TextEncoder().encode('mimetypeapplication/epub+zip'),30);assert.equal(access.publicationMime(epub,'epub'),'application/epub+zip')});
let source=readFileSync('supabase/functions/book-downloads/index.ts','utf8').replace(/^import .*;\n/gm,'').replace('Deno.serve(handle);','');source=stripTypeScriptTypes(source);
const factory=new Function('createClient','AwsClient','Deno',...Object.keys(access),...Object.keys(watermark),...Object.keys(publication),source.replace('export async function handle','async function handle')+'\nreturn handle;');
const id='e1681ea4-7b32-4e76-a640-a4c5d288d1d6';
function setup({account=user,orders=[order],storedBook=book,headOK=true,format='pdf',content=pdf,stamp=watermark.watermarkPdf}={}){
 const operations=[];let upserted=null,hash='',size=0;
 const file={id,book_id:book.id,language:'ko',format,filename:'책_ko.pdf',object_key:'downloads/private',byte_size:pdf.length};
 const records={books:[storedBook],payment_orders:orders,book_download_files:[file],adult_verifications:[],episodes:[{id:'episode',book_id:book.id,published:true,episode_no:1,title:'첫 장',body:'공개된 첫 문단\n두 번째 문단'}]};
 function from(table){const filters=[];const q={select(){return q},eq(k,v){filters.push([k,v]);return q},order(){return q},upsert(row){upserted=row;return q},then(resolve){resolve({data:(records[table]||[]).filter(row=>filters.every(([k,v])=>row[k]===v)),error:null,count:(records[table]||[]).filter(row=>filters.every(([k,v])=>row[k]===v)).length})},async maybeSingle(){return {data:(records[table]||[]).find(row=>filters.every(([k,v])=>row[k]===v))||null,error:null}}};return q;}
 const admin={auth:{async getUser(){return{data:{user:account}}}},from};
 class R2{async fetch(url,options={}){operations.push(options.method||'GET');if(options.method==='PUT'){size=options.body.length;hash=options.headers['x-amz-meta-sha256'];return new Response('')}if(options.method==='HEAD')return new Response(null,{status:headOK?200:503,headers:{'content-length':String(size),'x-amz-meta-sha256':hash}});return new Response(content)}}
 const env={SUPABASE_URL:'https://local',SUPABASE_SERVICE_ROLE_KEY:'server-only',PYEODA_R2_ACCOUNT_ID:'a'.repeat(32),PYEODA_R2_ACCESS_KEY_ID:'key',PYEODA_R2_SECRET_ACCESS_KEY:'secret',PYEODA_R2_PRIVATE_BUCKET:'private-files',PYEODA_R2_UPLOADS_ENABLED:'true'};
 const handle=factory(()=>admin,R2,{env:{get:k=>env[k]}},...Object.values(access),...Object.values({...watermark,watermarkPdf:stamp}),...Object.values(publication));return {handle,operations,get upserted(){return upserted}};
}
function request(action,options={}){return new Request('https://local?action='+action+'&bookId='+book.id+'&id='+id+'&language=ko&format=pdf',{headers:{authorization:'Bearer test'},...options})}
test('unpaid buyer and guest are denied before any R2 read',async()=>{for(const options of [{orders:[]},{account:null}]){const f=setup(options);assert.ok([401,403].includes((await f.handle(request('read'))).status));assert.deepEqual(f.operations,[])}});
test('catalog reveals file choices but no object keys or reusable download URLs',async()=>{const f=setup({account:null});const response=await f.handle(request('list'));const data=await response.json();assert.equal(response.status,200);assert.equal(data.canDownload,false);assert.equal(data.price,4900);assert(!JSON.stringify(data).includes('object_key'));assert(!JSON.stringify(data).includes('downloads/private'));assert.deepEqual(f.operations,[])});
test('authenticated paid download proxies bytes with private caching and correct attachment type',async()=>{const f=setup();const response=await f.handle(request('read'));assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/pdf');assert.equal(response.headers.get('cache-control'),'private, no-store');assert(response.headers.get('content-disposition').startsWith('attachment;'));const output=new Uint8Array(await response.arrayBuffer());assert.notDeepEqual(output,pdf);assert.equal((await lib.PDFDocument.load(output)).getPageCount(),1)});
test('file ID from another book cannot be downloaded using an owned book entitlement',async()=>{const f=setup();const req=new Request('https://local?action=read&bookId='+book.id+'&id=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',{headers:{authorization:'Bearer test'}});assert.equal((await f.handle(req)).status,404);assert.deepEqual(f.operations,[])});
test('nonowner upload fails before bytes are stored',async()=>{const f=setup();assert.equal((await f.handle(request('upload',{method:'POST',body:pdf}))).status,403);assert.equal(f.upserted,null);assert.deepEqual(f.operations,[])});
test('owner upload verifies the R2 object before recording the downloadable file',async()=>{const f=setup({account:{id:'owner'}});assert.equal((await f.handle(request('upload',{method:'POST',body:pdf}))).status,200);assert.deepEqual(f.operations,['PUT','HEAD']);assert.equal(f.upserted.book_id,book.id);assert.equal(f.upserted.byte_size,pdf.length)});
test('failed storage verification preserves the previous registered file',async()=>{const f=setup({account:{id:'owner'},headOK:false});assert.equal((await f.handle(request('upload',{method:'POST',body:pdf}))).status,503);assert.equal(f.upserted,null)});

test('buyer watermark uses the server order, ignoring a forged URL reference',async()=>{
 let used;const f=setup({stamp:async(bytes,ref)=>{used=ref;return watermark.watermarkPdf(bytes,ref)}});
 const req=new Request(request('read').url+'&reference=ORDER+FORGED',{headers:{authorization:'Bearer test'}});
 assert.equal((await f.handle(req)).status,200);assert.equal(used,'ORDER '+order.id);
});
test('author preview is marked without a buyer order or personal data',async()=>{
 let used;const f=setup({account:{id:'owner'},orders:[],stamp:async(bytes,ref)=>{used=ref;return watermark.watermarkPdf(bytes,ref)}});
 assert.equal((await f.handle(request('read'))).status,200);assert.equal(used,'AUTHOR PREVIEW');
});
test('EPUB is excluded from the catalog and direct read',async()=>{
 const f=setup({format:'epub'});assert.deepEqual((await(await f.handle(request('list'))).json()).files,[]);
 assert.equal((await f.handle(request('read'))).status,404);assert.deepEqual(f.operations,[]);
});
test('EPUB upload is rejected before storage',async()=>{
 const f=setup({account:{id:'owner'}});const req=new Request(request('upload').url.replace('format=pdf','format=epub'),{method:'POST',body:pdf,headers:{authorization:'Bearer test'}});
 assert.equal((await f.handle(req)).status,400);assert.deepEqual(f.operations,[]);
});
test('watermark failure never returns unmarked source bytes',async()=>{
 const f=setup({stamp:async()=>{throw new Error('STAMP_FAILED')}}),response=await f.handle(request('read'));
 assert.equal(response.status,503);assert.equal(response.headers.get('content-type'),'application/json');assert.notDeepEqual(new Uint8Array(await response.arrayBuffer()),pdf);
});
test('corrupt PDF upload is rejected before storing a false signature',async()=>{
 const f=setup({account:{id:'owner'}});assert.equal((await f.handle(request('upload',{method:'POST',body:new TextEncoder().encode('%PDF-1.7\nBROKEN')}))).status,400);assert.deepEqual(f.operations,[]);
});
test('watermark preserves crop boxes, rotation, and original page count',async()=>{
 const d=await lib.PDFDocument.create();for(const rotation of [0,90,180,270]){const p=d.addPage([500,700]);p.setCropBox(20,30,460,640);p.setRotation(lib.degrees(rotation));p.drawText('Original retained');}
 const original=await d.save(),output=await watermark.watermarkPdf(original,'ORDER '+order.id),loaded=await lib.PDFDocument.load(output);
 assert.equal(loaded.getPageCount(),4);for(let i=0;i<4;i++){assert.equal(loaded.getPage(i).getRotation().angle,i*90);assert.deepEqual(loaded.getPage(i).getCropBox(),d.getPage(i).getCropBox());}assert.notDeepEqual(original,output);
});
test('missing order reference and oversized PDFs fail closed',async()=>{
 await assert.rejects(watermark.watermarkPdf(pdf,'ORDER undefined'),/INVALID_REFERENCE/);
 await assert.rejects(watermark.loadPublication(new Uint8Array(watermark.PDF_LIMIT+1)),/FILE_TOO_LARGE/);
});

test('automatic catalog offers every language without author file registration',async()=>{
 const f=setup({account:null});const data=await(await f.handle(request('catalog'))).json();assert.equal(data.automatic,true);assert.equal(data.hasSource,true);assert.deepEqual(data.languages,['ko','en','ja','zh']);assert.equal(data.canDownload,false);assert(!('publication' in data));assert.deepEqual(f.operations,[]);
});
test('approved whole-book buyer receives canonical published source and source fingerprint',async()=>{
 const f=setup();const data=await(await f.handle(request('source'))).json();assert.equal(data.ok,true);assert.match(data.sourceHash,/^[0-9a-f]{64}$/);assert(data.publication.items.some(x=>x.text==='공개된 첫 문단'));assert.deepEqual(f.operations,[]);
});
test('unpaid buyers cannot obtain source, translate, or stamp arbitrary PDFs',async()=>{
 for(const action of ['source','translate','stamp']){const f=setup({orders:[]});const options=action==='source'?{}:{method:'POST',body:pdf};assert.equal((await f.handle(request(action,options))).status,403);assert.deepEqual(f.operations,[]);}
});
test('automatic generated PDF is stamped with approved order and never requires an R2 file',async()=>{
 let used;const f=setup({stamp:async(bytes,ref)=>{used=ref;return watermark.watermarkPdf(bytes,ref)}});const response=await f.handle(request('stamp',{method:'POST',body:pdf}));assert.equal(response.status,200);assert.equal(used,'ORDER '+order.id);assert.deepEqual(f.operations,[]);assert.notDeepEqual(new Uint8Array(await response.arrayBuffer()),pdf);
});
test('translation rejects stale source fingerprint before any provider call',async()=>{
 const f=setup();const url=new URL(request('translate').url);url.searchParams.set('language','en');url.searchParams.set('chunk','0');url.searchParams.set('sourceHash','stale');const req=new Request(url,{method:'POST',headers:{authorization:'Bearer test'}});assert.equal((await f.handle(req)).status,409);
});
