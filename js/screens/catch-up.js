// Ongles de sorcière - Rattrapage (écran 6, US-010).
// La liste des soirs oubliés encore rattrapables, du plus ancien au plus récent (EX-006).
// Chaque soir s'ouvre dans la déclaration, en mode rattrapage.

import * as data from '../data.js';
import { dayLabel, TEXTS } from '../texts.js';
import { bigButton, element, topBar, witch } from '../ui.js';

export function render(container, navigate) {
  const now = new Date();
  const dates = data.forgotten(now);
  container.append(topBar(navigate, { back: true, now }), element('h1', 'screen-title', TEXTS.catchUp.title));
  if (!dates.length) {
    container.append(
      witch(9, TEXTS.empty.nothingForgotten, { large: true }).element,
      bigButton(TEXTS.common.back, () => navigate('home'), { variant: 'second' }),
    );
    return;
  }
  const list = element('div', 'stack');
  list.append(...dates.map((date) =>
    bigButton(dayLabel(date), () => navigate('declaration', { date }), { variant: 'second' })));
  container.append(witch(8, TEXTS.catchUp.which).element, list);
}
