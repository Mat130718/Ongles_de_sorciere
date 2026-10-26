// Ongles de sorcière - Service de fonctionnement hors ligne de la page de test, version 1.2.
// Il garde une copie des fichiers de la page sur le téléphone et la sert sans réseau.
// Il ne contacte aucun autre site.
const CACHE = 'test-faisabilite-v3';
const FICHIERS = ['./', 'index.html', 'style.css', 'test.js', 'manifest.webmanifest', 'icone.svg'];

self.addEventListener('install', (evenement) => {
  evenement.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((nom) => nom !== CACHE).map((nom) => caches.delete(nom))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evenement) => {
  if (evenement.request.method !== 'GET') return;
  evenement.respondWith(
    caches.match(evenement.request, { ignoreSearch: true })
      .then((copie) => copie || fetch(evenement.request))
  );
});
