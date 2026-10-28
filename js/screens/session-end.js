// Ongles de sorcière - Fin de session (écran 4, US-008).
// Les ongles préservés poussent d'un cran sous les yeux de l'enfant, puis viennent les points
// du soir, les bonus, la série, et une phrase de bonne nuit tirée parmi cinq (DEC-106).
// « Je me suis trompée » rouvre la déclaration tant qu'elle est modifiable (REC-30).

import { addDays } from '../calendar.js';
import * as data from '../data.js';
import { createHands } from '../hands.js';
import { isEditableByChild, MAX_NAIL_LENGTH } from '../rules.js';
import { play } from '../sound.js';
import { pick, TEXTS } from '../texts.js';
import { bigButton, dayRecap, element, icon, linkButton, topBar, witch } from '../ui.js';

// Délai avant la pousse, pour que l'enfant voie d'abord les ongles d'avant.
const GROW_DELAY = 700;
// Nombre de chapeaux au plus sur la ligne de la série.
const MAX_HATS = 7;

let lastGoodnight = null;

export function render(container, navigate, { date, replay = true } = {}) {
  const now = new Date();
  const { days } = data.history(now);
  const day = days.find((entry) => entry.date === date);
  if (!day || day.status === 'pending' || day.status === 'empty') return navigate('home');
  const before = days.find((entry) => entry.date === addDays(date, -1))?.nails ?? new Array(10).fill(0);

  const hands = createHands({ preserved: replay ? before : day.nails, melted: day.bitten, polish: data.polish(), mini: true });
  if (replay) {
    setTimeout(() => {
      hands.grow(day.nails);
      play('grow');
    }, GROW_DELAY);
  }

  const texts = TEXTS.sessionEnd;
  const recap = dayRecap(day);

  const streak = element('div', 'streak');
  if (day.streak > 0) {
    for (let index = 0; index < Math.min(day.streak, MAX_HATS); index += 1) streak.append(icon('hat'));
    streak.append(element('span', null, texts.streak(day.streak)));
  } else {
    streak.append(element('span', null, texts.newStreak));
  }

  // Expression (DEC-093) : rit pour un bonus de série, contente après un ongle rongé,
  // émerveillée si un ongle devient très long, clin d'œil sinon.
  const reachesMax = day.nails.some((length, nail) => length >= MAX_NAIL_LENGTH && before[nail] < MAX_NAIL_LENGTH);
  let expression = 2;
  if (day.points.streak) expression = 5;
  else if (day.bitten.length) expression = 9;
  else if (reachesMax) expression = 3;
  lastGoodnight = pick(TEXTS.goodnight, lastGoodnight);

  const actions = element('div', 'stack');
  actions.append(bigButton(texts.goodnight, () => navigate('home'), { iconName: 'moon' }));
  const record = data.dayRecord(date);
  if (record && isEditableByChild(record, now)) {
    actions.append(linkButton(texts.mistake, () => navigate('declaration')));
  }

  container.append(topBar(navigate, { now }), hands.element, recap, streak, witch(expression, lastGoodnight).element, actions);
}
