// Network-first service worker — never caches HTML, always fetches fresh content
const CACHE = 'sc-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete ALL existing caches so users always get the latest version
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  // Navigation requests (HTML pages) — always network, never cache
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() =>
        new Response('Network error — please check your internet connection.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      )
    );
    return;
  }

  // API calls — network only, no caching
  if (request.url.includes('/api/')) {
    e.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'You are offline' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // JS/CSS/font assets — network first, fall back to cache
  e.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
