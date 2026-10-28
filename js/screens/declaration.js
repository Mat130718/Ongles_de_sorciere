// Ongles de sorcière - Déclaration du soir (écran 3, US-006), et rattrapage d'un soir oublié (US-010).
// L'enfant touche les doigts dont elle a rongé l'ongle : l'ongle casse avec l'effet qu'elle a
// choisi dans la boutique (l'ongle qui fond par défaut), la sorcière la remercie de sa franchise ;
// un second toucher le fait revenir (EX-001, EX-053, EX-012, DEC-131).
// Avant 16 h, la sorcière dit qu'il est trop tôt, puis l'écran passe tout seul à la
// déclaration à 16 h (RG-002, EX-002, EX-003). Un soir oublié se rattrape à toute heure.
// Le soir déclaré se modifie jusqu'au 4 h qui suit le début de sa saisie (RG-003, EX-004).

import { addDays, atLocal, dateKey, isDeclarationOpen, OPENING_HOUR, storyDate } from '../calendar.js';
import * as data from '../data.js';
import { createHands } from '../hands.js';
import { childRecord, isEditableByChild } from '../rules.js';
import { EFFECT_SOUNDS, play } from '../sound.js';
import { dayLabel, pick, TEXTS } from '../texts.js';
import { bigButton, bonusLabels, element, openSheet, topBar, witch } from '../ui.js';

export function render(container, navigate, { date: forgottenDate } = {}) {
  const now = new Date();
  // Rattrapage : seulement un soir encore rattrapable (EX-006, RG-005).
  if (forgottenDate) {
    if (!data.forgotten(now).includes(forgottenDate)) return navigate('catch-up');
    return renderDeclaration(container, navigate, now, forgottenDate, true);
  }
  if (!isDeclarationOpen(now)) return renderTooEarly(container, navigate, now);
  const date = storyDate(now);
  const existing = data.dayRecord(date);
  if (existing && !isEditableByChild(existing, now)) return navigate('session-end', { date, replay: false });
  return renderDeclaration(container, navigate, now, date, false);
}

function renderDeclaration(container, navigate, now, date, catchUp) {
  const existing = catchUp ? null : data.dayRecord(date);
  // Longueurs de la veille : la main telle qu'elle était avant ce soir.
  const before = data.history(now).days.find((day) => day.date === addDays(date, -1));
  const preserved = before?.nails ?? new Array(10).fill(0);
  // Une modification garde le début de la première saisie (RG-003).
  const startedAt = existing ? new Date(existing.startedAt) : now;

  const label = dayLabel(date);
  const title = element('h1', 'screen-title', catchUp ? TEXTS.catchUp.declarationTitle(label) : `Ce soir, ${label}`);
  const sorceress = witch(1, TEXTS.declaration.prompt);
  let lastHonesty = null;
  const hands = createHands({
    preserved,
    melted: existing?.bitten ?? [],
    polish: data.polish(),
    effect: data.nextBreakEffect,
    interactive: true,
    swipe: true,
    onToggle: (_, melted, played) => {
      if (melted) {
        lastHonesty = pick(TEXTS.honesty, lastHonesty);
        sorceress.say(lastHonesty, 6);
        play(EFFECT_SOUNDS[played] ?? 'melt');
      } else {
        sorceress.say(TEXTS.declaration.nailBack, hands.melted().length ? 6 : 1);
        play('tap');
      }
    },
  });

  const save = async () => {
    // Passé 4 h, une modification n'est plus possible : rien n'est changé.
    if (existing && !isEditableByChild(existing, new Date())) return navigate('home');
    await data.saveDay(childRecord(date, hands.melted(), startedAt));
    if (catchUp) showCatchUpSummary(container, navigate, date);
    else navigate('session-end', { date, replay: true });
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

// Après un rattrapage : les points du soir, puis le soir oublié suivant ou l'accueil.
function showCatchUpSummary(container, navigate, date) {
  const now = new Date();
  const day = data.history(now).days.find((entry) => entry.date === date);
  const remaining = data.forgotten(now);
  const text = TEXTS.catchUp.summary(day.points.classic, bonusLabels(day).map((label) => label.toLowerCase()), day.total);
  const children = [element('p', 'centered', text)];
  if (remaining.length) {
    children.push(bigButton(TEXTS.catchUp.next, () => navigate('declaration', { date: remaining[0] }), { variant: 'gold' }));
  }
  children.push(bigButton(TEXTS.common.home, () => navigate('home'), { variant: 'second' }));
  play('grow');
  const close = openSheet(container, children, { title: TEXTS.catchUp.told(dayLabel(date)) });
  // Toucher le voile ramène aussi à l'accueil : le soir est déjà enregistré.
  container.querySelector('.veil').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) { close(); navigate('home'); }
  });
}

// Avant 16 h : un message « trop tôt », puis la déclaration s'ouvre seule à 16 h.
function renderTooEarly(container, navigate, now) {
  const opening = atLocal(dateKey(now), OPENING_HOUR);
  const page = element('div', 'page');
  const actions = element('div', 'stack');
  if (data.forgotten(now).length) {
    actions.append(bigButton(TEXTS.catchUp.button, () => navigate('catch-up'), { variant: 'gold' }));
  }
  actions.append(bigButton(TEXTS.common.back, () => navigate('home'), { variant: 'second' }));
  page.append(
    topBar(navigate, { back: true, now }),
    witch(4, pick(TEXTS.tooEarly), { large: true }).element,
    actions,
  );
  container.append(page);
  // Le minuteur ne déclenche que si l'écran est toujours affiché.
  setTimeout(() => { if (page.isConnected) navigate('declaration'); }, Math.max(0, opening - now) + 500);
}
