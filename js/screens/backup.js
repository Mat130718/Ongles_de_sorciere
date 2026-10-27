// Ongles de sorcière - Sauvegarde, restauration et tout effacer (écran 8). Version provisoire du squelette.

import { renderPlaceholder } from './placeholder.js';

export function render(container, navigate) {
  renderPlaceholder(container, navigate, {
    title: 'Sauvegarde',
    next: [],
  });
}
