// Ongles de sorcière - Accueil (écran 2, US-013).
// Le solde et le son en haut, la sorcière et sa bulle, les deux mains d'aujourd'hui, puis
// « Ma soirée » et « Mon calendrier ». La petite clé discrète mène à l'espace parent (EX-040).
// Le dimanche à partir de 16 h, un bandeau rappelle aux parents le bilan (EX-054).

import { isDeclarationOpen } from '../calendar.js';
import * as data from '../data.js';
import { createHands } from '../hands.js';
import { isEditableByChild } from '../rules.js';
import { TEXTS } from '../texts.js';
import { bigButton, element, icon, topBar, witch } from '../ui.js';

export function render(container, navigate) {
  const now = new Date();
  const { today, days, nails } = data.history(now);
  const record = data.dayRecord(today);
  const told = record !== null;
  const editable = told && isEditableByChild(record, now);

  let bubble = TEXTS.home.invite;
  if (told) bubble = TEXTS.home.thanks;
  else if (!isDeclarationOpen(now)) bubble = TEXTS.home.tooEarly;

  // Ce soir déjà raconté : ses ongles fondus restent visibles jusqu'au lendemain.
  const tonight = days.find((day) => day.date === today);
  const hands = createHands({ preserved: nails, melted: tonight?.bitten ?? [], mini: true });

  const actions = element('div', 'stack');
  actions.append(
    bigButton(editable ? TEXTS.home.editEvening : TEXTS.home.evening, () => navigate('declaration'), { iconName: 'moon' }),
    bigButton(TEXTS.home.calendar, () => navigate('calendar'), { variant: 'second', iconName: 'grimoire' }),
  );

  const parentKey = element('button', 'parent-key');
  parentKey.type = 'button';
  parentKey.setAttribute('aria-label', TEXTS.common.parentArea);
  parentKey.append(icon('key'));
  parentKey.addEventListener('click', () => navigate('parent-code'));

  container.append(topBar(navigate, { now }), witch(1, bubble).element, hands.element);
  if (data.reviewDue(now)) {
    const banner = element('div', 'banner');
    banner.append(icon('key'), TEXTS.home.sundayReminder);
    container.append(banner);
  }
  container.append(actions, parentKey);
}
