   self.addEventListener('install', (event) => {
       event.waitUntil(
           caches.open('my-cache').then((cache) => {
               return cache.addAll([
                   // Lista de archivos que deseas almacenar en caché
                   '/',
                   '/index.html',
                   '/style.css',
                   '/script.js',
                   // No incluyas el HTML si no deseas que se almacene en caché
               ]);
           })
       );
   });

   self.addEventListener('fetch', (event) => {
       event.respondWith(
           caches.match(event.request).then((response) => {
               return response || fetch(event.request);
           })
       );
   });
   
