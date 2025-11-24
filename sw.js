const CACHE_NAME = 'flappy-senac-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx', // Em produção real, seriam os arquivos buildados .js
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições (Cache First strategy)
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam http/https (ex: chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Opcional: Cachear novas requisições dinamicamente
        return fetchResponse;
      });
    })
  );
});