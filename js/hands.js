// Ongles de sorcière - Les deux mains de la sorcière.
// La main est une image d'une IA de dessin (DEC-091) ; la main droite est la même image,
// retournée. Le programme dessine les ongles vernis par-dessus, les fait pousser, les fait
// fondre, et gère le balayage qui agrandit une main (DEC-092).
// Les deux mains sont croisées en diagonale, sans texte : la gauche part du bas à gauche,
// doigts vers le haut à droite ; la droite part du haut à droite, doigts vers le haut à gauche.
//
// Ongles numérotés de 0 à 9 : 0 à 4 pour la main gauche, du pouce à l'auriculaire,
// puis 5 à 9 pour la main droite, dans le même ordre.

import { MAX_NAIL_LENGTH, nailLength } from './rules.js';

const SVG = 'http://www.w3.org/2000/svg';
const HAND_IMAGE = 'img/main.webp';
// Repère de l'image de la main : un carré de 1254 unités.
const IMAGE_SIZE = 1254;

const FINGERS = ['pouce', 'index', 'majeur', 'annulaire', 'auriculaire'];
// Ongle naturel de chaque doigt sur l'image de la main gauche : centre, angle du doigt, largeur.
const NAIL_SPOTS = [
  { x: 970, y: 653, angle: 50, width: 40 },
  { x: 1010, y: 332, angle: 36, width: 38 },
  { x: 935, y: 211, angle: 26, width: 40 },
  { x: 804, y: 164, angle: 26, width: 40 },
  { x: 617, y: 256, angle: 31, width: 34 },
];

// Place des deux mains dans le dessin, et agrandissement d'une main après un balayage.
const POSES = { left: 'translate(-150 620)', right: 'translate(336 -40)' };
const ZOOMS = {
  both: 'none',
  left: 'translate(-9px, -857px) scale(1.38)',
  right: 'translate(-478px, 54px) scale(1.38)',
};

// Durée de la fonte d'un ongle, en millisecondes (environ 1,5 s, écran 3).
export const MELT_DURATION = 1500;
// Balayage : au moins 50 points à l'horizontale, nettement plus qu'à la verticale (comme la maquette).
const SWIPE_DISTANCE = 50;
const SWIPE_SLOPE = 1.3;
// Un toucher qui suit de près un balayage est ignoré.
const SWIPE_CLICK_GUARD = 350;

let gradientCount = 0;

// Petite main dessinée pour les boutons d'agrandissement, inclinée comme la vraie main.
function handIcon(side, x, y) {
  const fingers = [[2.2, 5], [5.6, 2], [9, 3], [12.4, 6]].map(([dx, dy]) =>
    svg('rect', { x: dx, y: dy, width: '2.6', height: '12', rx: '1.3' }));
  return svg('g', { class: 'hand-icon', transform: `translate(${x - 8} ${y}) rotate(${side === 'left' ? 30 : -30} 8 22)` },
    [svg('rect', { x: '2', y: '12', width: '13', height: '12', rx: '4' }), ...fingers]);
}

function focusIcon(value) {
  const parts = value === 'both' ? [handIcon('left', 12, 2), handIcon('right', 28, 14)] : [handIcon(value, 20, 6)];
  return svg('svg', { viewBox: '0 0 40 40', 'aria-hidden': 'true' }, parts);
}

function svg(name, attributes = {}, children = []) {
  const element = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  element.append(...children);
  return element;
}

// Hauteur du vernis selon la longueur : 0, seul l'ongle naturel de l'image se voit ;
// de 1 à 7, le vernis dépasse de plus en plus du doigt.
function nailScale(length) {
  return length <= 0 ? 0.08 : (40 + length * 13) / 90;
}

function paintNail(finger, preservedDays, melted) {
  const length = nailLength(preservedDays);
  const nail = finger.querySelector('.nail');
  nail.style.transform = `scaleY(${melted ? 0.08 : nailScale(length)})`;
  nail.style.opacity = melted || length <= 0 ? '0' : '1';
  finger.classList.toggle('melted', melted);
  finger.classList.toggle('very-long', !melted && preservedDays >= MAX_NAIL_LENGTH);
  if (finger.hasAttribute('role')) finger.setAttribute('aria-pressed', String(melted));
}

function buildFinger(index, side, gradientId, interactive) {
  const spot = NAIL_SPOTS[index % 5];
  const radians = (spot.angle * Math.PI) / 180;
  const baseX = spot.x - Math.sin(radians) * 22;
  const baseY = spot.y + Math.cos(radians) * 22;

  const nail = svg('g', { class: 'nail' }, [
    svg('path', {
      d: 'M-16 6 L-16 -38 Q-15 -68 0 -84 Q15 -68 16 -38 L16 6 Q0 11 -16 6 Z',
      fill: `url(#${gradientId})`, stroke: '#250c45', 'stroke-width': '2',
    }),
    svg('path', { d: 'M-8 -4 L-8 -38 Q-7 -56 0 -66', stroke: '#ffffffaa', 'stroke-width': '4.5', fill: 'none', 'stroke-linecap': 'round' }),
    svg('path', { d: 'M8 -8 L8 -28', stroke: '#ffffff44', 'stroke-width': '3', 'stroke-linecap': 'round' }),
  ]);
  const placed = svg('g', {
    class: 'finger-shape',
    transform: `translate(${baseX} ${baseY}) rotate(${spot.angle}) scale(${spot.width / 32})`,
  }, [
    svg('rect', { class: 'finger-zone', x: '-40', y: '-150', width: '80', height: '230', rx: '40' }),
    nail,
    svg('ellipse', { class: 'puddle', cx: '0', cy: '2', rx: '13', ry: '5' }),
    svg('path', { class: 'sparkle', d: 'M22 -150 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z' }),
  ]);

  const finger = svg('g', { class: 'finger' }, [placed]);
  finger.dataset.nail = String(index);
  if (interactive) {
    finger.setAttribute('role', 'button');
    finger.setAttribute('tabindex', '0');
    finger.setAttribute('aria-label', `${FINGERS[index % 5]} ${side === 'left' ? 'gauche' : 'droit'}`);
  }
  return finger;
}

function buildHand(side, gradientId, interactive) {
  const fingers = [0, 1, 2, 3, 4].map((k) => buildFinger(side === 'left' ? k : k + 5, side, gradientId, interactive));
  const image = svg('image', { href: HAND_IMAGE, width: IMAGE_SIZE, height: IMAGE_SIZE });
  const flipped = svg('g', side === 'right' ? { transform: `translate(${IMAGE_SIZE} 0) scale(-1 1)` } : {}, [image, ...fingers]);
  return { group: svg('g', { class: `hand hand-${side}`, transform: POSES[side] }, [flipped]), fingers };
}

// Petites gouttes de vernis qui tombent d'un ongle qui fond.
function drip(finger) {
  const shape = finger.querySelector('.finger-shape');
  [-6, 2, 8].forEach((dx, k) => {
    const drop = svg('circle', { class: 'drop', cx: dx, cy: -30 - k * 8, r: 5 - k * 0.8 });
    drop.style.animationDelay = `${0.25 + k * 0.22}s`;
    shape.append(drop);
    setTimeout(() => drop.remove(), MELT_DURATION + 700);
  });
}

// Crée les deux mains.
//   preserved : nombre de jours préservés de chaque ongle (10 nombres), qui donne sa longueur ;
//   melted    : ongles fondus (rongés) ;
//   interactive : chaque doigt se touche ; onToggle(numéro, fondu) est appelé à chaque toucher ;
//   swipe     : un balayage agrandit une main ; des boutons ronds font de même.
export function createHands({ preserved, melted = [], interactive = false, swipe = false, mini = false, onToggle }) {
  const gradientId = `nail-gradient-${++gradientCount}`;
  const gradient = svg('linearGradient', { id: gradientId, x1: '0', y1: '0', x2: '1', y2: '0' },
    [['0', '#3a1468'], ['.35', '#9b5ae6'], ['.6', '#7a3fc4'], ['1', '#2f1255']]
      .map(([offset, color]) => svg('stop', { offset, 'stop-color': color })));

  const left = buildHand('left', gradientId, interactive);
  const right = buildHand('right', gradientId, interactive);
  const fingers = [...left.fingers, ...right.fingers];
  const zoom = svg('g', { class: 'zoom' }, [left.group, right.group]);
  const drawing = svg('svg', {
    class: `hands${mini ? ' mini' : ''}`, viewBox: '0 0 1500 1860',
    role: interactive ? 'group' : 'img', 'aria-label': 'les deux mains de la sorcière',
  }, [svg('defs', {}, [gradient]), zoom]);

  let lengths = [...preserved];
  let swipedAt = 0;
  const state = new Set(melted);
  fingers.forEach((finger, index) => paintNail(finger, lengths[index], state.has(index)));

  const container = document.createElement('div');
  container.className = 'hands-area';
  container.append(drawing);

  if (interactive) {
    const toggle = (finger) => {
      const index = Number(finger.dataset.nail);
      const nowMelted = !state.has(index);
      if (nowMelted) state.add(index); else state.delete(index);
      paintNail(finger, lengths[index], nowMelted);
      if (nowMelted) drip(finger);
      onToggle?.(index, nowMelted);
    };
    fingers.forEach((finger) => {
      // Un balayage qui commence sur un doigt ne doit pas faire fondre son ongle.
      finger.addEventListener('click', () => { if (Date.now() - swipedAt > SWIPE_CLICK_GUARD) toggle(finger); });
      finger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(finger); }
      });
    });
  }

  // --- Agrandissement d'une main ---
  let focus = 'both';
  const buttons = [];
  const setFocus = (next) => {
    focus = next;
    zoom.style.transform = ZOOMS[focus];
    left.group.classList.toggle('faded', focus === 'right');
    right.group.classList.toggle('faded', focus === 'left');
    // La main agrandie passe devant l'autre.
    zoom.append(focus === 'left' ? left.group : right.group);
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.focus === focus)));
  };

  if (swipe) {
    container.classList.add('swipe');
    // Balayage vers la droite : la main gauche vient ; vers la gauche : la main droite (DEC-092).
    let start = null;
    container.addEventListener('pointerdown', (event) => { start = { x: event.clientX, y: event.clientY }; });
    container.addEventListener('pointerup', (event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * SWIPE_SLOPE) return;
      swipedAt = Date.now();
      if (dx > 0) setFocus(focus === 'right' ? 'both' : 'left');
      else setFocus(focus === 'left' ? 'both' : 'right');
    });
    container.addEventListener('pointercancel', () => { start = null; });

    const row = document.createElement('div');
    row.className = 'focus-buttons';
    for (const [value, label] of [['left', 'Main gauche en grand'], ['both', 'Les deux mains'], ['right', 'Main droite en grand']]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `round focus-${value}`;
      button.dataset.focus = value;
      button.setAttribute('aria-label', label);
      button.append(focusIcon(value));
      button.addEventListener('click', () => setFocus(value));
      buttons.push(button);
      row.append(button);
    }
    container.append(row);
    setFocus('both');
  }

  return {
    element: container,
    melted: () => [...state].sort((a, b) => a - b),
    // Fait pousser les ongles jusqu'aux nouvelles longueurs, sous les yeux de l'enfant (écran 4).
    grow(nextPreserved) {
      lengths = [...nextPreserved];
      fingers.forEach((finger, index) => paintNail(finger, lengths[index], state.has(index)));
    },
    setFocus,
  };
}
