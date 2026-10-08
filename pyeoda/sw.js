const CACHE='pyeoda-r2-compatible-homematch47';
const CORE=['../pyeoda/creator-ui.js?v=homematch47','../pyeoda/music-theme.css?v=homematch47','../pyeoda/music-ui.js?v=homematch47','../pyeoda/manuscript-assets.js','../pyeoda/hero-sky.js?v=sky14','../pyeoda/adult-section.js?v=adult4','./','./index.html','./server-config.js','./manifest.webmanifest','./icon-180.png?v=books1','./icon-192.png?v=books1','./icon-512.png?v=books1'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pyeoda-r2-compatible-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin) return;
  event.respondWith(fetch(event.request,{cache:'no-cache'}).then(response=>{
    if(response.ok){const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}
    return response;
  }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});





