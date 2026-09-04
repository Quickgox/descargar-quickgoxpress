self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('descargas-store').then((cache) => cache.addAll([
      './',
      './descarga.html',
      './descarga.css',
      './descarga.js'
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
