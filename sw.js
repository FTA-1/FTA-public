/* FTA sw v2 — network-first for pages, cache-first for assets */
const CACHE='fta-v2';
self.addEventListener('install',function(e){ self.skipWaiting(); });
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){
      var cp=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); return res;
    }).catch(function(){ return caches.match(req); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){
    return hit || fetch(req).then(function(res){
      var cp=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); return res;
    });
  }));
});
