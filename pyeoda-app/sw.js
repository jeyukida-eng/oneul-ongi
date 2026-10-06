const CACHE='pyeoda-writing-v27-20261003-theme3-share1-book2-wordmark3-fee30';
const CORE=['../pyeoda/mobile-editor.js?v=write4','../pyeoda/manuscript-assets.js','../pyeoda/hero-sky.js?v=sky9','../pyeoda/adult-section.js?v=adult4','./','./index.html','./server-config.js','./manifest.webmanifest','./icon-180.png?v=wordmark3','./icon-192.png?v=wordmark3','./icon-512.png?v=wordmark3'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const u=new URL(event.request.url);
 if(u.origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).then(res=>{
   const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});return res;
 }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});



