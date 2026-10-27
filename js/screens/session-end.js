// Ongles de sorcière - Fin de session (écran 4).
// Version d'essai du lot 3 : chaque ongle préservé pousse d'un cran sous les yeux de l'enfant.
// L'écran complet, avec le récapitulatif des points, arrive au lot 4.

import { createHands } from '../hands.js';
import { play } from '../sound.js';
import { lastTrial } from './declaration.js';
import { button } from './placeholder.js';

// Délai avant la pousse, pour que l'enfant voie les ongles d'avant.
const GROW_DELAY = 700;

export function render(container, navigate) {
  const heading = document.createElement('h1');
  heading.textContent = 'Bonne nuit';

  const { preserved, melted } = lastTrial;
  const hands = createHands({ preserved, melted, mini: true });
  const next = preserved.map((days, nail) => (melted.includes(nail) ? 0 : days + 1));
  setTimeout(() => {
    hands.grow(next);
    play('grow');
  }, GROW_DELAY);

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(
    button('Recommencer l’essai', () => {
      lastTrial.preserved = next;
      lastTrial.melted = [];
      navigate('declaration');
    }, 'secondary'),
    button('Bonne nuit', () => navigate('home')),
  );

  container.append(heading, hands.element, actions);
}
