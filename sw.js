// Сервис-воркер: приложение открывается без интернета после первого запуска.
// Версию кэша увеличиваем при каждом обновлении иконок и файлов, чтобы старый кэш не остался.
const CACHE = 'ceu-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const scope = self.registration.scope;
    const res = await fetch(scope, { cache: 'reload' });
    const html = await res.clone().text();
    await cache.put(scope, res);
    const urls = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
      .map((m) => new URL(m[1], scope).href)
      .filter((u) => u.startsWith(scope));
    await Promise.all([...new Set(urls)].map((u) => cache.add(u).catch(() => {})));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        (await caches.open(CACHE)).put(self.registration.scope, res.clone());
        return res;
      } catch {
        return (await caches.match(self.registration.scope)) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    if (res.ok) (await caches.open(CACHE)).put(req, res.clone());
    return res;
  })());
});
