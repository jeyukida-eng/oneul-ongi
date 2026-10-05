import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
process.on('uncaughtException',e=>{console.error(e.name,e.message, String(e.stack).split('\n').filter(l=>l.startsWith('    at')).slice(0,3).join('\n'));process.exit(1)});
const require=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/package.json');
const {PDFDocument,StandardFonts}=require('pdf-lib');const {DOMMatrix,ImageData,Path2D,createCanvas}=require('@napi-rs/canvas');
const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica);const page=pdf.addPage([300,400]);page.drawText('Standalone PDF import works.',{x:20,y:300,font,size:15});const encoded=Buffer.from(await pdf.save()).toString('base64');
for(const filename of process.argv.slice(2)){
 const html=fs.readFileSync(filename,'utf8');const modules=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>m[1].includes('type="module"'));
 assert.equal(modules.length,2);assert(modules[0][1].includes('data-pyeoda-pdf-worker'));assert(!html.includes('window.PyeodaPdfWorker=URL.createObjectURL'));
 let requests=0,workers=0;
 const document={baseURI:'file:///PYEODA.html',documentElement:{style:{}},createElement:tag=>tag==='canvas'?createCanvas(1,1):({style:{},remove(){},append(){},setAttribute(){}})};
 const context=vm.createContext({console,DOMException,URL,URLSearchParams,Blob,Response,Headers,Request,AbortSignal,AbortController,ReadableStream,TransformStream,TextEncoder,TextDecoder,atob,btoa,setTimeout,clearTimeout,queueMicrotask,structuredClone,DOMMatrix,ImageData,Path2D,document,navigator:{userAgent:'Chrome',platform:'Win32'},encoded,
 fetch(){requests++;throw Error('External network disabled')},Worker:class{constructor(){workers++;throw Error('Opaque-origin worker blocked')}},location:{href:'file:///PYEODA.html'}});
 vm.runInContext('window=globalThis; self=globalThis;',context);
 for(let i=0;i<modules.length;i++){
  const mod=new vm.SourceTextModule(modules[i][2],{context,identifier:'file:///PYEODA.html#inline'+i,importModuleDynamically(){requests++;throw Error('Dynamic imports forbidden at opaque origin')}});await mod.link(()=>{throw Error('External import forbidden')});await mod.evaluate();
 }
 const assetScript=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].find(m=>m[2].startsWith('window.PyeodaPdfAssets='));assert(assetScript);vm.runInContext(assetScript[2],context);
 const text=await vm.runInContext(`(async()=>{const task=PyeodaPdfJs.getDocument({data:Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),isEvalSupported:false,disableFontFace:true,useWorkerFetch:false,BinaryDataFactory:class{async fetch({kind,filename}){const data=PyeodaPdfAssets[kind]?.[filename];if(!data)throw Error('Missing bundled data');return Uint8Array.from(atob(data),c=>c.charCodeAt(0))}}});const pdf=await task.promise;const page=await pdf.getPage(1);const text=(await page.getTextContent()).items.map(i=>i.str).join('');await task.destroy();return text})()`,context);
 assert.equal(text,'Standalone PDF import works.');assert.equal(requests,0);assert.equal(workers,0);
 console.log(filename,'actual embedded core + embedded worker: PDF read passed, zero fetch/import/blob worker requests');
}
