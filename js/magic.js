// Ongles de sorcière - Vernis et effets de casse, dessinés par le programme (DEC-091).
// Repris de la maquette de la boutique validée par l'enfant (DEC-133).
//
// Tout se dessine dans le repère local d'un ongle : l'ongle va de y = -84 (la pointe) à y = 6
// (la base), et de x = -16 à x = 16. Les dessins sont écrits en SVG, sans attribut style, que
// la politique de sécurité de la page bloque : les décalages d'animation passent par des
// classes (d1 à d4), et les trajectoires des éclats par des variables CSS posées en JavaScript.

import { POLISHES } from './shop.js';

const SVG = 'http://www.w3.org/2000/svg';
export const NAIL_PATH = 'M-16 6 L-16 -38 Q-15 -68 0 -84 Q15 -68 16 -38 L16 6 Q0 11 -16 6 Z';

// Transforme un bout de SVG écrit en texte en éléments SVG.
export function fromMarkup(markup) {
  const template = document.createElement('template');
  template.innerHTML = `<svg xmlns="${SVG}">${markup}</svg>`;
  const nodes = [...template.content.firstElementChild.childNodes];
  // Les éclats qui partent dans une direction portent data-dx et data-dy : on les pose en variables CSS.
  for (const node of nodes) {
    if (node.nodeType !== 1) continue;
    for (const piece of [node, ...node.querySelectorAll('[data-dx]')]) {
      if (!piece.dataset?.dx) continue;
      piece.style.setProperty('--dx', `${piece.dataset.dx}px`);
      piece.style.setProperty('--dy', `${piece.dataset.dy}px`);
    }
  }
  return nodes;
}

// --- Petits dessins ---

function star(x, y, r, fill, className = '') {
  const points = [];
  for (let k = 0; k < 10; k += 1) {
    const angle = -Math.PI / 2 + (k * Math.PI) / 5;
    const radius = k % 2 ? r * 0.45 : r;
    points.push(`${(x + Math.cos(angle) * radius).toFixed(1)} ${(y + Math.sin(angle) * radius).toFixed(1)}`);
  }
  return `<path class="${className}" d="M${points.join(' L')}Z" fill="${fill}"/>`;
}

function spark(x, y, r, fill, className = '') {
  const q = r * 0.25;
  return `<path class="${className}" d="M${x} ${y - r} L${x + q} ${y - q} L${x + r} ${y} L${x + q} ${y + q} L${x} ${y + r} L${x - q} ${y + q} L${x - r} ${y} L${x - q} ${y - q}Z" fill="${fill}"/>`;
}

const WEB = '<path d="M0 -84 L-18 6 M0 -84 L-6 8 M0 -84 L6 8 M0 -84 L18 6 M-5 -62 Q0 -58 5 -62 M-10 -40 Q0 -35 10 -40 M-14 -18 Q0 -12 14 -18" stroke="#ffffffcc" stroke-width="1.6" fill="none"/>';
const delay = (k) => `d${(k % 4) + 1}`;

// Motif de chaque vernis, posé par-dessus sa couleur et découpé à la forme de l'ongle.
const PATTERNS = {
  stars: () => star(-6, -58, 5, '#f2c14e') + star(7, -38, 4, '#fff4c2') + star(-5, -16, 4.5, '#f2c14e') + star(6, -70, 3, '#fff4c2') + star(5, -6, 3, '#fff4c2'),
  dots: () => [[-7, -60], [6, -48], [-6, -34], [7, -20], [-7, -8], [0, -72], [1, -30]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#fff"/>`).join(''),
  web: () => WEB,
  toads: () => [[-4, -56], [5, -22]].map(([x, y]) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="3" rx="8" ry="5.5" fill="#4e9a58"/><circle cx="-4" cy="-2" r="3" fill="#4e9a58"/><circle cx="4" cy="-2" r="3" fill="#4e9a58"/><circle cx="-4" cy="-2" r="1.3" fill="#1b1430"/><circle cx="4" cy="-2" r="1.3" fill="#1b1430"/></g>`).join(''),
  glitter: () => Array.from({ length: 16 }, (_, k) => {
    const x = ((k * 37) % 28) - 14;
    const y = -80 + ((k * 53) % 82);
    return `<circle class="twinkle ${delay(k)}" cx="${x}" cy="${y}" r="${k % 3 ? 1.6 : 2.4}" fill="${k % 2 ? '#fff' : '#fff4c2'}"/>`;
  }).join(''),
  glow: () => '<ellipse cx="-4" cy="-50" rx="4" ry="16" fill="#ffffff66"/>',
  wands: () => `<path d="M-9 -6 L5 -56" stroke="#c98b3a" stroke-width="3.5" stroke-linecap="round"/>${star(6, -62, 7, '#f2c14e')}${spark(-6, -40, 3, '#fff4c2')}${spark(9, -24, 2.5, '#fff4c2')}`,
  hats: () => [[-2, -54], [3, -18]].map(([x, y]) => `<g transform="translate(${x} ${y})"><path d="M-9 4 L9 4 L1 -14 Z" fill="#2c1247"/><rect x="-11" y="3" width="22" height="3" rx="1.5" fill="#2c1247"/><rect x="-5" y="0" width="11" height="2.4" fill="#f2c14e"/></g>`).join(''),
  rainbow: () => '<path d="M-16 -60 L16 -40 L16 -30 L-16 -50 Z M-16 -30 L16 -10 L16 0 L-16 -20Z" fill="#ffffff33"/>',
  spider: () => `${WEB}<g class="spider"><path d="M2 -110 L2 -66" stroke="#fff" stroke-width="1"/><g transform="translate(2 -62)"><path d="M-7 -4 L-11 -8 M-7 0 L-12 0 M-7 4 L-11 8 M7 -4 L11 -8 M7 0 L12 0 M7 4 L11 8" stroke="#1b1430" stroke-width="1.6"/><ellipse cx="0" cy="0" rx="6" ry="7" fill="#1b1430" stroke="#ffffff66" stroke-width="1"/><circle cx="-2" cy="-2" r="1.2" fill="#f2c14e"/><circle cx="2" cy="-2" r="1.2" fill="#f2c14e"/></g></g>`,
  sparks: () => [[-6, -64, 6], [7, -46, 5], [-5, -28, 5.5], [6, -10, 4], [0, -78, 3.5]]
    .map(([x, y, r], k) => spark(x, y, r, k % 2 ? '#fff4c2' : '#f2c14e', `twinkle ${delay(k)}`)).join(''),
};

// Couleurs de chaque vernis, en dégradés, et forme de l'ongle pour découper les motifs.
// prefix rend les identifiants uniques dans la page.
export function polishDefs(prefix) {
  const gradient = (id, edge, middle) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${edge}"/><stop offset=".38" stop-color="${middle}"/><stop offset=".62" stop-color="${middle}"/><stop offset="1" stop-color="${edge}"/></linearGradient>`;
  return `<linearGradient id="${prefix}-bare" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a1468"/><stop offset=".35" stop-color="#9b5ae6"/><stop offset=".6" stop-color="#7a3fc4"/><stop offset="1" stop-color="#2f1255"/></linearGradient>`
    + POLISHES.map((entry) => gradient(`${prefix}-${entry.id}`, entry.colors[0], entry.colors[1])).join('')
    + `<clipPath id="${prefix}-clip"><path d="${NAIL_PATH}"/></clipPath>`;
}

// Le dessin d'un ongle verni : sa couleur, son motif et son reflet.
// Sans vernis, l'ongle garde le violet de la sorcière du palier 1.
export function nailMarkup(prefix, polishId) {
  const entry = polishId ? POLISHES.find((candidate) => candidate.id === polishId) : null;
  const fill = `url(#${prefix}-${entry ? entry.id : 'bare'})`;
  const pattern = entry?.pattern ? `<g clip-path="url(#${prefix}-clip)">${PATTERNS[entry.pattern]()}</g>` : '';
  return `<path d="${NAIL_PATH}" fill="${fill}" stroke="#250c45" stroke-width="2"/>${pattern}`
    + '<path d="M-8 -4 L-8 -38 Q-7 -56 0 -66" stroke="#ffffffaa" stroke-width="4.5" fill="none" stroke-linecap="round"/>'
    + '<path d="M8 -8 L8 -28" stroke="#ffffff44" stroke-width="3" stroke-linecap="round"/>';
}

// Classe ajoutée à l'ongle pour les vernis qui bougent tout entiers.
export function nailClass(polishId) {
  const entry = polishId ? POLISHES.find((candidate) => candidate.id === polishId) : null;
  if (entry?.pattern === 'rainbow') return 'polish-rainbow';
  if (entry?.pattern === 'glow') return 'polish-glow';
  return '';
}

// Vignette d'un vernis pour la boutique : un ongle sur un bout de doigt.
export function polishSwatch(polishId) {
  const prefix = `swatch-${polishId}-${Math.random().toString(36).slice(2, 8)}`;
  const markup = `<svg xmlns="${SVG}" viewBox="-26 -104 52 116" aria-hidden="true"><defs>${polishDefs(prefix)}</defs>`
    + `<rect x="-20" y="-8" width="40" height="22" rx="10" fill="#8cc56b"/><g class="${nailClass(polishId)}" transform="scale(1 1.08)">${nailMarkup(prefix, polishId)}</g></svg>`;
  const template = document.createElement('template');
  template.innerHTML = markup;
  return template.content.firstElementChild;
}

// --- Pictogrammes des effets de casse ---

const BAT = '<path d="M0 -6 C-14 -30 -40 -34 -60 -20 C-50 -16 -46 -8 -48 2 C-40 -4 -30 -2 -24 6 C-18 0 -8 2 0 8 C8 2 18 0 24 6 C30 -2 40 -4 48 2 C46 -8 50 -16 60 -20 C40 -34 14 -30 0 -6Z" fill="#3b2a5c" stroke="#b8add4" stroke-width="2"/><path d="M-6 -14 L-8 -24 L-2 -16 M6 -14 L8 -24 L2 -16" fill="#3b2a5c" stroke="#b8add4" stroke-width="2"/><circle cx="-4" cy="-8" r="2" fill="#f2c14e"/><circle cx="4" cy="-8" r="2" fill="#f2c14e"/>';
const TOAD = '<ellipse cx="20" cy="26" rx="16" ry="11" fill="#4e9a58" stroke="#2b5a32" stroke-width="1.5"/><circle cx="12" cy="15" r="6" fill="#4e9a58" stroke="#2b5a32" stroke-width="1.5"/><circle cx="28" cy="15" r="6" fill="#4e9a58" stroke="#2b5a32" stroke-width="1.5"/><circle cx="12" cy="15" r="2.6" fill="#1b1430"/><circle cx="28" cy="15" r="2.6" fill="#1b1430"/><path d="M11 27 Q20 33 29 27" stroke="#1b1430" stroke-width="2" fill="none" stroke-linecap="round"/>';
const PUMPKIN = '<path d="M19 9 Q19 4 23 3" stroke="#3f7a2c" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="13" cy="23" rx="9" ry="12" fill="#e8741c"/><ellipse cx="27" cy="23" rx="9" ry="12" fill="#e8741c"/><ellipse cx="20" cy="23" rx="8" ry="13" fill="#ff9a2e" stroke="#b5520c" stroke-width="1.2"/><path d="M14 20 l3 -3 2 3 M22 20 l3 -3 2 3 M14 28 Q20 33 26 28" stroke="#4d2300" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
const CAULDRON = '<path d="M7 17 Q6 36 20 36 Q34 36 33 17Z" fill="#14101c" stroke="#b8add4" stroke-width="1.5"/><ellipse cx="20" cy="17" rx="14" ry="4.5" fill="#6cc24a" stroke="#b8add4" stroke-width="1.5"/><circle cx="16" cy="10" r="3" fill="#6cc24a"/><circle cx="24" cy="7" r="2" fill="#6cc24a"/><path d="M10 37 L8 40 M30 37 L32 40" stroke="#b8add4" stroke-width="2"/>';
const PICTOGRAMS = {
  fond: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 Q30 18 30 24 a10 10 0 0 1 -20 0 Q10 18 20 4Z" fill="#b685e6" stroke="#250c45" stroke-width="1.5"/><ellipse cx="20" cy="36" rx="11" ry="2.5" fill="#b685e6" opacity=".6"/></svg>',
  paillettes: `<svg viewBox="0 0 40 40" aria-hidden="true">${spark(12, 12, 6, '#7dff6a')}${spark(27, 9, 4, '#c8ff6a')}${spark(24, 25, 7, '#4ed36a')}${spark(10, 30, 4, '#c8ff6a')}<circle cx="32" cy="32" r="2" fill="#7dff6a"/><circle cx="18" cy="20" r="1.6" fill="#fff"/></svg>`,
  chauvesouris: `<svg viewBox="-64 -40 128 64" aria-hidden="true">${BAT}</svg>`,
  crapaud: `<svg viewBox="0 0 40 40" aria-hidden="true">${TOAD}</svg>`,
  citrouille: `<svg viewBox="0 0 40 40" aria-hidden="true">${PUMPKIN}</svg>`,
  chaudron: `<svg viewBox="0 0 40 40" aria-hidden="true">${CAULDRON}</svg>`,
};

export function effectPictogram(effectId) {
  const template = document.createElement('template');
  template.innerHTML = PICTOGRAMS[effectId] ?? PICTOGRAMS.fond;
  return template.content.firstElementChild;
}

// --- Effets de casse, joués sur un ongle qui casse ---

// Un dessin placé dans un carré, au milieu du repère de l'ongle.
const placed = (inner, viewBox, x, y, size) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}" overflow="visible">${inner}</svg>`;
const burst = (count, radius, step, makePiece, offsetY = -40) => Array.from({ length: count }, (_, k) => {
  const angle = (k / count) * Math.PI * 2;
  const distance = radius + (k % 4) * step;
  const dx = Math.round(Math.cos(angle) * distance);
  const dy = Math.round(Math.sin(angle) * distance - 40);
  return `<g transform="translate(0 ${offsetY})"><g class="fx-burst ${delay(k)}" data-dx="${dx}" data-dy="${dy}">${makePiece(k)}</g></g>`;
}).join('');

// Petite bulle de bruitage (« Croâ ! », « Burp ! »). Son texte est retourné sur la main droite,
// qui est l'image retournée de la main gauche, pour rester lisible.
const say = (text, x, y, width, extra) => `<g transform="translate(${x} ${y})"><g class="fx-say ${extra}"><g class="fx-text">`
  + `<rect x="${-width / 2}" y="-38" width="${width}" height="46" rx="20" fill="#f4ecd6"/>`
  + `<text x="0" y="-6" text-anchor="middle" font-family="Grandstander, sans-serif" font-weight="800" font-size="30" fill="#2a1d45">${text}</text></g></g></g>`;

const EFFECT_MARKUP = {
  // L'ongle qui fond : trois gouttes de vernis (palier 1, DEC-104).
  fond: () => [-6, 2, 8].map((dx, k) => `<circle class="drop ${delay(k + 1)}" cx="${dx}" cy="${-30 - k * 8}" r="${5 - k * 0.8}"/>`).join(''),
  // Nuage de paillettes vertes qui s'envolent tout autour.
  paillettes: () => burst(22, 90, 45, (k) => spark(0, 0, 7 + (k % 3) * 3, ['#7dff6a', '#c8ff6a', '#4ed36a', '#ffffff'][k % 4])),
  // La chauve-souris bat des ailes et s'envole hors de l'écran.
  chauvesouris: () => `<g transform="translate(0 -50)"><g class="fx-fly"><g class="fx-pop"><g class="fx-flap">${placed(BAT, '-64 -40 128 64', -75, -45, 150)}</g></g></g></g>`,
  // Le crapaud apparaît, coasse et saute hors de l'écran.
  crapaud: () => `<g transform="translate(0 -40)"><g class="fx-hop"><g class="fx-pop">${placed(TOAD, '0 0 40 40', -55, -55, 110)}</g></g></g>`
    + say('Croâ !', 86, -110, 104, ''),
  // La citrouille gonfle, puis éclate en morceaux et en étincelles.
  citrouille: () => `<g transform="translate(0 -46)"><g class="fx-swell">${placed(PUMPKIN, '0 0 40 40', -50, -50, 100)}</g></g>`
    + burst(12, 130, 25, (k) => `<path d="M-10 -8 Q0 -16 10 -8 L6 8 Q0 12 -6 8Z" fill="${k % 2 ? '#ff9a2e' : '#e8741c'}"/>`, -46).replaceAll('fx-burst', 'fx-burst fx-late')
    + burst(8, 80, 20, () => spark(0, 0, 8, '#f2c14e'), -60).replaceAll('fx-burst', 'fx-burst fx-late'),
  // Le chaudron avale l'ongle, hoquette deux fois et rote un nuage vert.
  chaudron: () => `<g transform="translate(0 -40)"><g class="fx-fall"><path d="${NAIL_PATH}" fill="#9b5ae6" transform="scale(.6)"/></g></g>`
    + `<g transform="translate(0 110)"><g class="fx-pop"><g class="fx-hiccup">${placed(CAULDRON, '0 0 40 40', -75, -90, 150)}</g></g></g>`
    + '<g transform="translate(-10 0)"><g class="fx-burp"><circle cx="0" cy="0" r="26" fill="#6cc24a88"/><circle cx="30" cy="-24" r="18" fill="#6cc24a66"/><circle cx="-24" cy="-30" r="14" fill="#6cc24a66"/></g></g>'
    + say('Burp !', 82, -60, 116, 'fx-say-late'),
};

// Durée de chaque effet, en millisecondes, avant que ses dessins soient retirés.
export const EFFECT_DURATION = { fond: 2200, paillettes: 1900, chauvesouris: 2900, crapaud: 3400, citrouille: 2300, chaudron: 3500 };

// Joue un effet dans le repère local d'un ongle (shape), puis retire ses dessins.
// mirrored : l'ongle est sur la main droite, dessinée retournée.
export function playEffect(shape, effectId, { mirrored = false } = {}) {
  const name = EFFECT_MARKUP[effectId] ? effectId : 'fond';
  const group = document.createElementNS(SVG, 'g');
  group.setAttribute('class', `fx fx-${name}`);
  group.append(...fromMarkup(EFFECT_MARKUP[name]()));
  if (mirrored) group.querySelectorAll('.fx-text').forEach((text) => text.setAttribute('transform', 'scale(-1 1)'));
  shape.append(group);
  setTimeout(() => group.remove(), EFFECT_DURATION[name]);
  return name;
}
