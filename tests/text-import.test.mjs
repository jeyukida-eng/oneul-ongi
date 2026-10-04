import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function fixture(file='pyeoda/index.html',accept=true){
 let source=fs.readFileSync(file,'utf8');if(file.includes('mobile-preview'))source=source.match(/id="mobile-source">([\s\S]*?)<\/script>/)[1].replaceAll('<\\/script','</script');
 const script=source.slice(source.indexOf('let manuscriptImportBusy=false;'),source.indexOf('function bindMarkdownManuscriptImport(){'));
 const elements={},store=new Map(),ep={no:1,body:'기존 원고'},body={innerText:'기존 원고',querySelector:()=>null};let saves=0;
 const ctx=vm.createContext({TextDecoder,Uint8Array,console,currentBookData:()=>({title:'시험'}),currentEpisodeNo:1,manuscriptImageBusy:false,manualEpisodeSaveBusy:false,manuscriptComposing:false,findEpisode:()=>ep,
 body,episodeTitleInput:{value:'기존 제목'},editorStatus:{textContent:''},document:{getElementById:id=>elements[id]??=({})},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},window:{confirm:()=>accept},toast(){},captureManuscriptHTML:()=>'<p>'+body.innerText+'</p>',clearProofMarks(){},restoreManuscript:value=>{body.innerText=value.body},saveCurrentEpisode(){saves++;ep.body=body.innerText;return true},wc(){},focusNewEpisodeWriting(){}});
 vm.runInContext(script,ctx);return {ctx,store,get saves(){return saves},async import(name,bytes){await ctx.importMarkdownManuscript({name,size:bytes.length,arrayBuffer:async()=>Uint8Array.from(bytes).buffer})}};
}
for(const file of ['pyeoda/index.html','pyeoda-app/index.html','pyeoda-app/mobile-preview.html','downloads/pyeoda-mobile-latest.html']){
 test(file+': TXT preserves literal Markdown symbols, Korean and line breaks',async()=>{const f=fixture(file);await f.import('원고.TXT',Buffer.from('\uFEFF# 제목\r\n\r\n---\r\ntitle: 본문\r\n한글 원고'));assert.equal(f.ctx.body.innerText,'# 제목\n\n---\ntitle: 본문\n한글 원고');assert.equal(f.ctx.episodeTitleInput.value,'원고');assert(f.ctx.editorStatus.textContent.startsWith('TXT'));assert([...f.store.values()].some(v=>JSON.parse(v).body==='기존 원고'))});
 test(file+': Markdown headings retain existing import behavior',async()=>{const f=fixture(file);await f.import('원고.md',Buffer.from('# 회차 제목\n\n본문'));assert.equal(f.ctx.episodeTitleInput.value,'회차 제목');assert.equal(f.ctx.body.innerText,'본문');assert(f.ctx.editorStatus.textContent.startsWith('MD'))});
}
test('TXT supports Windows Korean ANSI (CP949) and UTF-16 BOM',async()=>{const f=fixture();await f.import('ansi.txt',Buffer.from([0xc7,0xd1,0xb1,0xdb,0x0d,0x0a,0xbf,0xf8,0xb0,0xed]));assert.equal(f.ctx.body.innerText,'한글\n원고');await f.import('unicode.txt',Buffer.concat([Buffer.from([0xff,0xfe]),Buffer.from('한글 원고','utf16le')]));assert.equal(f.ctx.body.innerText,'한글 원고')});
test('cancel replacement preserves the draft and does not save',async()=>{const f=fixture('pyeoda/index.html',false);await f.import('원고.txt',Buffer.from('새 원고'));assert.equal(f.ctx.body.innerText,'기존 원고');assert.equal(f.saves,0)});
test('empty TXT and unsupported files preserve the draft',async()=>{const f=fixture();await f.import('empty.txt',Buffer.from('  \n'));await f.import('wrong.pdf',Buffer.from('text'));assert.equal(f.ctx.body.innerText,'기존 원고');assert.equal(f.saves,0)});
