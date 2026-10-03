/* Private raster assets. Persist IDs, never blob URLs or signed URLs. */
(() => {
 'use strict';
 const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const PLACEHOLDER='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==';
 const inFlight=new Map();let epoch=0;
 function server(){return typeof PYEODA_SERVER==='undefined'?null:PYEODA_SERVER;}
 function reference(id){if(!UUID.test(id||''))throw new Error('그림 식별자가 올바르지 않습니다.');return 'pyeoda-asset:'+id.toLowerCase();}
 function idFromSource(source){const match=/^pyeoda-asset:([a-f0-9-]{36})$/i.exec(source||'');return match&&UUID.test(match[1])?match[1].toLowerCase():null;}
 function source(img){const id=img.getAttribute('data-pyeoda-asset');return UUID.test(id||'')?reference(id):img.getAttribute('src')||'';}
 function endpoint(params){const url=server()?.client?.supabaseUrl||window.PYEODA_SERVER_CONFIG?.url;if(!url)throw new Error('서버 연결을 확인해 주세요.');return url.replace(/\/$/,'')+'/functions/v1/manuscript-assets?'+new URLSearchParams(params);}
 async function headers(){
  const client=server()?.client;let token='';
  if(client){const {data,error}=await client.auth.getSession();if(error)throw error;token=data?.session?.access_token||'';}
  const key=client?.supabaseKey||window.PYEODA_SERVER_CONFIG?.anonKey||'';
  return {...(token?{Authorization:'Bearer '+token}:{}),...(key?{apikey:key}:{})};
 }
 async function request(params,options={}){
  const result=await fetch(endpoint(params),{...options,headers:{...await headers(),...options.headers},cache:'no-store',signal:AbortSignal.timeout(45000)});
  if(!result.ok){let error;try{error=await result.json();}catch(_){}throw new Error(error?.message||'그림을 불러오지 못했습니다. 연결을 확인해 주세요.');}
  return result;
 }
 async function dataSource(src){
  const id=idFromSource(src);if(!id)return src;
  // In-flight coalescing only. Every later read rechecks access; no long-lived
  // cross-account blob/data cache is kept here.
  const started=epoch,scope=server()?.authUser?.id||server()?.user?.id||'guest',key=scope+':'+id;
  if(inFlight.has(key))return inFlight.get(key);
  const pending=(async()=>{
   const response=await request({action:'read',id}),blob=await response.blob();
   if(!['image/png','image/jpeg','image/webp'].includes(blob.type)||blob.size>10*1024*1024)throw new Error('그림 파일 형식을 확인하지 못했습니다.');
   return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('그림을 읽지 못했습니다.'));reader.readAsDataURL(blob);});
  })();inFlight.set(key,pending);try{const result=await pending;if(started!==epoch)throw new Error('로그인 상태가 변경되었습니다. 그림을 다시 열어 주세요.');return result;}finally{if(inFlight.get(key)===pending)inFlight.delete(key);}
 }
 function canonicalize(img){
  const id=img.getAttribute('data-pyeoda-asset');if(!UUID.test(id||''))return false;
  img.setAttribute('data-pyeoda-asset',id.toLowerCase());img.setAttribute('src',PLACEHOLDER);return true;
 }
 async function hydrate(root){
  const images=[...(root?.matches?.('img[data-pyeoda-asset]')?[root]:[]),...(root?.querySelectorAll?.('img[data-pyeoda-asset]')||[])];
  await Promise.all(images.map(async img=>{
   if(img.dataset.pyeodaLoading==='true'||img.dataset.pyeodaLoaded==='true')return;
   const original=source(img);if(!idFromSource(original))return;
   img.dataset.pyeodaLoading='true';
   try{const src=await dataSource(original);if(source(img)!==original||!img.isConnected)return;img.src=src;img.dataset.pyeodaLoaded='true';img.removeAttribute('data-pyeoda-error');}
   catch(_){img.setAttribute('data-pyeoda-error','true');img.title='그림을 불러오지 못했습니다. 연결 후 다시 열어 주세요.';}
   finally{delete img.dataset.pyeodaLoading;}
  }));
 }
 async function forServer(html,bookId,episodeNo){
  if(window.PYEODA_SERVER_CONFIG?.r2ManuscriptAssets!==true)return html;
  const root=new DOMParser().parseFromString(html,'text/html').body;
  for(const img of root.querySelectorAll('img')){
   if(canonicalize(img))continue;
   const src=img.getAttribute('src')||'';if(!/^data:image\/(?:png|jpeg|webp);base64,/.test(src))throw new Error('본문 그림의 저장 형식을 확인해 주세요.');
   const blob=await (await fetch(src)).blob();
   const response=await request({action:'upload',bookId,episodeNo:String(episodeNo)},{method:'POST',headers:{'Content-Type':blob.type},body:blob});
   const result=await response.json();if(!result.ok||!UUID.test(result.assetId||''))throw new Error('그림 저장을 확인하지 못했습니다. 기존 원고는 유지됩니다.');
   img.setAttribute('data-pyeoda-asset',result.assetId);canonicalize(img);
  }
  return root.innerHTML;
 }
 async function inlineHTML(html){
  const parsed=new DOMParser().parseFromString(html,'text/html');
  if(!parsed.querySelector('img[data-pyeoda-asset]'))return html;
  for(const img of parsed.querySelectorAll('img[data-pyeoda-asset]')){img.src=await dataSource(source(img));img.removeAttribute('data-pyeoda-asset');}
  return /^\s*<!doctype|^\s*<html/i.test(html)?'<!doctype html>'+parsed.documentElement.outerHTML:parsed.body.innerHTML;
 }
 function clear(){
  epoch++;inFlight.clear();
  for(const img of document.querySelectorAll('img[data-pyeoda-asset]')){img.src=PLACEHOLDER;delete img.dataset.pyeodaLoaded;delete img.dataset.pyeodaLoading;}
  document.querySelectorAll('iframe[data-pyeoda-asset-preview="true"]').forEach(frame=>{frame.dataset.assetPreviewToken=String(Number(frame.dataset.assetPreviewToken||0)+1);frame.srcdoc='';});
  if(typeof EXPORT_IMAGE_CACHE!=='undefined')EXPORT_IMAGE_CACHE.clear();
  if(typeof EXPORT_IMAGE_DIMENSIONS!=='undefined')EXPORT_IMAGE_DIMENSIONS.clear();
 }
 window.PyeodaAssets={UUID,PLACEHOLDER,reference,idFromSource,source,canonicalize,dataSource,hydrate,forServer,inlineHTML,clear};
 // Authoritative markup retains the asset ID; changing rendered src never
 // changes what captureManuscriptHTML persists.
 const start=()=>{new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType===1)hydrate(node);}}).observe(document.body,{childList:true,subtree:true});hydrate(document.body);};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
