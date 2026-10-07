import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

const storyCacheName = "night-bookshop-stories-v1";
const storyPath = /^\/story\/compiled\/[a-z0-9-]+\.json$/;

// The previous worker precached every historical Ink version. Copy those
// responses before activation removes entries absent from the new manifest.
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const destination = await caches.open(storyCacheName);
    for (const name of await caches.keys()) {
      if (name === storyCacheName) continue;
      const source = await caches.open(name);
      for (const request of await source.keys()) {
        const cachedUrl = new URL(request.url);
        if (cachedUrl.origin !== self.location.origin) continue;
        const path = cachedUrl.pathname;
        if (!storyPath.test(path) || path === "/story/compiled/main.json") continue;
        if (await destination.match(path)) continue;
        const response = await source.match(request);
        if (response?.ok) await destination.put(path, response.clone());
      }
    }
  })());
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
registerRoute(
  ({ url }) => url.origin === self.location.origin && storyPath.test(url.pathname),
  new CacheFirst({ cacheName: storyCacheName }),
);
registerRoute(
  ({ url }) => url.origin === self.location.origin && /^\/images\/.*\.webp$/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "night-bookshop-chapter-images-v1",
    plugins: [new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
);
// Films and their soundtracks are cached the first time they play.
registerRoute(
  ({ url }) => url.origin === self.location.origin && /^\/video\/tea\/.*\.(?:mp4|webm|ogg|mp3)$/.test(url.pathname),
  new CacheFirst({
    cacheName: "night-bookshop-tea-films-v1",
    plugins: [new ExpirationPlugin({ maxEntries: 56, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
);
// Each night's music is cached the first time it plays; the bookshop theme is precached.
registerRoute(
  ({ url }) => url.origin === self.location.origin && /^\/audio\/music\/[a-z-]+\.(?:ogg|mp3)$/.test(url.pathname),
  new CacheFirst({
    cacheName: "night-bookshop-music-v1",
    plugins: [new ExpirationPlugin({ maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
);
// Film posters and masks are versioned by file name, like the films.
registerRoute(
  ({ url }) => url.origin === self.location.origin && /^\/video\/tea\/.*\.(?:webp|json)$/.test(url.pathname),
  new CacheFirst({
    cacheName: "night-bookshop-tea-film-art-v1",
    plugins: [new ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
