/* ==========================================
   YOUTUPOST — Service Worker
   PWA Offline Shell
   ========================================== */

const CACHE_NAME = 'youtupost-v2';

// Resolve paths relative to the service worker location
function resolvePath(path) {
  return new URL(path, self.location.href).pathname;
}

const ASSET_PATHS = [
  './',
  './index.html',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/animations.css',
  './css/forms.css',
  './css/modals.css',
  './css/themes.css',
  './css/responsive.css',
  './js/app.js',
  './js/state.js',
  './js/storage.js',
  './js/utils.js',
  './js/router.js',
  './js/icons.js',
  './manifest.json',
];

const ASSETS = ASSET_PATHS.map(resolvePath);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {
        console.log('Some assets could not be cached');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
