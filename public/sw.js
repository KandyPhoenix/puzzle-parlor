const C='puzzle-parlor-d51aea85b5';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./index.html','./manifest.webmanifest','./icon-192.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/api/')) return;
  const page=e.request.mode==='navigate'||u.pathname.endsWith('index.html')||u.pathname.endsWith('/');
  if(page){ // network first so updates arrive; fall back to cache offline
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res})));
});
