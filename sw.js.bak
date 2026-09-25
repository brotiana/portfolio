/* Service Worker :
   - Quand on rafraîchit une URL "propre" de dossier (ex: /helpcercle/ ou /echec/)
     et que le serveur ne sert pas l'index automatiquement,
     on renvoie le fichier index.html correspondant du dossier. */
self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  if (request.mode !== 'navigate') return;

  var url = new URL(request.url);
  var path = url.pathname;

  // Racine du site : on laisse le serveur répondre normalement
  if (path === '/') return;

  var parts = path.split('/').filter(Boolean);
  var last = parts.length ? parts[parts.length - 1] : '';

  // Si l'URL ne se termine pas par un fichier avec extension (.html, .css...)
  // => c'est une URL de dossier, on sert son index.html
  if (last.indexOf('.') === -1) {
    var base = path.replace(/\/?$/, '/');
    event.respondWith(fetch(base + 'index.html'));
  }
});
