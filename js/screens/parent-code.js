// Ongles de sorcière - Code parent (écran 7). Version provisoire du squelette.

import { renderPlaceholder } from './placeholder.js';

export function render(container, navigate) {
  renderPlaceholder(container, navigate, {
    title: 'Code parent',
    next: [{ label: 'Valider', screen: 'parent-menu' }],
  });
}
