// Service Worker para Formulário de Serviço - Selaves
const CACHE_NAME = 'servico-form-v1.3.0';

// Recursos essenciais para cache
const base = self.location.pathname.replace(/sw\.js$/, '');
const urlsToCache = [
  base,
  base + 'index.html',
  base + 'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com'
];

// Instalação
self.addEventListener('install', event => {
  console.log('Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto, adicionando recursos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Recursos cacheados com sucesso');
        return self.skipWaiting();
      })
  );
});

// Ativação
self.addEventListener('activate', event => {
  console.log('Service Worker ativado');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de Cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

console.log('Service Worker carregado!');
