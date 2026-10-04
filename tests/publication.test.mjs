import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {stripTypeScriptTypes} from 'node:module';
const source=stripTypeScriptTypes(readFileSync('supabase/functions/book-downloads/publication.ts','utf8')).replace(/export /g,'');
const make=env=>new Function('Deno',source+';return {chapterParts,publicationSource,translationChunks,validateTranslation,translatePublicationChunk};')({env:{get:()=>env}});
const p=make('');
test('rich manuscript preserves text and private image order while dropping executable blocks',()=>{
 const parts=p.chapterParts({body_html:'<p>첫 <b>문단</b></p><img data-pyeoda-asset="e1681ea4-7b32-4e76-a640-a4c5d288d1d6" src="placeholder"><p>다음 &amp; 끝</p><script>DROP</script>'});assert.deepEqual(parts.map(x=>x.type),['text','image','text']);assert.equal(parts[0].text,'첫 문단');assert.equal(parts[1].assetId,'e1681ea4-7b32-4e76-a640-a4c5d288d1d6');assert.equal(parts[2].text,'다음 & 끝');
});
test('long Unicode prose is fully preserved and bounded for translation',()=>{
 const text='한글😀'.repeat(1800),book=p.publicationSource({title:'책',pen_name:'작가'},[{episode_no:1,title:'장',body:text}]);const chunks=p.translationChunks(book.items);assert.equal(book.items.filter(x=>x.type==='text').map(x=>x.text).join(''),text);assert(chunks.every(x=>x.reduce((n,s)=>n+s.text.length,0)<=3000));assert(book.items.filter(x=>x.type==='text').every(x=>!/[\uD800-\uDBFF]$/.test(x.text)));
});
test('translation result must cover every source ID exactly once; no fallback to Korean',()=>{
 const items=[{id:'1',text:'하나'},{id:'2',text:'둘'}];assert.throws(()=>p.validateTranslation(items,[{id:'1',text:'one'}]),/INCOMPLETE/);assert.throws(()=>p.validateTranslation(items,[{id:'1',text:'one'},{id:'1',text:'two'}]),/INCOMPLETE/);assert.throws(()=>p.validateTranslation(items,[{id:'1',text:'one'},{id:'2',text:''}]),/INCOMPLETE/);assert.deepEqual(p.validateTranslation(items,[{id:'2',text:'two'},{id:'1',text:'one'}]),[{id:'1',text:'one'},{id:'2',text:'two'}]);
});
test('missing translation configuration fails before cache or API mutation',async()=>{await assert.rejects(p.translatePublicationChunk(null,'book','hash','en',0,[]),/NOT_CONFIGURED/)});
function cache(initial={}){
 let row={content:null,attempts:0,locked_until:'1970-01-01',...initial},providerCalls=0;
 const admin={from(){let checks=[],updates=null;const q={upsert(){return Promise.resolve({error:null})},select(){return q},update(v){updates=v;return q},eq(k,v){checks.push(r=>r[k]===v);return q},lt(k,v){checks.push(r=>r[k]<v);return q},is(k,v){checks.push(r=>r[k]===v);return q},maybeSingle:async()=>{if(!checks.every(c=>c(row)))return{data:null,error:null};if(updates)Object.assign(row,updates);return{data:{...row},error:null}},then(resolve){if(checks.every(c=>c(row))&&updates)Object.assign(row,updates);resolve({error:null})}};return q;}};return{admin,get row(){return row}};
}
test('cached translation returns without another paid provider call',async()=>{
 const c=cache({book_id:'book',source_hash:'hash',language:'en',chunk_no:0,content:[{id:'1',text:'one'}]});const result=await make('key').translatePublicationChunk(c.admin,'book','hash','en',0,[{id:'1',text:'하나'}]);assert.deepEqual(result.items,[{id:'1',text:'one'}]);
});
test('active lease prevents concurrent duplicate translation requests',async()=>{
 const c=cache({book_id:'book',source_hash:'hash',language:'en',chunk_no:0,locked_until:'9999-01-01'});assert.deepEqual(await make('key').translatePublicationChunk(c.admin,'book','hash','en',0,[{id:'1',text:'하나'}]),{processing:true});assert.equal(c.row.attempts,0);
});
test('successful provider translation is saved under the claimed source version',async()=>{
 const c=cache({book_id:'book',source_hash:'hash',language:'en',chunk_no:0}),before=globalThis.fetch;let called=0;
 globalThis.fetch=async(url,options)=>{called++;const input=JSON.parse(options.body);assert.equal(input.store,false);assert.equal(input.response_format.type,'json_schema');return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({items:[{id:'1',text:'one'}]})}}]}));};
 try{assert.deepEqual((await make('key').translatePublicationChunk(c.admin,'book','hash','en',0,[{id:'1',text:'하나'}])).items,[{id:'1',text:'one'}]);assert.equal(called,1);assert.deepEqual(c.row.content,[{id:'1',text:'one'}]);assert.equal(c.row.attempts,1);}finally{globalThis.fetch=before}
});
test('incomplete provider response releases the lease and never saves Korean as translated content',async()=>{
 const c=cache({book_id:'book',source_hash:'hash',language:'ja',chunk_no:0}),before=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'{"items":[]}'}}]}));
 try{await assert.rejects(make('key').translatePublicationChunk(c.admin,'book','hash','ja',0,[{id:'1',text:'하나'}]),/INCOMPLETE/);assert.equal(c.row.content,null);assert.equal(c.row.locked_until,new Date(0).toISOString());}finally{globalThis.fetch=before}
});
