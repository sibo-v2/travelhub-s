const CACHE_NAME = 'travelplanner-v1';
const STATIC_CACHE = 'travelplanner-static-v1';
const DYNAMIC_CACHE = 'travelplanner-dynamic-v1';
const API_CACHE = 'travelplanner-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

const API_CACHE_DURATION = 5 * 60 * 1000;

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).catch((error) => {
      console.error('[Service Worker] Failed to cache static assets:', error);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin === location.origin) {
    if (request.url.includes('/api/') || url.hostname.includes('supabase')) {
      event.respondWith(networkFirstStrategy(request, API_CACHE));
    } else if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
      event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    } else {
      event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
    }
  } else if (url.hostname.includes('supabase') ||
             url.hostname.includes('api.') ||
             url.hostname.includes('maps.')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
  }
});

async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);

    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/index.html');
    }

    throw error;
  }
}

async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);

      const headers = new Headers(networkResponse.headers);
      headers.append('sw-cache-timestamp', Date.now().toString());

      const responseToCache = new Response(networkResponse.clone().body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      });

      cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', error);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      const age = Date.now() - parseInt(cacheTimestamp || '0');

      if (age < API_CACHE_DURATION) {
        console.log('[Service Worker] Returning cached API response');
        return cachedResponse;
      }
    }

    throw error;
  }
}

async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    return cachedResponse;
  });

  return cachedResponse || fetchPromise;
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  const data = event.data ? event.data.json() : {};

  const title = data.title || 'TravelPlanner Update';
  const options = {
    body: data.body || 'You have a new update',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event);

  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  console.log('[Service Worker] Syncing bookings...');
}
