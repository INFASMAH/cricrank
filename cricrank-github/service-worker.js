// CricRank Service Worker — Auto-Update
// BUILD_TIME is injected by GitHub Actions on every deploy
const BUILD_TIME = 'VITE_BUILD_TIME_PLACEHOLDER';
const CACHE_NAME = 'cricrank-v' + BUILD_TIME;

const SHELL = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
const SKIP_CACHE = ['firestore.googleapis.com','firebase.googleapis.com','firebaseio.com','googleapis.com','gstatic.com','firebasestorage.googleapis.com','youtube.com','youtu.be','ytimg.com','unpkg.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)).catch(()=>{}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (SKIP_CACHE.some(d => url.hostname.includes(d))) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) caches.open(CACHE_NAME).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
  );
});
