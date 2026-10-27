// Ongles de sorcière - Tests automatiques des règles de points (TA-01 à TA-14, TA-16 à TA-18).
// Lancement, à la racine du dépôt : npm test, ou node --test "tests/*.test.js".
// Toutes les dates sont fictives. Le fuseau de Paris est imposé pour essayer le changement d'heure.

process.env.TZ = 'Europe/Paris';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays, atLocal, autoClosingTime, dateKey, dateRange, isDeclarationOpen, mondayOf,
  storyDate, weekDates,
} from '../js/calendar.js';
import {
  childRecord, closedWeekRecord, completedRecord, computeHistory, correctedRecord,
  declarationDate, dueAutoClosures, forgottenDates, isEditableByChild, nailLength,
  reviewState, weekToReview,
} from '../js/rules.js';

// Semaine fictive de référence : du lundi 2 au dimanche 8 novembre 2026.
const MONDAY = '2026-11-02';
const SUNDAY = '2026-11-08';
const NEXT_MONDAY = '2026-11-09';

// Déclaration de l'enfant le soir même, à 18 h.
const declared = (date, bitten = []) => childRecord(date, bitten, atLocal(date, 18));

// Une suite de soirs déclarés sans ongle rongé.
const perfectEvenings = (first, count) =>
  Array.from({ length: count }, (_, index) => declared(addDays(first, index)));

const history = (days, now, { weeks = [], firstLaunch = MONDAY } = {}) =>
  computeHistory({ days, weeks, firstLaunch, now });

const day = (result, date) => result.days.find((entry) => entry.date === date);
const week = (result, monday) => result.weeks.find((entry) => entry.monday === monday);

test('TA-01 RG-001 : fenêtre de déclaration de 16 h à 4 h, et soir raconté entre 0 h et 4 h', () => {
  assert.equal(isDeclarationOpen(atLocal(MONDAY, 15, 59)), false);
  assert.equal(isDeclarationOpen(atLocal(MONDAY, 16, 0)), true);
  assert.equal(isDeclarationOpen(atLocal('2026-11-03', 3, 59)), true);
  assert.equal(storyDate(atLocal('2026-11-03', 3, 59)), MONDAY);
  assert.equal(isDeclarationOpen(atLocal('2026-11-03', 4, 0)), false);
  assert.equal(storyDate(atLocal('2026-11-03', 4, 0)), '2026-11-03');
  assert.equal(declarationDate(atLocal(MONDAY, 15, 59)), null);
  assert.equal(declarationDate(atLocal(MONDAY, 23, 30)), MONDAY);
});

test('TA-02 RG-003 : soir du jour modifiable jusqu’à 4 h ; soir rattrapé jusqu’au 4 h qui suit la saisie', () => {
  const tonight = declared(MONDAY);
  assert.equal(isEditableByChild(tonight, atLocal(MONDAY, 23, 0)), true);
  assert.equal(isEditableByChild(tonight, atLocal('2026-11-03', 3, 59)), true);
  assert.equal(isEditableByChild(tonight, atLocal('2026-11-03', 4, 5)), false);

  // Lundi rattrapé le jeudi à 10 h : modifiable jusqu'au vendredi 4 h.
  const caughtUp = childRecord(MONDAY, [], atLocal('2026-11-05', 10, 0));
  assert.equal(isEditableByChild(caughtUp, atLocal('2026-11-06', 3, 59)), true);
  assert.equal(isEditableByChild(caughtUp, atLocal('2026-11-06', 4, 0)), false);

  // Jamais modifiable une fois la semaine fermée.
  assert.equal(isEditableByChild(tonight, atLocal(MONDAY, 23, 0), true), false);
});

test('TA-03 RG-004, RG-005 : semaine du lundi au dimanche, fermeture automatique, plus de rattrapage', () => {
  assert.deepEqual(weekDates(MONDAY), dateRange(MONDAY, SUNDAY));
  assert.equal(mondayOf(SUNDAY), MONDAY);
  assert.equal(mondayOf(NEXT_MONDAY), NEXT_MONDAY);

  // Fermeture automatique à la fin du dimanche suivant, soit le lundi 16 novembre à 0 h.
  assert.deepEqual(autoClosingTime(MONDAY), atLocal('2026-11-16', 0));
  const days = [declared(MONDAY)];
  const before = { days, weeks: [], firstLaunch: MONDAY, now: atLocal('2026-11-15', 23, 59) };
  const after = { ...before, now: atLocal('2026-11-16', 0, 0) };
  assert.ok(forgottenDates(before).includes('2026-11-03'));
  assert.equal(forgottenDates(after).some((date) => date <= SUNDAY), false);
  assert.deepEqual(dueAutoClosures(before), []);
  assert.deepEqual(dueAutoClosures(after).map((closure) => [closure.monday, closure.mode]), [[MONDAY, 'auto']]);

  // Plus de rattrapage non plus après une fermeture au bilan.
  const closed = { ...before, weeks: [closedWeekRecord(MONDAY, false, atLocal(SUNDAY, 20))] };
  assert.equal(forgottenDates(closed).some((date) => date <= SUNDAY), false);
});

test('TA-04 RG-005 : les trois choix du parent sur un jour vide', () => {
  const now = atLocal(SUNDAY, 20);
  const others = perfectEvenings(MONDAY, 7).filter((record) => record.date !== '2026-11-04');

  const none = history([...others, completedRecord('2026-11-04', 'none', [], now)], now);
  assert.equal(day(none, '2026-11-04').symbol, 'hat');
  assert.equal(day(none, '2026-11-04').total, 10 + 5 + 5);
  assert.equal(day(none, '2026-11-04').streak, 3);

  const forgotten = history([...others, completedRecord('2026-11-04', 'forgotten', [2], now)], now);
  assert.equal(day(forgotten, '2026-11-04').symbol, 'toad');
  assert.equal(day(forgotten, '2026-11-04').total, 9);
  assert.equal(day(forgotten, '2026-11-04').streak, 0);

  const omission = history([...others, completedRecord('2026-11-04', 'omission', [2], now)], now);
  assert.equal(day(omission, '2026-11-04').symbol, 'red-toad');
  assert.equal(day(omission, '2026-11-04').total, 9);

  const days = (record) => ({ days: [...others, record], weeks: [], firstLaunch: MONDAY, now });
  assert.equal(reviewState(MONDAY, days(completedRecord('2026-11-04', 'forgotten', [2], now))).honestyAvailable, true);
  assert.equal(reviewState(MONDAY, days(completedRecord('2026-11-04', 'omission', [2], now))).honestyAvailable, false);
  assert.throws(() => completedRecord('2026-11-04', 'forgotten', [], now), RangeError);
});

test('TA-05 RG-006, RG-007 : points classiques et journée parfaite', () => {
  const now = atLocal(MONDAY, 20);
  const perfect = history([declared(MONDAY)], now);
  assert.deepEqual(day(perfect, MONDAY).points, { classic: 10, perfectDay: 5, streak: 0 });
  const twoBitten = history([declared(MONDAY, [0, 7])], now);
  assert.deepEqual(day(twoBitten, MONDAY).points, { classic: 8, perfectDay: 0, streak: 0 });
});

test('TA-06 RG-008 : semaine parfaite +15 à la fermeture ; pas avec un jour vide', () => {
  const closing = closedWeekRecord(MONDAY, false, atLocal(SUNDAY, 20));
  const after = atLocal(NEXT_MONDAY, 18);

  const perfect = history(perfectEvenings(MONDAY, 7), after, { weeks: [closing] });
  assert.equal(week(perfect, MONDAY).perfectBonus, 15);

  // Avant la fermeture, rien n'est versé.
  const notClosed = history(perfectEvenings(MONDAY, 7), after);
  assert.equal(week(notClosed, MONDAY).perfectBonus, 0);

  // Un jour vide (fermeture automatique) : pas de semaine parfaite.
  const withEmpty = perfectEvenings(MONDAY, 7).filter((record) => record.date !== '2026-11-04');
  const auto = history(withEmpty, atLocal('2026-11-16', 18));
  assert.equal(week(auto, MONDAY).closed, true);
  assert.equal(week(auto, MONDAY).perfectBonus, 0);

  // Semaine parfaite fermée automatiquement : les +15 restent, pas le bonus honnêteté (DEC-102).
  const autoPerfect = history(perfectEvenings(MONDAY, 7), atLocal('2026-11-16', 18));
  assert.equal(week(autoPerfect, MONDAY).mode, 'auto');
  assert.equal(week(autoPerfect, MONDAY).perfectBonus, 15);
  assert.equal(week(autoPerfect, MONDAY).honestyBonus, 0);
});

test('TA-07 RG-009 : bonus de série, série sur deux semaines, remises à zéro', () => {
  // SP-03 : 9 soirs de suite du jeudi 5 au vendredi 13 novembre.
  const result = history(perfectEvenings('2026-11-05', 9), atLocal('2026-11-13', 20));
  const bonuses = dateRange('2026-11-05', '2026-11-13').map((date) => day(result, date).points.streak);
  assert.deepEqual(bonuses, [0, 0, 5, 0, 10, 2, 2, 2, 2]);
  assert.equal(result.streak, 9);

  // Un ongle rongé remet à zéro, et la série suivante redonne les bonus du 3e et du 5e jour.
  const broken = [...perfectEvenings(MONDAY, 3), declared('2026-11-05', [4]), ...perfectEvenings('2026-11-06', 3)];
  const afterBite = history(broken, atLocal('2026-11-08', 20));
  assert.equal(day(afterBite, '2026-11-05').streak, 0);
  assert.equal(day(afterBite, '2026-11-08').points.streak, 5);

  // Un jour vide remet à zéro.
  const gap = [...perfectEvenings(MONDAY, 3), ...perfectEvenings('2026-11-06', 2)];
  assert.equal(history(gap, atLocal('2026-11-07', 20)).streak, 2);

  // Une correction remet à zéro à partir du jour corrigé.
  const now = atLocal(SUNDAY, 20);
  const evenings = perfectEvenings(MONDAY, 7);
  evenings[3] = correctedRecord(evenings[3], [1], now);
  const corrected = history(evenings, now);
  assert.equal(day(corrected, '2026-11-05').streak, 0);
  assert.equal(day(corrected, SUNDAY).streak, 3);

  // Le soir en cours, pas encore raconté, ne casse pas la série.
  const pending = history(perfectEvenings(MONDAY, 3), atLocal('2026-11-05', 17));
  assert.equal(day(pending, '2026-11-05').status, 'pending');
  assert.equal(pending.streak, 3);
});

test('TA-08 RG-010 : un rattrapage au milieu d’une série recalcule les jours suivants', () => {
  const now = atLocal('2026-11-06', 20);
  const withGap = perfectEvenings(MONDAY, 5).filter((record) => record.date !== '2026-11-03');
  const before = history(withGap, now);
  assert.equal(day(before, '2026-11-06').streak, 3);
  const caughtUp = [...withGap, childRecord('2026-11-03', [], now)];
  const after = history(caughtUp, now);
  assert.equal(day(after, '2026-11-06').streak, 5);
  assert.equal(day(after, '2026-11-06').points.streak, 10);
  assert.equal(after.balance - before.balance, 15 + 5 + 10 - 5);
});

test('TA-09 RG-011 : le solde est la somme des points et reste juste après une correction', () => {
  const now = atLocal('2026-11-04', 20);
  const evenings = perfectEvenings(MONDAY, 3);
  assert.equal(history(evenings, now).balance, 15 + 15 + 20);
  evenings[1] = correctedRecord(evenings[1], [0, 1], now);
  // Mardi : 8 points ; mercredi : série de 1, 15 points.
  assert.equal(history(evenings, now).balance, 15 + 8 + 15);
});

test('TA-10 RG-012 : un cran par jour préservé, 7 au plus, zéro si rongé, inchangé un jour vide', () => {
  const evenings = [...perfectEvenings(MONDAY, 3), declared('2026-11-05', [0])];
  const result = history(evenings, atLocal('2026-11-06', 20));
  assert.equal(day(result, '2026-11-04').nails[0], 3);
  assert.equal(day(result, '2026-11-05').nails[0], 0);
  assert.equal(day(result, '2026-11-05').nails[1], 4);
  // Vendredi 6, soir pas encore raconté : la main ne bouge pas.
  assert.deepEqual(day(result, '2026-11-06').nails, day(result, '2026-11-05').nails);

  const gap = [declared(MONDAY), declared('2026-11-04')];
  const withEmpty = history(gap, atLocal('2026-11-04', 20));
  assert.equal(day(withEmpty, '2026-11-03').nails[5], 1);
  assert.equal(day(withEmpty, '2026-11-04').nails[5], 2);

  const long = history(perfectEvenings(MONDAY, 9), atLocal('2026-11-10', 20));
  assert.equal(long.nails[9], 9);
  assert.equal(nailLength(long.nails[9]), 7);
  assert.equal(nailLength(3), 3);
});

test('TA-11 RG-013 : symbole de chaque type de jour', () => {
  const now = atLocal('2026-11-06', 20);
  const evenings = [
    declared(MONDAY),
    declared('2026-11-03', [3]),
    correctedRecord(declared('2026-11-04'), [3], now),
    completedRecord('2026-11-05', 'omission', [3], now),
  ];
  const result = history(evenings, now);
  assert.deepEqual(
    dateRange(MONDAY, '2026-11-06').map((date) => day(result, date).symbol),
    ['hat', 'toad', 'red-toad', 'red-toad', null],
  );
  assert.equal(day(history(evenings, atLocal('2026-11-07', 20)), '2026-11-06').status, 'empty');
});

test('TA-12 RG-021, RG-022 : bonus honnêteté attribuable, jamais sur une semaine corrigée', () => {
  const closingTime = atLocal(SUNDAY, 20);
  const honest = closedWeekRecord(MONDAY, true, closingTime);
  const after = atLocal(NEXT_MONDAY, 18);

  const withBite = [...perfectEvenings(MONDAY, 6), declared(SUNDAY, [2])];
  assert.equal(week(history(withBite, after, { weeks: [honest] }), MONDAY).honestyBonus, 20);
  assert.equal(week(history(withBite, after, { weeks: [closedWeekRecord(MONDAY, false, closingTime)] }), MONDAY).honestyBonus, 0);

  const corrected = perfectEvenings(MONDAY, 7);
  corrected[2] = correctedRecord(corrected[2], [6], closingTime);
  const result = history(corrected, after, { weeks: [honest] });
  assert.equal(week(result, MONDAY).honestyAvailable, false);
  assert.equal(week(result, MONDAY).honestyBonus, 0);
});

test('TA-13 RG-023 : crapaud rouge la semaine du jour corrigé et la suivante, puis crapaud normal', () => {
  const evenings = [correctedRecord(declared('2026-11-04'), [8], atLocal(SUNDAY, 20))];
  const symbolOn = (now) => day(history(evenings, now), '2026-11-04').symbol;
  assert.equal(symbolOn(atLocal(SUNDAY, 20)), 'red-toad');
  assert.equal(symbolOn(atLocal('2026-11-15', 20)), 'red-toad');
  assert.equal(symbolOn(atLocal('2026-11-16', 20)), 'toad');
});

test('TA-14 RG-025 : première semaine parfaite 139 points, la suivante 134', () => {
  const weeks = [
    closedWeekRecord(MONDAY, false, atLocal(SUNDAY, 20)),
    closedWeekRecord(NEXT_MONDAY, false, atLocal('2026-11-15', 20)),
  ];
  const first = history(perfectEvenings(MONDAY, 7), atLocal(NEXT_MONDAY, 12), { weeks });
  assert.equal(first.balance, 139);
  const second = history(perfectEvenings(MONDAY, 14), atLocal('2026-11-16', 12), { weeks });
  assert.equal(second.balance - first.balance, 134);
});

test('TA-16 EX-048 : la semaine du changement d’heure compte 7 jours, sans doublon', () => {
  // Dimanche 25 octobre 2026 : à 3 h, il est 2 h.
  const dstMonday = '2026-10-19';
  assert.deepEqual(weekDates(dstMonday), dateRange(dstMonday, '2026-10-25'));
  assert.equal(addDays('2026-10-25', 1), '2026-10-26');
  assert.equal(dateKey(atLocal('2026-10-25', 12)), '2026-10-25');
  assert.equal(storyDate(atLocal('2026-10-25', 2, 30)), '2026-10-24');
  assert.equal(storyDate(atLocal('2026-10-25', 4, 0)), '2026-10-25');
  const result = computeHistory({
    days: perfectEvenings(dstMonday, 7), weeks: [], firstLaunch: dstMonday, now: atLocal('2026-10-26', 20),
  });
  assert.equal(result.days.length, 8);
  assert.equal(new Set(result.days.map((entry) => entry.date)).size, 8);
  assert.equal(result.streak, 7);
});

test('TA-17 RG-001 : une déclaration commencée avant 4 h et validée après compte pour le soir commencé', () => {
  const startedAt = atLocal('2026-11-03', 3, 58);
  assert.equal(declarationDate(startedAt), MONDAY);
  const record = childRecord(declarationDate(startedAt), [], startedAt);
  const result = history([record], atLocal('2026-11-03', 4, 2));
  assert.equal(day(result, MONDAY).symbol, 'hat');
  // Validée après 4 h, elle n'est plus modifiable.
  assert.equal(isEditableByChild(record, atLocal('2026-11-03', 4, 2)), false);
});

test('TA-18 : une fiche datée après aujourd’hui est gardée mais ignorée jusqu’à sa date', () => {
  // L'heure du téléphone a reculé : une fiche du 5 existe alors qu'on est le 3.
  const evenings = [declared(MONDAY), declared('2026-11-05')];
  const result = history(evenings, atLocal('2026-11-03', 20));
  assert.equal(result.days.length, 2);
  assert.equal(result.balance, 15);
  assert.deepEqual(forgottenDates({ days: evenings, weeks: [], firstLaunch: MONDAY, now: atLocal('2026-11-03', 20) }), []);
  // Le jour venu, elle compte.
  assert.equal(history(evenings, atLocal('2026-11-05', 20)).balance, 15 + 15);
  // Premier lancement dans le futur : aucun calcul, aucune erreur.
  assert.doesNotThrow(() => history(evenings, atLocal('2026-11-01', 20)));
  assert.equal(history(evenings, atLocal('2026-11-01', 20)).days.length, 0);
});

test('DEC-103 et bilan : dimanche pas encore raconté, jours à compléter, semaine la plus ancienne d’abord', () => {
  const state = (days, now) => reviewState(MONDAY, { days, weeks: [], firstLaunch: MONDAY, now });
  const sixEvenings = perfectEvenings(MONDAY, 6);

  assert.equal(state(sixEvenings, atLocal(SUNDAY, 15, 59)).open, false);
  const sundayEvening = state(sixEvenings, atLocal(SUNDAY, 18));
  assert.equal(sundayEvening.open, true);
  assert.equal(sundayEvening.sundayPending, true);
  assert.equal(sundayEvening.canClose, false);

  assert.equal(state([...sixEvenings, declared(SUNDAY)], atLocal(SUNDAY, 21)).canClose, true);

  // Lundi 4 h : le dimanche devient un jour vide à compléter.
  const monday = state(sixEvenings, atLocal(NEXT_MONDAY, 4));
  assert.deepEqual(monday.datesToComplete, [SUNDAY]);
  assert.equal(monday.canClose, false);

  // Deux semaines ouvertes : la plus ancienne passe d'abord.
  const input = { weeks: [], firstLaunch: MONDAY, now: atLocal('2026-11-15', 18) };
  assert.equal(weekToReview(input), MONDAY);
  assert.equal(weekToReview({ ...input, weeks: [closedWeekRecord(MONDAY, true, atLocal(SUNDAY, 20))] }), NEXT_MONDAY);
});

test('Jours d’avant le premier lancement : neutres, ils n’empêchent pas la semaine parfaite', () => {
  // Installation le mercredi 4 novembre.
  const firstLaunch = '2026-11-04';
  const weeks = [closedWeekRecord(MONDAY, true, atLocal(SUNDAY, 20))];
  const result = computeHistory({
    days: perfectEvenings(firstLaunch, 5), weeks, firstLaunch, now: atLocal(NEXT_MONDAY, 12),
  });
  assert.equal(result.days[0].date, firstLaunch);
  assert.equal(week(result, MONDAY).perfectBonus, 15);
  assert.equal(week(result, MONDAY).honestyBonus, 20);
  const state = reviewState(MONDAY, { days: [], weeks: [], firstLaunch, now: atLocal(NEXT_MONDAY, 12) });
  assert.deepEqual(state.datesToComplete, dateRange(firstLaunch, SUNDAY));
});
