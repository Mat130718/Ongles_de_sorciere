// Ongles de sorcière - Catalogue et règles de la boutique (palier 2, US-015, US-016, US-024).
// Fonctions pures : elles ne lisent ni l'écran, ni le stockage, ni l'heure.
//
// Le catalogue est livré avec l'application ; les achats de l'enfant sont gardés à part, dans
// ses données (RG-019, EX-023). Un objet ajouté au catalogue par une mise à jour apparaît
// simplement dans la boutique.
//
// Achat gardé dans les données : { item: 'polish:cerise' ou 'effect:citrouille', price: 120, at: texte ISO }.
// Le prix payé est gardé avec l'achat : si un prix change un jour, le solde passé ne bouge pas.
//
// Vernis posés : 10 identifiants de vernis, ou null pour un ongle sans vernis (DEC-130).
// Effet de casse : l'identifiant d'un effet acheté, ou SURPRISE (DEC-131).

import { isDeclarationOpen, storyDate } from './calendar.js';
import { forgottenDates, spentPoints } from './rules.js';

export { spentPoints };

// Quatre niveaux de prix (RG-017, DEC-005).
export const LEVELS = [
  { id: 'start', name: 'Départ', price: 50, moons: 1 },
  { id: 'common', name: 'Courant', price: 120, moons: 2 },
  { id: 'rare', name: 'Rare', price: 300, moons: 3 },
  { id: 'legendary', name: 'Légendaire', price: 700, moons: 4 },
];

// Vernis choisis par l'enfant sur la maquette de la boutique (28/10/2026).
// colors : bord et centre du vernis ; pattern : dessin ajouté par-dessus (js/magic.js).
export const POLISHES = [
  { id: 'cerise', name: 'Rouge cerise', level: 'start', colors: ['#6a0c1d', '#e0344f'] },
  { id: 'grenouille', name: 'Vert grenouille', level: 'start', colors: ['#1f5a1c', '#6cc24a'] },
  { id: 'minuit', name: 'Bleu minuit', level: 'start', colors: ['#0d1a4a', '#4469e0'] },
  { id: 'bonbon', name: 'Rose bonbon', level: 'start', colors: ['#8a2a63', '#ff8fc8'] },
  { id: 'potiron', name: 'Orange potiron', level: 'start', colors: ['#8a3a00', '#ff9a2e'] },
  { id: 'corbeau', name: 'Noir corbeau', level: 'start', colors: ['#050308', '#4a3d5c'] },
  { id: 'etoiles', name: 'Nuit étoilée', level: 'common', colors: ['#0d1a4a', '#2b3f9a'], pattern: 'stars' },
  { id: 'pois', name: 'Pois de fée', level: 'common', colors: ['#8a2a63', '#ff8fc8'], pattern: 'dots' },
  { id: 'toile', name: 'Toile d’araignée', level: 'common', colors: ['#120e1a', '#4a3d5c'], pattern: 'web' },
  { id: 'crapauds', name: 'Petits crapauds', level: 'common', colors: ['#b9dc8a', '#efffd2'], pattern: 'toads' },
  { id: 'paillettes', name: 'Paillettes d’or', level: 'rare', colors: ['#4d3200', '#f2c14e'], pattern: 'glitter' },
  { id: 'lumineux', name: 'Vert qui brille', level: 'rare', colors: ['#3a9a1c', '#c8ff6a'], pattern: 'glow' },
  { id: 'baguettes', name: 'Baguettes magiques', level: 'rare', colors: ['#2a0f4a', '#7a3fc4'], pattern: 'wands' },
  { id: 'chapeaux', name: 'Chapeaux pointus', level: 'rare', colors: ['#cdb8f0', '#ffffff'], pattern: 'hats' },
  { id: 'arcenciel', name: 'Vernis qui change de couleur', level: 'legendary', colors: ['#7a0f22', '#ff6a3a'], pattern: 'rainbow' },
  { id: 'araignee', name: 'Toile et petite araignée', level: 'legendary', colors: ['#120e1a', '#4a3d5c'], pattern: 'spider' },
  { id: 'etincelles', name: 'Étincelles de baguette', level: 'legendary', colors: ['#1a0a33', '#5b2a8c'], pattern: 'sparks' },
];

// Effets de casse (EX-012). L'ongle qui fond est offert dès le départ.
export const MELT = 'fond';
export const SURPRISE = 'surprise';
export const EFFECTS = [
  { id: MELT, name: 'L’ongle qui fond', level: null },
  { id: 'paillettes', name: 'Nuage de paillettes vertes', level: 'start' },
  { id: 'chauvesouris', name: 'Chauve-souris qui s’envole', level: 'common' },
  { id: 'crapaud', name: 'Crapaud qui coasse et saute', level: 'rare' },
  { id: 'citrouille', name: 'Citrouille qui éclate', level: 'rare' },
  { id: 'chaudron', name: 'Chaudron qui hoquette et rote', level: 'legendary' },
];

const LEVELS_BY_ID = new Map(LEVELS.map((level) => [level.id, level]));
const ITEMS = new Map([
  ...POLISHES.map((polish) => [`polish:${polish.id}`, { ...polish, kind: 'polish' }]),
  ...EFFECTS.map((effect) => [`effect:${effect.id}`, { ...effect, kind: 'effect' }]),
]);

export const itemKey = (kind, id) => `${kind}:${id}`;
export const item = (key) => ITEMS.get(key) ?? null;
export const level = (id) => LEVELS_BY_ID.get(id) ?? null;
export const polish = (id) => POLISHES.find((entry) => entry.id === id) ?? null;
export const effect = (id) => EFFECTS.find((entry) => entry.id === id) ?? null;

// Prix d'un objet du catalogue : celui de son niveau, ou 0 pour un objet offert.
export function priceOf(key) {
  const entry = item(key);
  if (!entry) throw new RangeError(`Objet inconnu : ${key}`);
  return entry.level ? level(entry.level).price : 0;
}

// Objets de l'enfant : les objets offerts, puis ses achats.
export function ownedKeys(purchases = []) {
  return new Set([itemKey('effect', MELT), ...purchases.map((purchase) => purchase.item)]);
}

// La boutique ouvre quand tous les soirs à raconter le sont : aucun soir oublié encore
// rattrapable, et le soir en cours raconté, sauf avant 16 h où il n'y a rien à raconter
// (RG-016, DEC-128).
export function isShopOpen({ days, weeks, firstLaunch, now }) {
  if (forgottenDates({ days, weeks, firstLaunch, now }).length) return false;
  if (!isDeclarationOpen(now)) return true;
  const today = storyDate(now);
  return days.some((day) => day.date === today);
}

// Peut-on acheter cet objet ? Rend { ok: true } ou { ok: false, reason, missing } :
//   'owned'   : l'objet est déjà à l'enfant ;
//   'paused'  : solde négatif après une correction, les achats sont en pause (DEC-129) ;
//   'missing' : il manque des points (RG-018) ; missing dit combien.
export function canBuy(key, { balance, purchases = [] }) {
  if (ownedKeys(purchases).has(key)) return { ok: false, reason: 'owned' };
  if (balance < 0) return { ok: false, reason: 'paused' };
  const price = priceOf(key);
  if (balance < price) return { ok: false, reason: 'missing', missing: price - balance };
  return { ok: true };
}

// Achat confirmé par l'enfant (DEC-132) : la liste des achats avec le nouvel achat au bout.
export function buy(key, { balance, purchases = [], now }) {
  const check = canBuy(key, { balance, purchases });
  if (!check.ok) throw new RangeError(`Achat impossible : ${check.reason}`);
  return [...purchases, { item: key, price: priceOf(key), at: now.toISOString() }];
}

// Vernis posé sur toute la main, puis retouché ongle par ongle (DEC-130).
export function polishAll(id) {
  return new Array(10).fill(id);
}

export function polishOne(current, nail, id) {
  const next = Array.isArray(current) && current.length === 10 ? [...current] : new Array(10).fill(null);
  next[nail] = id;
  return next;
}

// Vernis réellement posés : un vernis inconnu ou pas acheté ne s'affiche pas.
export function wornPolish(stored, purchases = []) {
  const owned = ownedKeys(purchases);
  return Array.from({ length: 10 }, (_, nail) => {
    const id = Array.isArray(stored) ? stored[nail] : null;
    return id && polish(id) && owned.has(itemKey('polish', id)) ? id : null;
  });
}

// Effet joué quand un ongle casse : l'effet choisi, ou un effet tiré au hasard parmi ceux
// de l'enfant pour « Surprise » (DEC-131). random est passé pour les tests.
export function breakEffect(choice, purchases = [], random = Math.random) {
  const owned = ownedKeys(purchases);
  const mine = EFFECTS.filter((entry) => owned.has(itemKey('effect', entry.id)));
  if (choice === SURPRISE) return mine[Math.floor(random() * mine.length)].id;
  return mine.some((entry) => entry.id === choice) ? choice : MELT;
}
