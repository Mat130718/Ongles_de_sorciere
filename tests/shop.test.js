// Ongles de sorcière - Tests de la boutique (palier 2, US-015, US-016, US-024).
// Lancement, à la racine du dépôt : npm test, ou node --test "tests/*.test.js".
// Toutes les dates sont fictives. Le fuseau de Paris est imposé, comme pour les règles de points.

process.env.TZ = 'Europe/Paris';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, atLocal } from '../js/calendar.js';
import { buildBackup, parseBackup } from '../js/backup.js';
import { childRecord, computeHistory, correctedRecord } from '../js/rules.js';
import {
  breakEffect, buy, canBuy, EFFECTS, isShopOpen, itemKey, LEVELS, MELT, ownedKeys, polishAll,
  polishOne, POLISHES, priceOf, spentPoints, SURPRISE, wornPolish,
} from '../js/shop.js';
import { TEXTS } from '../js/texts.js';

const MONDAY = '2026-11-02';
const declared = (date, bitten = []) => childRecord(date, bitten, atLocal(date, 18));
const perfectEvenings = (first, count) => Array.from({ length: count }, (_, index) => declared(addDays(first, index)));
const purchase = (kind, id, at = atLocal(MONDAY, 19)) => ({ item: itemKey(kind, id), price: priceOf(itemKey(kind, id)), at: at.toISOString() });

test('DEC-005, DEC-133 : quatre niveaux de prix, 17 vernis et 6 effets dont la citrouille au niveau rare', () => {
  assert.deepEqual(LEVELS.map((level) => level.price), [50, 120, 300, 700]);
  assert.equal(POLISHES.length, 17);
  assert.deepEqual(['start', 'common', 'rare', 'legendary'].map((id) => POLISHES.filter((p) => p.level === id).length), [6, 4, 4, 3]);
  assert.equal(EFFECTS.length, 6);
  assert.equal(priceOf(itemKey('effect', MELT)), 0);
  assert.equal(priceOf(itemKey('effect', 'citrouille')), 300);
  assert.equal(priceOf(itemKey('effect', 'chaudron')), 700);
  assert.equal(priceOf(itemKey('polish', 'cerise')), 50);
  assert.throws(() => priceOf('polish:inconnu'), RangeError);
});

test('RG-018, DEC-129 : achat possible si le solde couvre le prix, en pause si le solde est négatif', () => {
  const key = itemKey('polish', 'etoiles');
  assert.deepEqual(canBuy(key, { balance: 120 }), { ok: true });
  assert.deepEqual(canBuy(key, { balance: 80 }), { ok: false, reason: 'missing', missing: 40 });
  assert.deepEqual(canBuy(key, { balance: -35 }), { ok: false, reason: 'paused' });
  assert.deepEqual(canBuy(itemKey('effect', MELT), { balance: 500 }), { ok: false, reason: 'owned' });
  const bought = buy(key, { balance: 260, purchases: [], now: atLocal(MONDAY, 19) });
  assert.equal(bought.length, 1);
  assert.equal(bought[0].price, 120);
  assert.deepEqual(canBuy(key, { balance: 140, purchases: bought }), { ok: false, reason: 'owned' });
  assert.throws(() => buy(key, { balance: 100, purchases: [], now: atLocal(MONDAY, 19) }), RangeError);
});

test('RG-011 : le solde est gagné moins dépensé, et peut devenir négatif après une correction', () => {
  // Trois soirs parfaits : 3 × 15 + bonus de série du 3e soir = 50 points.
  const days = perfectEvenings(MONDAY, 3);
  const now = atLocal('2026-11-04', 21);
  const purchases = [purchase('polish', 'cerise')];
  const before = computeHistory({ days, weeks: [], firstLaunch: MONDAY, now, purchases });
  assert.equal(before.earned, 50);
  assert.equal(before.spent, 50);
  assert.equal(before.balance, 0);
  // Le parent corrige le mardi : les points du mardi et le bonus de série disparaissent.
  const corrected = days.map((day) => (day.date === '2026-11-03' ? correctedRecord(day, [2], atLocal('2026-11-08', 17)) : day));
  const after = computeHistory({ days: corrected, weeks: [], firstLaunch: MONDAY, now, purchases });
  assert.ok(after.balance < 0, `solde ${after.balance}`);
  // Le vernis acheté reste acquis.
  assert.ok(ownedKeys(purchases).has(itemKey('polish', 'cerise')));
  assert.equal(spentPoints(purchases), 50);
});

test('RG-016, DEC-128 : la boutique ouvre quand tous les soirs à raconter le sont', () => {
  const firstLaunch = MONDAY;
  const tuesday = '2026-11-03';
  const open = (days, now) => isShopOpen({ days, weeks: [], firstLaunch, now });
  // Mardi 20 h, lundi raconté mais pas encore mardi : fermée.
  assert.equal(open([declared(MONDAY)], atLocal(tuesday, 20)), false);
  // Mardi 20 h, les deux soirs racontés : ouverte.
  assert.equal(open([declared(MONDAY), declared(tuesday)], atLocal(tuesday, 20)), true);
  // Mercredi 10 h, avant 16 h, la veille racontée : ouverte.
  assert.equal(open([declared(MONDAY), declared(tuesday)], atLocal('2026-11-04', 10)), true);
  // Mercredi 10 h, mardi oublié : fermée tant qu'il n'est pas rattrapé.
  assert.equal(open([declared(MONDAY)], atLocal('2026-11-04', 10)), false);
  // Mercredi 1 h du matin, le soir de mardi court encore : fermée tant qu'il n'est pas raconté.
  assert.equal(open([declared(MONDAY)], atLocal('2026-11-04', 1)), false);
});

test('DEC-130 : vernis sur toute la main, puis retouche ongle par ongle', () => {
  const all = polishAll('minuit');
  assert.deepEqual(all, new Array(10).fill('minuit'));
  const touched = polishOne(all, 3, 'etoiles');
  assert.equal(touched[3], 'etoiles');
  assert.equal(touched[4], 'minuit');
  assert.deepEqual(polishOne(undefined, 0, 'cerise'), ['cerise', ...new Array(9).fill(null)]);
  // Un vernis pas acheté, ou inconnu, ne se voit pas.
  const purchases = [purchase('polish', 'minuit')];
  const worn = wornPolish(touched, purchases);
  assert.equal(worn[3], null);
  assert.equal(worn[4], 'minuit');
  assert.deepEqual(wornPolish(['inconnu'], purchases), new Array(10).fill(null));
});

test('DEC-131 : effet choisi, ou tiré au hasard parmi ceux de l’enfant pour « Surprise »', () => {
  const purchases = [purchase('effect', 'citrouille'), purchase('effect', 'crapaud')];
  assert.equal(breakEffect('citrouille', purchases), 'citrouille');
  // Un effet pas acheté retombe sur l'ongle qui fond.
  assert.equal(breakEffect('chaudron', purchases), MELT);
  assert.equal(breakEffect(SURPRISE, [], () => 0.9), MELT);
  const drawn = new Set([0, 0.4, 0.8].map((value) => breakEffect(SURPRISE, purchases, () => value)));
  assert.deepEqual([...drawn].sort(), ['citrouille', 'crapaud', MELT].sort());
});

test('RG-019 : achats, vernis et effet partent dans la sauvegarde et reviennent à la restauration', () => {
  const now = atLocal('2026-11-04', 21);
  const settings = {
    firstLaunch: MONDAY, soundOn: true,
    purchases: [purchase('polish', 'minuit'), purchase('effect', 'citrouille')],
    polish: polishOne(polishAll('minuit'), 2, null),
    breakEffect: SURPRISE,
  };
  const file = buildBackup({ days: perfectEvenings(MONDAY, 3), weeks: [], settings }, now);
  const result = parseBackup(JSON.stringify(file));
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.settings.purchases, settings.purchases);
  assert.deepEqual(result.data.settings.polish, settings.polish);
  assert.equal(result.data.settings.breakEffect, SURPRISE);
  // Une sauvegarde du palier 1, sans boutique, reste lisible.
  const old = buildBackup({ days: [], weeks: [], settings: { firstLaunch: MONDAY } }, now);
  assert.equal(parseBackup(JSON.stringify(old)).ok, true);
  // Un achat abîmé est refusé.
  const broken = { ...file, settings: { ...file.settings, purchases: [{ item: 'polish:minuit', price: -5, at: 'hier' }] } };
  assert.deepEqual(parseBackup(JSON.stringify(broken)), { ok: false, reason: 'invalid' });
});

test('DEC-133 : les cinq phrases de la boutique choisies par l’enfant', () => {
  assert.equal(TEXTS.shop.welcome, 'Entre, petite apprentie ! Mes étagères débordent de magie.');
  assert.equal(TEXTS.shop.missing(40), 'Encore 40 points et il est à toi. Chaque chapeau te rapproche !');
  assert.equal(TEXTS.shop.bought, 'Abracadabra, il est à toi !');
  assert.equal(TEXTS.shop.paused, 'Mon chaudron se remplit doucement. Encore quelques chapeaux et tu pourras acheter de nouveau !');
  assert.equal(TEXTS.shop.closed, 'Raconte-moi d’abord ta soirée, ensuite on ouvre la boutique !');
  assert.equal(TEXTS.common.points(-35), '−35 points');
  assert.equal(TEXTS.common.points(1), '1 point');
});
