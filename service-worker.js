const CACHE = "zeljezni-dnevnik-v23";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./images/assisted-pull-up.png",
  "./images/chest-press.png",
  "./images/leg-press.png",
  "./images/shoulder-press.png",
  "./images/iron-cover.png",
  "./images/iron-cover-clean-v12.png",
  "./images/iron-weight-texture-clean-v13.png",
  "./images/iron-weight-texture.png",
  "./images/iron-weight-texture-hd.png",
  "./images/iron-weight-texture-clean.png",
  "./images/iron-weight-texture-v11.png"
];
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const isAppShell = event.request.mode === "navigate" || event.request.url.endsWith("/index.html") || event.request.url.endsWith("/");
  if (isAppShell) {
    // Network-first for the app shell: always try to get the latest build first.
    // Only fall back to the cached copy when actually offline.
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }
  // Static assets (icons, images): cache-first is fine, they rarely change.
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy));
        return response;
      })
    )
  );
});
