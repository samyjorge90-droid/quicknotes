// Nome do Cache para o teu aplicativo QuickNotes
const CACHE_NAME = 'quicknotes-v2';

// Ficheiros e scripts para guardar localmente
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Instalação do Service Worker e gravação automática em cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('A guardar ficheiros essenciais em cache offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos para evitar conflitos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('A remover cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Resposta inteligente: tenta aceder à rede; se falhar ou estiver offline, usa a cache local
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Devolve o ficheiro em cache imediatamente para carregamento rápido
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback caso a rede falhe e o ficheiro não esteja em cache (para imagens ou links externos)
        return new Response('Estás offline e este recurso não foi guardado.', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});