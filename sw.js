const CACHE_NAME = 'parishva-branding-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './subscription.css',
  './main.js',
  './auth-subscription.js',
  './firebase-config.js',
  './logo.jpeg',
  './founder.png',
  './favicon.ico',
  './favicon.png',
  './switching-agencies.html',
  './business-audit.html',
  './blog.js'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('[Service Worker] Failed to pre-cache some assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip Firebase Database, Auth API, and Google Analytics endpoints
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com/identitytoolkit') ||
    url.hostname.includes('google-analytics.com') ||
    url.hostname.includes('analytics.google.com') ||
    e.request.method !== 'GET'
  ) {
    return;
  }

  // Handle external assets like Fonts and Firebase CDNs
  const isCdnAsset = 
    url.hostname.includes('fonts.googleapis.com') || 
    url.hostname.includes('fonts.gstatic.com') || 
    url.hostname.includes('www.gstatic.com');

  if (isCdnAsset) {
    // Cache-First for CDN assets (fonts/libraries)
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, cacheCopy);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // Stale-While-Revalidate for local assets
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, cacheCopy);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Offline fallback
          return cachedResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
