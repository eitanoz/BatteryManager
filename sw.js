// Cell Watch Live — minimal service worker.
// Just enough to make the page installable and let the app shell open
// instantly (offline shows the last-loaded shell; live data still needs
// a connection to Supabase, same as any live app).
const CACHE = "cell-watch-shell-v5";
const SHELL = ["index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  var url = new URL(event.request.url);
  // Never cache Supabase API calls — the whole point is live data.
  if (url.pathname.startsWith("/rest/v1/")) return;
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
