/* FTA sw v3 — network-first pages, cache same-origin static assets ONLY, never cache data/API */
const CACHE='fta-v3';
const STATIC_EXT=/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|webmanifest)$/;
self.addEventListener('install',function(e){ self.skipWaiting(); });
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  var url=new URL(req.url);
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){
      var cp=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); return res;
    }).catch(function(){ return caches.match(req); }));
    return;
  }
  var isSameOrigin=url.origin===self.location.origin;
  if(isSameOrigin && STATIC_EXT.test(url.pathname)){
    e.respondWith(caches.match(req).then(function(hit){
      return hit || fetch(req).then(function(res){
        var cp=res.clone(); caches.open(CACHE).then(function(c){ c.put(req,cp); }); return res;
      });
    }));
    return;
  }
  e.respondWith(fetch(req));
});
