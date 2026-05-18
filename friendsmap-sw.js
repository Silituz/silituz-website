const SOCIAL_ORGANIZER_CACHE = 'social-organizer-shell-v1';
const SOCIAL_ORGANIZER_SHELL = [
  '/organizer/',
  '/en/organizer/',
  '/assets/friendsmap/manifest.webmanifest',
  '/assets/friendsmap/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SOCIAL_ORGANIZER_CACHE)
      .then((cache) => cache.addAll(SOCIAL_ORGANIZER_SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('social-organizer-') && key !== SOCIAL_ORGANIZER_CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  const isOrganizerPage = url.pathname === '/organizer/' || url.pathname === '/en/organizer/';
  const isOrganizerAsset = url.pathname.startsWith('/assets/friendsmap/');

  if (request.mode === 'navigate' && isOrganizerPage) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SOCIAL_ORGANIZER_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/organizer/')))
    );
    return;
  }

  if (isOrganizerAsset) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(SOCIAL_ORGANIZER_CACHE).then((cache) => cache.put(request, copy));
        return response;
      }))
    );
  }
});
