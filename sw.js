const CACHE_NAME='oneul-ongi-v41.0.0-dock-layout';
const ASSETS=['./','./index.html','./styles.css?v=41','./achievements-v7.css?v=41','./premium-personal-v15.js?v=41','./premium-personal-v15.css?v=41','./share-card-v19.css?v=41','./ongi-journey-v24.css?v=41','./ongi-journey-v24.js?v=41','./ongi-unified-v27.css?v=41','./layout-system-v33.css?v=41','./home-v35.css?v=41','./share-illustration-v19.webp?v=19','./share-cards/day-001.webp?v=40','./share-cards/day-002.webp?v=40','./share-cards/day-003.webp?v=40','./share-cards/day-004.webp?v=40','./share-cards/day-005.webp?v=40','./share-cards/day-006.webp?v=40','./share-cards/day-007.webp?v=40','./share-cards/day-008.webp?v=40','./share-cards/day-009.webp?v=40','./share-cards/day-010.webp?v=40','./achievements-v7.js?v=41','./app.js?v=41','./content-v6.js?v=41','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-180.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('oneul-ongi-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const u=new URL(event.request.url);
  if(u.origin!==self.location.origin)return;

  const isNavigate=event.request.mode==='navigate';
  const isVersioned=/[?&]v=\d+/.test(u.search);
  const isCode=/\.(?:css|js)$/.test(u.pathname);

  if(isNavigate||isVersioned||isCode){
    event.respondWith(
      fetch(event.request,{cache:'no-store'}).then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(c=>c.put(event.request,copy)).catch(()=>{});
          if(isNavigate){
            const copy2=response.clone();
            caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy2)).catch(()=>{});
          }
        }
        return response;
      }).catch(()=>caches.match(event.request).then(r=>r|| (isNavigate?caches.match('./index.html'):undefined)))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
