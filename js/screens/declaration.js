// Ongles de sorcière - Déclaration du soir (écran 3, US-006).
// L'enfant touche les doigts dont elle a rongé l'ongle : l'ongle fond, la sorcière la remercie
// de sa franchise ; un second toucher le fait revenir (EX-001, EX-053, EX-012).
// Avant 16 h, la sorcière dit qu'il est trop tôt, puis l'écran passe tout seul à la
// déclaration à 16 h (RG-002, EX-002, EX-003).
// Le soir déclaré se modifie jusqu'au 4 h qui suit le début de sa saisie (RG-003, EX-004).

import { addDays, atLocal, dateKey, isDeclarationOpen, OPENING_HOUR, storyDate } from '../calendar.js';
import * as data from '../data.js';
import { createHands } from '../hands.js';
import { childRecord, isEditableByChild } from '../rules.js';
import { play } from '../sound.js';
import { dayLabel, pick, TEXTS } from '../texts.js';
import { bigButton, element, openSheet, topBar, witch } from '../ui.js';

export function render(container, navigate) {
  const now = new Date();
  if (!isDeclarationOpen(now)) return renderTooEarly(container, navigate, now);

  const date = storyDate(now);
  const existing = data.dayRecord(date);
  if (existing && !isEditableByChild(existing, now)) return navigate('session-end', { date, replay: false });

  // Longueurs de la veille : la main telle qu'elle était avant ce soir.
  const before = data.history(now).days.find((day) => day.date === addDays(date, -1));
  const preserved = before?.nails ?? new Array(10).fill(0);
  // Une modification garde le début de la première saisie (RG-003).
  const startedAt = existing ? new Date(existing.startedAt) : now;

  const title = element('h1', 'screen-title', `Ce soir, ${dayLabel(date)}`);
  const sorceress = witch(1, TEXTS.declaration.prompt);
  let lastHonesty = null;
  const hands = createHands({
    preserved,
    melted: existing?.bitten ?? [],
    interactive: true,
    swipe: true,
    onToggle: (_, melted) => {
      if (melted) {
        lastHonesty = pick(TEXTS.honesty, lastHonesty);
        sorceress.say(lastHonesty, 6);
        play('melt');
      } else {
        sorceress.say(TEXTS.declaration.nailBack, hands.melted().length ? 6 : 1);
        play('tap');
      }
    },
  });

  const save = async () => {
    const record = childRecord(date, hands.melted(), startedAt);
    // Passé 4 h, une modification n'est plus possible : rien n'est changé.
    if (existing && !isEditableByChild(existing, new Date())) return navigate('home');
    await data.saveDay(record);
    navigate('session-end', { date, replay: true });
  };

  const done = bigButton(TEXTS.declaration.done, () => {
    if (hands.melted().length) return save();
    const close = openSheet(container, [
      bigButton(TEXTS.declaration.noneYes, () => { close(); save(); }, { variant: 'gold' }),
      bigButton(TEXTS.declaration.noneCheck, () => close(), { variant: 'second' }),
    ], { title: TEXTS.declaration.noneQuestion });
  }, { variant: 'gold' });

  const actions = element('div', 'stack');
  actions.append(done);
  container.append(topBar(navigate, { back: true, now }), title, sorceress.element, hands.element, actions);
}

// Avant 16 h : un message « trop tôt », puis la déclaration s'ouvre seule à 16 h.
function renderTooEarly(container, navigate, now) {
  const opening = atLocal(dateKey(now), OPENING_HOUR);
  const page = element('div', 'page');
  page.append(
    topBar(navigate, { back: true, now }),
    witch(4, pick(TEXTS.tooEarly), { large: true }).element,
    bigButton(TEXTS.common.back, () => navigate('home'), { variant: 'second' }),
  );
  container.append(page);
  // Le minuteur ne déclenche que si l'écran est toujours affiché.
  setTimeout(() => { if (page.isConnected) navigate('declaration'); }, Math.max(0, opening - now) + 500);
}
