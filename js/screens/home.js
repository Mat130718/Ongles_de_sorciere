// Ongles de sorcière - Accueil (écran 2). Version provisoire du squelette.

import { button } from './placeholder.js';

export function render(container, navigate) {
  const heading = document.createElement('h1');
  heading.textContent = 'Ongles de sorcière';

  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = 'Écran en construction.';

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(
    button('Ma soirée', () => navigate('declaration')),
    button('Mon calendrier', () => navigate('calendar')),
  );

  // Petit bouton discret vers l'espace parent (EX-040).
  const parentKey = button('\u{1F511}', () => navigate('parent-code'), 'key');
  parentKey.setAttribute('aria-label', 'Espace parent');

  container.append(heading, note, actions, parentKey);
}
