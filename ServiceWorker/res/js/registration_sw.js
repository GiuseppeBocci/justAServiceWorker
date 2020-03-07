if ('serviceWorker' in navigator) {
 // Path che contiene il service worker
 navigator.serviceWorker.register('sw.js').then(function(registration) {
   console.log('Service worker installato correttamente, ecco lo scope:', registration.scope);
 }).catch(function(error) {
   console.log('Installazione service worker fallita:', error);
 });
}
