const CACHE = "silituz-preview-v2";
const APP_SHELL = [
  "/",
  "/offline.html",
  "/assets/css/custom.css",
  "/assets/css/lil-sili.css",
  "/assets/css/silituz-modern.css",
  "/assets/js/silituz-modern.js",
  "/assets/js/lil-sili.js",
  "/assets/images/favicon-192.png",
  "/assets/images/favicon-512.png",
  "/assets/images/lil-sili-cute-v2.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(APP_SHELL);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(function (response) {
      const clone = response.clone();
      caches.open(CACHE).then(function (cache) { cache.put(event.request, clone); });
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) { return cached || caches.match("/offline.html"); });
    }));
    return;
  }
  event.respondWith(caches.match(event.request).then(function (cached) {
    return cached || fetch(event.request).then(function (response) {
      if (response.ok && ["style", "script", "image", "font"].includes(event.request.destination)) {
        const clone = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, clone); });
      }
      return response;
    });
  }));
});
