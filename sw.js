/* SN CLINIC offline support: opens from the saved copy first (works with no internet), then refreshes the copy in the background */
var C = 'sn-clinic-v2', A = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  /* one missing file must never stop the install, so each file is cached on its own */
  e.waitUntil(caches.open(C).then(function (c) {
    return Promise.all(A.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(e.request).then(function (r) {
      if (r && (r.ok || r.type === 'opaque')) { var cp = r.clone(); caches.open(C).then(function (c) { c.put(e.request, cp); }); }
      return r;
    }).catch(function () { return null; });
    e.waitUntil(net);
    return hit || net.then(function (r) { return r || caches.match('index.html'); });
  }));
});
