// Ongles de sorcière - Calendrier (écran 5). Version provisoire du squelette.

import { renderPlaceholder } from './placeholder.js';

export function render(container, navigate) {
  renderPlaceholder(container, navigate, {
    title: 'Mon calendrier',
    next: [{ label: 'Rattraper un soir oublié', screen: 'catch-up' }],
  });
}
