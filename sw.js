// Nome da versão do cache - alterar sempre que atualizares recursos estáticos
const CACHE_NAME = 'offline-qr-v1.1';

// Recursos locais para guardar em cache offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './tailwind.min.css', // Ficheiro gerado dinamicamente pelo GitHub Actions
  './qrcode_library.js',
  './icon-192.png',
  './icon-512.png'
];

// Instalação do Service Worker e gravação do cache inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Criando cache e armazenando recursos locais...');
        // cache.add() ficheiro a ficheiro (em vez de addAll) evita que UM ficheiro
        // em falta (ex: tailwind.min.css antes do primeiro build do Actions) impeça
        // TODOS os outros de serem guardados em cache.
        return Promise.all(
          ASSETS_TO_CACHE.map((asset) =>
            cache.add(asset).catch((err) => console.warn('Falhou ao guardar em cache:', asset, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Cache-First com Fallback de Rede para navegação offline fluida
self.addEventListener('fetch', (event) => {
  // Ignorar pedidos que não sejam GET (ex: requisições externas ou APIs)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Devolve o recurso em cache se existir
        if (cachedResponse) {
          return cachedResponse;
        }

        // Caso contrário, tenta obter da rede
        return fetch(event.request)
          .then((response) => {
            // Verifica se a resposta é válida antes de colocar em cache
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para guardar no cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback offline caso a rede falhe e o recurso não esteja em cache
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});