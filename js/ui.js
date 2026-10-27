// Ongles de sorcière - Petits éléments d'écran partagés : sorcière et bulle, gros boutons,
// barre du haut, feuille qui monte du bas, pavé du code, icônes.
// Les icônes sont des dessins SVG écrits à la main, sans attribut style (la politique de
// sécurité de la page les bloque).

import { isSoundEnabled, play, setSoundEnabled } from './sound.js';
import { TEXTS } from './texts.js';
import * as data from './data.js';

const ICONS = {
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3a9 9 0 1 0 6 15.5A8 8 0 0 1 15 3z" fill="#f2c14e"/></svg>',
  grimoire: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h11a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" fill="#6a3aa0" stroke="#f4ecd6" stroke-width="1.5"/><path d="M8 20a4 4 0 0 1 0-4h11" stroke="#f4ecd6" stroke-width="1.5" fill="none"/><path d="M11 8l1 2 2 .5-2 .5-1 2-1-2-2-.5 2-.5z" fill="#f2c14e"/></svg>',
  key: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="4" stroke="#b8add4" stroke-width="2" fill="none"/><path d="M12 12h9 M18 12v3 M21 12v2" stroke="#b8add4" stroke-width="2" stroke-linecap="round"/></svg>',
  sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#f4ecd6"/><path d="M16 8 q3 4 0 8 M18.5 5.5 q5 6.5 0 13" stroke="#f4ecd6" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#f4ecd6"/><path d="M16 9 l5 6 M21 9 l-5 6" stroke="#f4ecd6" stroke-width="2" stroke-linecap="round"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" fill="#f2c14e"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="#f4ecd6" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  // Chapeau pailleté provisoire, en attendant les symboles définitifs (US-030).
  hat: '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="32" rx="17" ry="4.5" fill="#4a2477"/><path d="M9 31 Q15 20 18 5 Q20 1 23 4 Q27 9 30 12 Q25 12 25 16 Q27 25 31 31Z" fill="#6a3aa0" stroke="#2c1247" stroke-width="1.5"/><rect x="12" y="25" width="17" height="4" rx="1.5" fill="#f2c14e"/><path d="M33 6 l1 2.5 2.5 1 -2.5 1 -1 2.5 -1 -2.5 -2.5 -1 2.5 -1z M6 14 l.8 2 2 .8 -2 .8 -.8 2 -.8 -2 -2 -.8 2 -.8z" fill="#f2c14e"/></svg>',
};

export function icon(name) {
  const template = document.createElement('template');
  template.innerHTML = ICONS[name];
  return template.content.firstElementChild;
}

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Gros bouton de l'enfant : variantes main (violet), second (nuit) et gold (or).
export function bigButton(label, onClick, { variant = 'main', iconName } = {}) {
  const button = element('button', `big ${variant}`);
  button.type = 'button';
  if (iconName) button.append(icon(iconName));
  button.append(label);
  button.addEventListener('click', onClick);
  return button;
}

export function linkButton(label, onClick) {
  const button = element('button', 'link', label);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}

// La sorcière et sa bulle. large : sorcière en grand, bulle dessous.
export function witch(expression, text, { large = false } = {}) {
  const zone = element('div', `witch-zone${large ? ' large' : ''}`);
  const image = element('img', 'witch');
  image.src = `img/witch-${expression}.webp`;
  image.alt = '';
  const bubble = element('div', 'bubble');
  bubble.setAttribute('aria-live', 'polite');
  if (text instanceof Node) bubble.append(text); else bubble.textContent = text;
  zone.append(image, bubble);
  return {
    element: zone,
    say(nextText, nextExpression) {
      bubble.textContent = nextText;
      if (nextExpression) image.src = `img/witch-${nextExpression}.webp`;
    },
  };
}

// Barre du haut de l'enfant : solde ou retour à gauche, bouton du son à droite (EX-027).
export function topBar(navigate, { back = false, now = new Date() } = {}) {
  const bar = element('div', 'top-bar');
  if (back) {
    const button = element('button', 'round');
    button.type = 'button';
    button.setAttribute('aria-label', TEXTS.common.home);
    button.append(icon('back'));
    button.addEventListener('click', () => navigate('home'));
    bar.append(button);
  } else {
    const balance = element('span', 'balance');
    balance.append(icon('star'), TEXTS.common.points(data.history(now).balance));
    bar.append(balance);
  }
  const sound = element('button', 'round');
  sound.type = 'button';
  const paint = () => {
    const on = isSoundEnabled();
    sound.replaceChildren(icon(on ? 'sound' : 'mute'));
    sound.setAttribute('aria-label', on ? TEXTS.common.soundOff : TEXTS.common.soundOn);
    sound.setAttribute('aria-pressed', String(!on));
  };
  sound.addEventListener('click', () => {
    setSoundEnabled(!isSoundEnabled());
    data.saveSetting('soundOn', isSoundEnabled()).catch(() => {});
    paint();
    play('tap');
  });
  paint();
  bar.append(sound);
  return bar;
}

// Feuille qui monte du bas de l'écran, par-dessus un voile. Toucher le voile la ferme.
export function openSheet(container, children, { title } = {}) {
  const veil = element('div', 'veil');
  const sheet = element('div', 'sheet');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  if (title) sheet.append(element('h2', null, title));
  sheet.append(...children);
  veil.append(sheet);
  const close = () => veil.remove();
  veil.addEventListener('click', (event) => { if (event.target === veil) close(); });
  container.append(veil);
  return close;
}

// Pavé de quatre chiffres. onComplete(code) reçoit les quatre chiffres tapés, puis le pavé se vide.
export function keypad({ onComplete, length = 4 }) {
  const root = element('div', 'code-entry');
  const boxes = element('div', 'code-boxes');
  const message = element('p', 'code-message');
  message.setAttribute('role', 'status');
  const pad = element('div', 'keypad');
  let typed = '';
  let busy = false;

  const paint = () => {
    boxes.replaceChildren(...Array.from({ length }, (_, index) =>
      element('span', index < typed.length ? 'filled' : '', index < typed.length ? '●' : '')));
    boxes.setAttribute('aria-label', `${typed.length} chiffre${typed.length > 1 ? 's' : ''} sur ${length}`);
  };
  const key = (label, onClick, aria) => {
    const button = element('button', null, label);
    button.type = 'button';
    if (aria) button.setAttribute('aria-label', aria);
    button.addEventListener('click', onClick);
    return button;
  };
  const type = async (digit) => {
    if (busy || typed.length >= length) return;
    typed += digit;
    message.textContent = '';
    play('tap');
    paint();
    if (typed.length < length) return;
    busy = true;
    const code = typed;
    await new Promise((resolve) => setTimeout(resolve, 150));
    typed = '';
    try { await onComplete(code); } finally { busy = false; paint(); }
  };
  for (const digit of '123456789') pad.append(key(digit, () => type(digit)));
  pad.append(key('←', () => { typed = typed.slice(0, -1); paint(); }, 'Effacer'), key('0', () => type('0')), element('span'));
  paint();
  root.append(boxes, message, pad);
  return { element: root, setMessage: (text) => { message.textContent = text; } };
}
