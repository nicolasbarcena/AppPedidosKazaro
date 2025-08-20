// sw.js

const CACHE_NAME = 'my-cache-v1'; // Cambia el nombre de la caché si realizas cambios en los archivos

// Archivos que deseas almacenar en caché
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    // Agrega otros archivos que necesites
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_ASSETS);
        })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name); // Elimina cachés antiguas
                    }
                })
            );
        })
    );
});

// Manejo de las solicitudes
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
