/**
 * Service Worker приложения.
 *
 * Стратегии кэширования:
 * - GET /api/* - сеть, при недоступности сети - кэш;
 * - навигация (index.html) - сеть, при офлайне — кэш;
 * - /pictures/* - кэш, при промахе сеть;
 * - внешние запросы - кэш, при промахе сеть.
 *
 * Обновление приложения: поднять версию в имени кэша ниже - старый кэш
 * удалится при активации новой версии.
 */
const CACHE_NAME = 'svyaz-and-tochka-cache-v1';

/**
 * Установка новой версии Service Worker
 */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

/**
 * Активация новой версии Service Worker
 */
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

/**
 * Маршрутизатор сетевых запросов.
 *
 * (POST/PUT/DELETE) проходят мимо кэша. GET-запросы
 * распределяются по стратегиям: API - networkFirst,
 * навигация - handleNavigate, остальное — cacheFirst.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

/**
 * Сеть с фолбэком на закэшированный index.html
 *
 * Успешный ответ страницы кладётся в кэш;
 * когда сеть недоступна, любой навигационный запрос получает этот index.html
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
 * Успешный ответ кэшируется; при недоступности сети возвращается
 * последний закэшированный ответ этого адреса, а при пустом кэше - сетевая ошибка.
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (await cache.match(request)) || Response.error();
  }
}

/**
 * Мгновенный ответ из кэша, сеть - только при промахе
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
