const C='puzzle-parlor-fdd2d0399f';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./index.html','./manifest.webmanifest','./icon-192.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!=='puzzle-parlor-media').map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/api/')) return;
  const appPage=u.pathname==='/'||u.pathname.endsWith('/index.html');
  if(appPage){ // network first so updates arrive; fall back to the cached app offline
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put('./index.html',cp))}return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  if(e.request.mode==='navigate') return; // other pages (buy, privacy, admin) are never used as the app's offline copy
  if(e.request.cache==='no-store') return; // the offline downloader stores these itself
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res})));
});
