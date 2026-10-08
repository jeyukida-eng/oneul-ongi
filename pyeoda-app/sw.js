const CACHE='pyeoda-writing-scroll50';
const CORE=['../pyeoda/creator-ui.js?v=scroll50','../pyeoda/music-theme.css?v=scroll50','../pyeoda/music-ui.js?v=scroll50','../pyeoda/mobile-editor.js?v=write5','../pyeoda/manuscript-assets.js','../pyeoda/hero-sky.js?v=sky14','../pyeoda/adult-section.js?v=adult4','./','./index.html','./server-config.js','./manifest.webmanifest','./icon-180.png?v=books1','./icon-192.png?v=books1','./icon-512.png?v=books1'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pyeoda-writing-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const u=new URL(event.request.url);
 if(u.origin!==self.location.origin)return;
 event.respondWith(fetch(event.request,{cache:'no-cache'}).then(res=>{
   if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}return res;
 }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});





