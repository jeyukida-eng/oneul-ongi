const CACHE='pyeoda-r2-compatible-v14-20261003-theme3-book2-wordmark3';
const CORE=['../pyeoda/manuscript-assets.js','../pyeoda/hero-sky.js?v=sky7','../pyeoda/adult-section.js?v=adult2','./','./index.html','./server-config.js','./manifest.webmanifest','./icon-180.png?v=wordmark3','./icon-192.png?v=wordmark3','./icon-512.png?v=wordmark3'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin) return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
    return response;
  }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});



