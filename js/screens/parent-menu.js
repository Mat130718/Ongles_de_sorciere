// Ongles de sorcière - Menu parent (écran 7). Version provisoire du squelette.

import { renderPlaceholder } from './placeholder.js';

export function render(container, navigate) {
  renderPlaceholder(container, navigate, {
    title: 'Espace parent',
    next: [{ label: 'Bilan de la semaine', screen: 'weekly-review' }, { label: 'Sauvegarder et restaurer', screen: 'backup' }, { label: 'Premier lancement', screen: 'first-launch' }],
  });
}
