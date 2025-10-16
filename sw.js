// Service Worker para Formulário de Serviço - Selaves
const CACHE_NAME = 'servico-form-v1.3.1'; // *** MUDE O NOME DO CACHE para forçar a atualização! ***

// Recursos essenciais para cache
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  
  // Ícones do PWA (do manifest.json)
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  
  // Font Awesome - CSS e FONTES
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  
  // Adiciona as fontes mais comuns do Font Awesome 6 (você precisa garantir que elas existam no CDN)
  // O Service Worker pode falhar se tentar cachear algo que não existe, mas estas são as URLs padrão.
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2',
  
  // Tailwind CSS (CDN)
  'https://cdn.tailwindcss.com'
];

// ... (Resto do código)

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
