const CACHE_NAME = 'english-ai-v2';

// Chỉ cache các file tĩnh thực sự tồn tại
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Các path KHÔNG được cache (API calls, auth)
const NO_CACHE_PREFIXES = ['/api/', '/v1/'];

function shouldSkipCache(url) {
  try {
    const pathname = new URL(url).pathname;
    return NO_CACHE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  } catch {
    return false;
  }
}

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => console.warn('Cache install warning:', error))
  );
  self.skipWaiting();
});

// Fetch event - không cache API calls
self.addEventListener('fetch', (event) => {
  // Bỏ qua non-GET và API calls
  if (event.request.method !== 'GET' || shouldSkipCache(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// Activate event - xóa cache cũ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Message event
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
