// Ongles de sorcière - Service worker.
// Il garde une copie de tous les fichiers de l'application sur le téléphone et la sert sans réseau (EX-042).
// Il ne contacte aucun autre site que celui de l'application (EX-043).
// Une nouvelle version s'installe en arrière-plan, puis attend : c'est l'application qui la déclenche,
// seulement depuis l'accueil, jamais au milieu d'une déclaration (DEC-095).

// À changer à chaque version publiée, pour que le téléphone récupère les nouveaux fichiers.
const VERSION = '0.8.0';
const CACHE = `ongles-de-sorciere-${VERSION}`;

// Tous les fichiers de l'application. Un test automatique vérifie que la liste est complète.
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'fonts/OFL-atkinsonhyperlegible.txt',
  'fonts/OFL-grandstander.txt',
  'fonts/atkinson-400.woff2',
  'fonts/atkinson-700.woff2',
  'fonts/grandstander.woff2',
  'img/icon-192.png',
  'img/icon-512.png',
  'img/icon-maskable-192.png',
  'img/icon-maskable-512.png',
  'img/icon.svg',
  'img/main.webp',
  'img/witch-1.webp',
  'img/witch-2.webp',
  'img/witch-3.webp',
  'img/witch-4.webp',
  'img/witch-5.webp',
  'img/witch-6.webp',
  'img/witch-8.webp',
  'img/witch-9.webp',
  'js/app.js',
  'js/backup.js',
  'js/calendar.js',
  'js/data.js',
  'js/hands.js',
  'js/magic.js',
  'js/parent-code.js',
  'js/rules.js',
  'js/shop.js',
  'js/screens/backup.js',
  'js/screens/calendar.js',
  'js/screens/catch-up.js',
  'js/screens/declaration.js',
  'js/screens/first-launch.js',
  'js/screens/home.js',
  'js/screens/parent-code.js',
  'js/screens/parent-menu.js',
  'js/screens/session-end.js',
  'js/screens/shop.js',
  'js/screens/weekly-review.js',
  'js/sound.js',
  'js/store.js',
  'js/texts.js',
  'js/ui.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name.startsWith('ongles-de-sorciere-') && name !== CACHE)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// L'application demande l'activation de la version en attente quand elle est sur l'accueil.
self.addEventListener('message', (event) => {
  if (event.data === 'activate-update') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE)
      .then((cache) => cache.match(event.request, { ignoreSearch: true }))
      .then((copy) => copy || fetch(event.request))
  );
});
