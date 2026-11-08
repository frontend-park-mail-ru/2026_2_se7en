/**
 * Service Worker приложения.
 *
 * Стратегии кэширования:
 * - /api/* - всегда сеть;
 * - навигация (index.html) - сеть, при офлайне — кэш;
 * - /pictures/* - кэш, при промахе сеть;
 * - внешние запросы - кэш, при промахе сеть.
 *
 * Обновление приложения: поднять версию в имени кэша ниже - старый кэш
 * удалится при активации новой версии.
 */
const CACHE_NAME = 'svyaz-and-tochka-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

/**
 * Сеть с фолбэком на закэшированный index.html
 */
async function handleNavigate(request) {
  try {
    const response = await fetch(request);

    const cache = await caches.open(CACHE_NAME);

    cache.put('index.html', response.clone());

    return response;
  } catch {
    const cache = await caches.open(CACHE_NAME);

    return (await cache.match('index.html')) || Response.error();
  }
}

/**
 * Кэш с докладыванием при промахе
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) return cached;

  const response = await fetch(request);

  if (response.ok || response.type === 'opaque') {
    const cache = await caches.open(CACHE_NAME);

    cache.put(request, response.clone());
  }

  return response;
}
