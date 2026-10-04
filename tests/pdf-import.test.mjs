import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json');
const {PDFDocument,StandardFonts,rgb}=require('pdf-lib');
const {createCanvas,DOMMatrix,ImageData,Path2D}=require('@napi-rs/canvas');
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});
const pdfjs=await import('../pyeoda/vendor/pdfjs/pdf.min.mjs');
const source=fs.readFileSync('pyeoda/pdf-import.js','utf8');
const assets=JSON.parse(fs.readFileSync('pyeoda/vendor/pdfjs/assets.json','utf8'));
async function pdf(scanned=false){const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);for(let i=1;i<=2;i++){const page=doc.addPage([300,400]);if(scanned)page.drawRectangle({x:20,y:20,width:200,height:200,color:rgb(i/3,.2,.7)});else page.drawText('Page '+i,{x:20,y:340,font,size:20});}return Buffer.from(await doc.save())}
function fixture(){
 const controls={},events={};let quota=false,context='book:1',storage=[],current=1,toasts=[];
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.disabled=false;this.value='';this.open=false;this.classList={remove(){}}}
  append(...e){this.children.push(...e)}prepend(...e){this.children.unshift(...e)}replaceChildren(...e){this.children=e;this.textContent=''}
  setAttribute(k,v){this[k]=v}removeAttribute(k){delete this[k]}
  addEventListener(k,v){this.listeners[k]=v}querySelector(s){return controls[s]||null}
  querySelectorAll(s){return s==='input'?controls.inputs:[]}
  showModal(){this.open=true}close(){this.open=false;this.listeners.close?.()}
  get outerHTML(){return this.tag==='img'?`<img src="${this.src}" alt="${this.alt}" width="${this.width}" height="${this.height}">`:`<div>${this.children.map(e=>e.outerHTML).join('')}</div>`}
  set innerHTML(v){if(this.tag==='dialog'){for(const key of ['[data-name]','[data-status]','[data-first]','[data-last]','[data-help]','.pdf-import-preview','[data-cancel]','[data-import]'])controls[key]=new Element('div');controls['[data-first]'].value=1;controls['[data-last]'].value=1;controls.text=new Element('input');controls.text.value='text';controls.text.checked=true;controls.images=new Element('input');controls.images.value='images';controls.inputs=[controls.text,controls.images,controls['[data-first]'],controls['[data-last]']];}}
 }
 const group=new Element('div'),panel=new Element('div'),body=new Element('div');body.closest=()=>panel;
 const doc={currentScript:{src:'file://'+process.cwd()+'/pyeoda/pdf-import.js'},head:new Element('head'),body:new Element('body'),querySelector:s=>s==='.markdown-import-tools'?group:null,createElement:tag=>tag==='canvas'?createCanvas(1,1):new Element(tag)};
 const dialogSelector=Element.prototype.querySelector;Element.prototype.querySelector=function(s){if(s==='input[name=pdfImportMode]:checked')return controls.images.checked?controls.images:controls.text;if(s==='input[value="images"]')return controls.images;if(s==='input[value="text"]')return controls.text;return dialogSelector.call(this,s)};
 const existing={no:1,title:'기존',body:'기존 원고',published:false};
 const ctx=vm.createContext({window:{PyeodaPdfJs:pdfjs,PyeodaPdfWorker:new URL('../pyeoda/vendor/pdfjs/pdf.worker.min.mjs',import.meta.url).href,PyeodaPdfAssets:assets},document:doc,URL,Uint8Array,TextDecoder,atob,console,
  manuscriptImportBusy:false,manuscriptImageBusy:false,manualEpisodeSaveBusy:false,manuscriptComposing:false,body,currentEpisodeNo:1,episodes:[existing],
  manuscriptImportContext:()=>context,currentBookData:()=>({title:'test'}),findEpisode:()=>existing,isBookCompleted:()=>false,toast:t=>toasts.push(t),
  saveCurrentEpisode:()=>true,persistEpisodes(){if(quota&&ctx.episodes.length>storage.length)throw new DOMException('full','QuotaExceededError');storage=JSON.parse(JSON.stringify(ctx.episodes));},preferredPaidEpisodePrice:()=>100,
  openEpisode(no){ctx.currentEpisodeNo=no;current=no},focusNewEpisodeWriting(){},editorStatus:{textContent:''}});
 vm.runInContext(source,ctx);const dialog=doc.body.children[0],input=group.children[1];storage=[existing];
 return {ctx,controls,dialog,toasts,extract:ctx.window.PyeodaPdfImportText,get stored(){return storage},set quota(v){quota=v},changeContext(){context='another:1'},async open(bytes,name='test.pdf'){input.files=[{name,size:bytes.length,arrayBuffer:async()=>Uint8Array.from(bytes).buffer}];input.onchange();for(let i=0;i<10000;i++){if(controls['[data-status]'].textContent?.includes('선택')||(!controls['[data-import]'].disabled&&dialog.open)||controls['[data-status]'].textContent?.includes('올바른'))return;await new Promise(setImmediate)}throw Error('preview timed out: '+controls['[data-status]'].textContent)},async commit(){await controls['[data-import]'].onclick()},cancel(){dialog.close()}};
}
test('PDF text extraction retains Korean syllables, spaces and paragraph gaps',()=>{const f=fixture();assert.equal(f.extract([{str:'한글',transform:[1,0,0,14,10,100],height:14,width:28},{str:'원고',transform:[1,0,0,14,44,100],height:14,width:28},{str:'다음 문단',transform:[1,0,0,14,10,60],height:14,width:60}]),'한글 원고\n\n다음 문단')});
test('real PDF.js extracts a two-page PDF into one new unpublished episode',async()=>{const f=fixture();await f.open(await pdf());assert(f.controls['.pdf-import-preview'].textContent.includes('Page 2'));await f.commit();assert.equal(f.ctx.episodes.length,2);assert.equal(f.ctx.episodes[0].body,'기존 원고');assert.equal(f.ctx.episodes[1].body,'Page 1\n\nPage 2');assert.equal(f.ctx.episodes[1].published,false);assert.equal(f.dialog.open,false)});
test('scanned pages render to JPEG and preserve page order in new episodes',async()=>{const f=fixture();await f.open(await pdf(true));assert.equal(f.controls.images.checked,true);await f.commit();assert.equal(f.ctx.episodes.length,3);assert.match(f.ctx.episodes[1].title,/1쪽$/);assert.match(f.ctx.episodes[2].title,/2쪽$/);assert(f.ctx.episodes[1].bodyHtml.includes('data:image/jpeg;base64,'));assert(f.ctx.episodes[1].bodyHtml.length<600000);assert.equal(f.ctx.episodes[0].body,'기존 원고')});
test('cancel and changed book context never append imported episodes',async()=>{const f=fixture();await f.open(await pdf());f.cancel();assert.equal(f.ctx.episodes.length,1);await f.open(await pdf());f.changeContext();await f.commit();assert.equal(f.ctx.episodes.length,1);assert(f.controls['[data-status]'].textContent.includes('바뀌었습니다'));f.cancel()});
test('storage exhaustion rolls back new episodes and keeps the old draft selected',async()=>{const f=fixture();await f.open(await pdf());f.quota=true;await f.commit();assert.equal(f.ctx.episodes.length,1);assert.equal(f.ctx.currentEpisodeNo,1);assert.equal(f.stored[0].body,'기존 원고');assert(f.controls['[data-status]'].textContent.includes('저장 공간'));f.cancel()});
test('malformed PDF is rejected before any draft mutation',async()=>{const f=fixture();await f.open(Buffer.from('invalid'));assert.equal(f.controls['[data-import]'].disabled,true);assert.equal(f.ctx.episodes.length,1);f.cancel()});
