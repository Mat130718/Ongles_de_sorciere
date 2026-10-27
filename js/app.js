// Ongles de sorcière - Démarrage et navigation entre écrans.
// Chaque écran est un module de js/screens/ qui exporte une fonction render(container, navigate).
// Tout part de l'accueil et y revient (EX-040).

import * as home from './screens/home.js';
import * as firstLaunch from './screens/first-launch.js';
import * as declaration from './screens/declaration.js';
import * as sessionEnd from './screens/session-end.js';
import * as calendar from './screens/calendar.js';
import * as catchUp from './screens/catch-up.js';
import * as parentCode from './screens/parent-code.js';
import * as parentMenu from './screens/parent-menu.js';
import * as backup from './screens/backup.js';
import * as weeklyReview from './screens/weekly-review.js';

export const screens = {
  'home': home,
  'first-launch': firstLaunch,
  'declaration': declaration,
  'session-end': sessionEnd,
  'calendar': calendar,
  'catch-up': catchUp,
  'parent-code': parentCode,
  'parent-menu': parentMenu,
  'backup': backup,
  'weekly-review': weeklyReview,
};

const container = document.getElementById('app');
let currentScreen = null;

function navigate(name) {
  const screen = screens[name] ?? screens.home;
  currentScreen = screens[name] ? name : 'home';
  container.replaceChildren();
  container.dataset.screen = currentScreen;
  screen.render(container, navigate);
  window.scrollTo(0, 0);
}

// --- Mise à jour de l'application (DEC-095) ---
// Une version téléchargée en arrière-plan attend. Elle n'est activée qu'à deux moments, et seulement
// si l'accueil est affiché : au démarrage, et quand l'application revient au premier plan.

let registration = null;

function applyPendingUpdate() {
  if (registration?.waiting && currentScreen === 'home') {
    registration.waiting.postMessage('activate-update');
  }
}

async function setUpServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // Au premier lancement, aucune page n'est encore contrôlée : pas de rechargement à prévoir.
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) window.location.reload();
  });
  registration = await navigator.serviceWorker.register('sw.js');
  applyPendingUpdate();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      registration.update().catch(() => {});
      applyPendingUpdate();
    }
  });
}

navigate('home');
setUpServiceWorker().catch(() => {});
