// Ongles de sorcière - Déclaration du soir (écran 3). Version provisoire du squelette.

import { renderPlaceholder } from './placeholder.js';

export function render(container, navigate) {
  renderPlaceholder(container, navigate, {
    title: 'Ma soirée',
    next: [{ label: 'J’ai fini', screen: 'session-end' }],
  });
}
