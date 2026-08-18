const CACHE = 'confluence-desk-shell-v1';
const SHELL = ['/', '/index.html', '/css/style.css', '/js/config.js', '/js/i18n.js', '/js/theme.js', '/js/indicators.js', '/js/api.js', '/js/signalEngine.js', '/js/charts.js', '/js/education.js', '/js/news.js', '/js/ui.js', '/js/app.js', '/assets/favicon.svg', '/assets/icon-192.png', '/assets/icon-512.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy=response.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return response; }).catch(() => cached)));
});
