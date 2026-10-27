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

// « Plus tard » vaut jusqu'à la prochaine ouverture de l'application.
let later = false;

export function render(container, navigate) {
  const now = new Date();
  const { today, days, nails } = data.history(now);
  const record = data.dayRecord(today);
  const told = record !== null;
  const editable = told && isEditableByChild(record, now);

  let bubble = TEXTS.home.invite;
  if (told) bubble = TEXTS.home.thanks;
  else if (!isDeclarationOpen(now)) bubble = TEXTS.home.tooEarly;
  // Soirs oubliés : la sorcière propose de les rattraper, jusqu'à « Plus tard » (EX-006).
  const forgotten = data.forgotten(now);
  if (forgotten.length && !later) {
    const content = element('div');
    const choices = element('div', 'choices');
    const yes = element('button', 'yes', TEXTS.home.forgottenYes);
    yes.type = 'button';
    yes.addEventListener('click', () => navigate('catch-up'));
    const no = element('button', 'no', TEXTS.home.forgottenLater);
    no.type = 'button';
    no.addEventListener('click', () => { later = true; navigate('home'); });
    choices.append(yes, no);
    content.append(TEXTS.home.forgotten(forgotten.length), choices);
    bubble = content;
  }
  // Semaine fermée : la sorcière annonce les bonus de la semaine, une seule fois.
  const sealed = data.weekToAnnounce(now);
  if (sealed) {
    const bonuses = [];
    if (sealed.perfectBonus) bonuses.push(TEXTS.home.perfectWeekBonus);
    if (sealed.honestyBonus) bonuses.push(TEXTS.home.honestyBonus);
    const content = element('div');
    const choices = element('div', 'choices');
    const thanksButton = element('button', 'yes', TEXTS.home.thanksAnnouncement);
    thanksButton.type = 'button';
    thanksButton.addEventListener('click', async () => {
      await data.saveSetting('announcedWeek', sealed.monday);
      navigate('home');
    });
    choices.append(thanksButton);
    // Une semaine avec un crapaud rouge repart sur un ton léger, sans revenir dessus.
    content.append(sealed.honestyAvailable ? TEXTS.home.weekSealed(bonuses) : TEXTS.home.weekSealedFresh(bonuses), choices);
    bubble = content;
  }

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

  container.append(topBar(navigate, { now }), witch(sealed ? 5 : 1, bubble).element, hands.element);
  if (data.reviewDue(now)) {
    const banner = element('div', 'banner');
    banner.append(icon('key'), TEXTS.home.sundayReminder);
    container.append(banner);
  }
  container.append(actions, parentKey);
}
