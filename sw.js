const CACHE_NAME = 'tolKanta-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/how-it-works.html',
  '/impact.html',
  '/verify.html',
  '/ivr.html',
  '/whatsapp.html',
  '/guide.html',
  '/about.html',
  '/architecture.html',
  '/privacy.html',
  '/passport-view.html',
  '/portal/admin.html',
  '/portal/buyer-market.html',
  '/portal/buyer-profile.html',
  '/portal/buyer-purchases.html',
  '/portal/buyer.html',
  '/portal/buyers.html',
  '/portal/dashboard.html',
  '/portal/ledger.html',
  '/portal/notifications.html',
  '/portal/passport.html',
  '/portal/pickups.html',
  '/portal/profile.html',
  '/portal/recycler.html',
  '/portal/sales.html',
  '/portal/sell.html',
  '/css/style.css',
  '/css/portal.css',
  '/js/sha256.js',
  '/js/db.js',
  '/js/common.js',
  '/js/guide.js',
  '/js/pages/about.js',
  '/js/pages/admin.js',
  '/js/pages/buyer-market.js',
  '/js/pages/buyer-profile.js',
  '/js/pages/buyer-purchases.js',
  '/js/pages/buyer.js',
  '/js/pages/buyers.js',
  '/js/pages/dashboard.js',
  '/js/pages/guide-page.js',
  '/js/pages/home.js',
  '/js/pages/impact.js',
  '/js/pages/ivr.js',
  '/js/pages/ledger.js',
  '/js/pages/login.js',
  '/js/pages/notifications.js',
  '/js/pages/passport-view.js',
  '/js/pages/passport.js',
  '/js/pages/pickups.js',
  '/js/pages/plain.js',
  '/js/pages/profile.js',
  '/js/pages/recycler.js',
  '/js/pages/sales.js',
  '/js/pages/sell.js',
  '/js/pages/verify.js',
  '/js/pages/whatsapp.js',
  '/vendor/qrcode.js',
  '/vendor/leaflet/leaflet.js',
  '/vendor/leaflet/leaflet.css',
  '/vendor/leaflet/images/layers-2x.png',
  '/vendor/leaflet/images/layers.png',
  '/vendor/leaflet/images/marker-icon-2x.png',
  '/vendor/leaflet/images/marker-icon.png',
  '/vendor/leaflet/images/marker-shadow.png',
  '/assets/img/favicon.svg',
  '/assets/img/hero-image.svg',
  '/assets/img/logo-dark.svg',
  '/assets/img/logo.svg',
  '/assets/img/sih-logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/chat')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
