// Service Worker for Advanced Scientific Calculator
const CACHE_NAME = 'sci-calc-v1.1.0';

// Core local assets required for the app shell
const CORE_ASSETS = [
  './',
  './index.html',
  './calculate.htm',
  './calculate.js',
  './calculate.css',
  './manifest.json',
  './favicon.ico',
  './icon-16.png',
  './icon-32.png',
  './icon-192.png',
  './icon-512.png',
  './screenshot-wide.png',
  './screenshot-narrow.png'
];

// External CDN dependencies (math.js, Font Awesome CSS and webfonts)
const EXTERNAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.0/math.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2'
];

// Install event - resilient caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[SW] Caching local core app shell...');
      // 1. Cache local core assets
      await cache.addAll(CORE_ASSETS);
      
      // 2. Cache external CDN assets gracefully without failing install on network issues
      await Promise.allSettled(
        EXTERNAL_ASSETS.map(url =>
          fetch(url, { mode: 'cors' })
            .then(res => {
              if (res.ok || res.type === 'opaque') {
                return cache.put(url, res);
              }
            })
            .catch(err => {
              console.warn('[SW] Could not pre-cache external asset:', url, err.message);
            })
        )
      );
      
      console.log('[SW] Install completed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Cache-first with network fallback, runtime caching & navigation fallback
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Return cached hit, but revalidate in background if online (stale-while-revalidate for local assets)
        if (navigator.onLine && (requestUrl.origin === location.origin || EXTERNAL_ASSETS.includes(event.request.url))) {
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {/* Ignore network revalidation errors */});
        }
        return cachedResponse;
      }

      // Not in cache: fetch from network and cache dynamically (runtime caching)
      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
            return networkResponse;
          }

          // Cache runtime response for future offline use
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Offline navigation fallback
          if (event.request.mode === 'navigate') {
            return caches.match('./calculate.htm').then(fallback => {
              return fallback || caches.match('./index.html');
            });
          }
          return new Response('Offline - resource unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
    })
  );
});

// Background sync for calculations (optional)
self.addEventListener('sync', event => {
  if (event.tag === 'background-calculation') {
    event.waitUntil(Promise.resolve());
  }
});

// Push notifications (optional)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Calculator notification',
    icon: 'icon-192.png',
    badge: 'icon-192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Scientific Calculator', options)
  );
});
