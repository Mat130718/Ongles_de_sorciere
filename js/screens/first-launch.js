// Ongles de sorcière - Premier lancement (écran 1). Version provisoire du squelette.

import { renderPlaceholder } from './placeholder.js';

export function render(container, navigate) {
  renderPlaceholder(container, navigate, {
    title: 'Premier lancement',
    next: [],
  });
}
