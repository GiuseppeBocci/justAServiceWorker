'use strict';

// Array di configurazione del service worker
var config = {
  version: 0,
  // Risorse da inserire in cache immediatamente - Precaching
  staticCacheItems: [
    '/'
  ],
};

// Funzione che restituisce una stringa da utilizzare come chiave(nome) per la cache
function cacheName(key, opts) {
 return key+opts;
}

// Evento install
self.addEventListener('install', event => {
 event.waitUntil(
   // Inserisco in cache le URL configurate in config.staticCacheItems
   caches.open( cacheName('static', config) ).then(cache => cache.addAll(config.staticCacheItems))
   // self.skipWaiting() evita l'attesa, il che significa che il service worker si attiverà immediatamente non appena conclusa l'installazione
   .then( () => self.skipWaiting() )
 );
 console.log("Service Worker Installato");
});

// Evento activate
self.addEventListener('activate', event => {

 // Questa funzione elimina dalla cache tutte le risorse la cui chiave non contiene il nome della versione
 // impostata sul config di questo service worker
 function clearCacheIfDifferent(event, opts) {
   return caches.keys().then(cacheKeys => {
     var oldCacheKeys = cacheKeys.filter(key => key.indexOf(opts.version) !== 0 || opts.version < config.version);
     var deletePromises = oldCacheKeys.map(oldKey => caches.delete(oldKey));
     return Promise.all(deletePromises);
   });
 }

event.waitUntil(
 // Se la versione del service worker cambia, svuoto la cache
 clearCacheIfDifferent(event, config)
 // Con self.clients.claim() consento al service worker di poter intercettare le richieste (fetch) fin da subito piuttosto che attendere il refresh della pagina
 .then( () => self.clients.claim() )
 );
 console.log("Service Worker Avviato");
});

// Evento fetch
self.addEventListener('fetch', event => {
  console.log("Richiesta URL: "+event.request.url);
     event.respondWith(
       //provo a fare il fetch della richiesta
       fetch(event.request).then(response => {
         //controllo se lo stato della rispota è regolare (200)
         var r1 = response.clone();
         var r2 = response.clone();
          if(r1.status == 200){
            //se lo è:
            //1) aggiorno la cache
            caches.open(cacheName('attuale', config)).then(cache => {
              cache.put(event.request, r2);
            });
            //2) faccio il return della rispota
            return response;
          }
          else{
            //se non lo è provo a vedere se ho un match nella mia cache
            console.log("chache match:", caches.match(event.request));
            return caches.open(cacheName('attuale', config)).then(cache => {
              var cr= cache.match(event.request);
              console.log("cache.match:",cr);
              return cr;
            });
          }
        }).catch(error => {
          //se lo stato della rispota non è 200 e non ho avuto nessun mach nella cache
          //allora genero un errore
          console.error("Errore nel fetch:", error);
        })
     );
 });
