// Ongles de sorcière - Déclaration du soir (écran 3).
// Version d'essai du lot 3 : les mains, la fonte et le son, avec des longueurs d'exemple.
// Rien n'est enregistré ; l'écran complet arrive au lot 4.

import { createHands } from '../hands.js';
import { play } from '../sound.js';
import { button } from './placeholder.js';

// Longueurs d'exemple, pour voir tous les crans d'un coup, du plus court au très long.
const SAMPLE_PRESERVED = [0, 1, 2, 3, 4, 5, 6, 7, 9, 3];

// Dernier essai, repris par la fin de session pour faire pousser les ongles.
export const lastTrial = { preserved: SAMPLE_PRESERVED, melted: [] };

export function render(container, navigate) {
  const heading = document.createElement('h1');
  heading.textContent = 'Ma soirée';

  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = 'Essai : touche un doigt pour faire fondre son ongle, balaie pour agrandir une main.';

  const hands = createHands({
    preserved: lastTrial.preserved,
    interactive: true,
    swipe: true,
    onToggle: (_, melted) => play(melted ? 'melt' : 'tap'),
  });

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(
    button('J’ai fini', () => {
      lastTrial.melted = hands.melted();
      navigate('session-end');
    }, 'gold'),
    button('Retour à l’accueil', () => navigate('home'), 'secondary'),
  );

  container.append(heading, note, hands.element, actions);
}
