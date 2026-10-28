// Ongles de sorcière - Moteur de règles.
// Fonctions pures : elles ne lisent ni l'écran, ni le stockage, ni l'heure. Elles reçoivent
// les fiches enregistrées et l'instant présent, et recalculent tout à chaque appel : points,
// séries, longueur des ongles, symboles et bonus ne sont jamais stockés (TEC-007, RG-010).
//
// Fiche d'un jour raconté :
//   { date: 'AAAA-MM-JJ',
//     bitten: [numéros des ongles rongés, 0 à 9],
//     startedAt: instant où la saisie a commencé (texte ISO) ; il fixe l'heure de verrouillage,
//     source: 'child' (déclaré par l'enfant) ou 'review' (complété par le parent au bilan),
//     choice: pour une fiche du bilan, 'none' (aucun ongle rongé), 'forgotten' (vrai oubli)
//             ou 'omission' (mensonge par omission),
//     correctedAt: instant de la correction par le parent, s'il y en a eu une }
//
// Fiche d'une semaine fermée :
//   { monday: 'AAAA-MM-JJ', closedAt: texte ISO, mode: 'review' ou 'auto', honesty: true ou false }
//
// Les ongles sont numérotés de 0 à 9 dans le code : 0 à 4 pour la main gauche, du pouce
// à l'auriculaire, puis 5 à 9 pour la main droite. La conversion en 1 à 10 se fait à la sauvegarde.

import {
  addDays, atLocal, autoClosingTime, CLOSING_HOUR, dateRange, isDeclarationOpen,
  mondayOf, nextLockTime, reviewOpeningTime, storyDate, weekDates,
} from './calendar.js';

export const NAIL_COUNT = 10;
export const MAX_NAIL_LENGTH = 7;          // RG-012 : très long au 7e jour
export const PERFECT_DAY_BONUS = 5;        // RG-007
export const PERFECT_WEEK_BONUS = 15;      // RG-008
export const HONESTY_BONUS = 20;           // RG-021
export const PARENT_CHOICES = ['none', 'forgotten', 'omission'];

// --- Un jour ---

// Points classiques : 1 par ongle préservé (RG-006) ; bonus de 5 sans aucun ongle rongé (RG-007).
export function dayPoints(bitten) {
  const classic = NAIL_COUNT - bitten.length;
  return { classic, perfectDay: bitten.length === 0 ? PERFECT_DAY_BONUS : 0 };
}

// Bonus de série du jour, selon la longueur de la série ce jour-là (RG-009).
export function streakBonus(length) {
  if (length === 3) return 5;
  if (length === 5) return 10;
  if (length >= 6) return 2;
  return 0;
}

// Longueur affichée d'un ongle préservé depuis un nombre de jours (RG-012).
// Au-delà de 7 jours, l'ongle reste très long et brille un peu plus.
export function nailLength(preservedDays) {
  return Math.min(preservedDays, MAX_NAIL_LENGTH);
}

// Crapaud rouge : jour corrigé, ou mensonge par omission (RG-013, RG-022).
export function isRedToad(record) {
  return Boolean(record.correctedAt) || record.choice === 'omission';
}

// Date du soir raconté par une déclaration commencée à cet instant, ou null hors de la
// fenêtre de 16 h à 4 h. Une déclaration commencée avant 4 h et validée après compte pour
// le soir commencé : c'est l'instant du début qui compte (RG-001).
export function declarationDate(startedAt) {
  return isDeclarationOpen(startedAt) ? storyDate(startedAt) : null;
}

// Une fiche reste modifiable par l'enfant jusqu'au 4 h qui suit le début de sa saisie,
// tant que sa semaine n'est pas fermée (RG-003).
export function isEditableByChild(record, now, weekClosed = false) {
  return !weekClosed && now < nextLockTime(new Date(record.startedAt));
}

// --- Fiches préparées pour le stockage ---

function checkNails(nails) {
  for (const nail of nails) {
    if (!Number.isInteger(nail) || nail < 0 || nail >= NAIL_COUNT) {
      throw new RangeError(`Numéro d'ongle invalide : ${nail}`);
    }
  }
  return [...new Set(nails)].sort((a, b) => a - b);
}

// Déclaration de l'enfant, pour le soir du jour ou un soir rattrapé.
export function childRecord(date, bitten, startedAt) {
  return { date, bitten: checkNails(bitten), startedAt: startedAt.toISOString(), source: 'child' };
}

// Jour vide complété par le parent au bilan (RG-005, DEC-090).
export function completedRecord(date, choice, bitten, now) {
  if (!PARENT_CHOICES.includes(choice)) throw new RangeError(`Choix inconnu : ${choice}`);
  const nails = choice === 'none' ? [] : checkNails(bitten);
  if (choice !== 'none' && nails.length === 0) {
    throw new RangeError('Un ongle rongé au moins doit être indiqué.');
  }
  return { date, bitten: nails, startedAt: now.toISOString(), source: 'review', choice };
}

// Correction par le parent : des ongles passent à « rongé » (RG-022).
export function correctedRecord(record, addedBitten, now) {
  const bitten = checkNails([...record.bitten, ...addedBitten]);
  if (bitten.length === record.bitten.length) {
    throw new RangeError('La correction doit ajouter au moins un ongle rongé.');
  }
  return { ...record, bitten, correctedAt: now.toISOString() };
}

// Fermeture d'une semaine au bilan, avec ou sans bonus honnêteté (RG-005, RG-021).
export function closedWeekRecord(monday, honesty, now) {
  return { monday, closedAt: now.toISOString(), mode: 'review', honesty: Boolean(honesty) };
}

// --- Semaines ---

const byKey = (list, key) => new Map(list.map((item) => [item[key], item]));

// Fermeture d'une semaine : par le bilan, ou automatiquement à la fin du dimanche suivant.
function weekClosure(monday, weeksByMonday, now) {
  const record = weeksByMonday.get(monday);
  if (record) return record;
  if (now >= autoClosingTime(monday)) {
    return { monday, closedAt: autoClosingTime(monday).toISOString(), mode: 'auto', honesty: false };
  }
  return null;
}

export function isWeekClosed(monday, weeks, now) {
  return weekClosure(monday, byKey(weeks, 'monday'), now) !== null;
}

// Semaines arrivées à leur fermeture automatique et pas encore enregistrées comme fermées.
// L'application les enregistre à l'ouverture (Q04, traitement 4).
export function dueAutoClosures({ weeks, firstLaunch, now }) {
  const weeksByMonday = byKey(weeks, 'monday');
  const due = [];
  for (let monday = mondayOf(firstLaunch); now >= autoClosingTime(monday); monday = addDays(monday, 7)) {
    if (!weeksByMonday.has(monday)) due.push(weekClosure(monday, weeksByMonday, now));
  }
  return due;
}

// Jours d'une semaine qui comptent dans le jeu : ceux à partir du premier lancement.
// Les jours d'avant le premier lancement sont neutres, comme une pause.
function playedDates(monday, firstLaunch) {
  return weekDates(monday).filter((date) => date >= firstLaunch);
}

// --- Calcul complet ---

// Points dépensés dans la boutique : la somme des prix payés (RG-011, js/shop.js).
export function spentPoints(purchases = []) {
  return purchases.reduce((sum, purchase) => sum + purchase.price, 0);
}

// Recalcule tout, du premier lancement jusqu'au jour raconté à cet instant.
// Le solde est ce qui a été gagné moins ce qui a été dépensé ; il peut devenir négatif après
// une correction, et les gains suivants le ramènent à zéro (RG-011).
// Les fiches datées après ce jour (heure du téléphone qui recule) sont gardées par le
// stockage, mais ignorées ici jusqu'à leur date.
export function computeHistory({ days, weeks, firstLaunch, now, purchases = [] }) {
  const today = storyDate(now);
  const recordsByDate = byKey(days, 'date');
  const weeksByMonday = byKey(weeks, 'monday');

  const history = [];
  let streak = 0;
  const nails = new Array(NAIL_COUNT).fill(0);

  for (const date of firstLaunch <= today ? dateRange(firstLaunch, today) : []) {
    const record = recordsByDate.get(date);
    if (!record) {
      // Jour vide : 0 point, la série repart à zéro, la main ne bouge pas (RG-009, RG-012).
      // Le soir en cours, pas encore raconté, ne compte pas encore.
      const status = date === today ? 'pending' : 'empty';
      if (status === 'empty') streak = 0;
      history.push({
        date, status, bitten: [], points: { classic: 0, perfectDay: 0, streak: 0 }, total: 0,
        streak, nails: [...nails], symbol: null,
      });
      continue;
    }

    const { classic, perfectDay } = dayPoints(record.bitten);
    streak = record.bitten.length === 0 ? streak + 1 : 0;
    const streakPoints = record.bitten.length === 0 ? streakBonus(streak) : 0;
    for (let nail = 0; nail < NAIL_COUNT; nail += 1) {
      nails[nail] = record.bitten.includes(nail) ? 0 : nails[nail] + 1;
    }
    history.push({
      date,
      status: record.source === 'review' ? 'completed' : 'declared',
      bitten: [...record.bitten],
      points: { classic, perfectDay, streak: streakPoints },
      total: classic + perfectDay + streakPoints,
      streak,
      nails: [...nails],
      symbol: daySymbol(record, today),
    });
  }

  const weekSummaries = [];
  if (firstLaunch <= today) {
    for (let monday = mondayOf(firstLaunch); monday <= today; monday = addDays(monday, 7)) {
      weekSummaries.push(weekSummary(monday, recordsByDate, weeksByMonday, firstLaunch, now));
    }
  }

  const earned = history.reduce((sum, day) => sum + day.total, 0)
    + weekSummaries.reduce((sum, week) => sum + week.perfectBonus + week.honestyBonus, 0);
  const spent = spentPoints(purchases);

  return { today, days: history, weeks: weekSummaries, earned, spent, balance: earned - spent, streak, nails: [...nails] };
}

// Symbole du calendrier (RG-013). Le crapaud rouge reste visible pendant la semaine du
// jour concerné et la suivante, puis devient un crapaud normal (RG-023).
function daySymbol(record, today) {
  if (record.bitten.length === 0) return 'hat';
  if (isRedToad(record) && today < addDays(mondayOf(record.date), 14)) return 'red-toad';
  return 'toad';
}

function weekSummary(monday, recordsByDate, weeksByMonday, firstLaunch, now) {
  const closure = weekClosure(monday, weeksByMonday, now);
  const records = playedDates(monday, firstLaunch).map((date) => recordsByDate.get(date));
  // Parfaite : chaque jour joué raconté sans ongle rongé ; un jour vide l'empêche (RG-008).
  const perfect = records.every((record) => record && record.bitten.length === 0);
  const honestyAvailable = !records.some((record) => record && isRedToad(record));
  return {
    monday,
    closed: closure !== null,
    mode: closure?.mode ?? null,
    perfect,
    honestyAvailable,
    // Une semaine parfaite fermée automatiquement reçoit quand même ses 15 points (DEC-102),
    // mais jamais le bonus honnêteté (RG-005).
    perfectBonus: closure && perfect ? PERFECT_WEEK_BONUS : 0,
    honestyBonus: closure?.mode === 'review' && closure.honesty && honestyAvailable ? HONESTY_BONUS : 0,
  };
}

// --- Rattrapage et bilan ---

// Soirs oubliés encore rattrapables : avant le soir en cours, sans fiche, dans une
// semaine non fermée (EX-006, RG-005). Du plus ancien au plus récent.
export function forgottenDates({ days, weeks, firstLaunch, now }) {
  const today = storyDate(now);
  if (firstLaunch >= today) return [];
  const recordsByDate = byKey(days, 'date');
  const weeksByMonday = byKey(weeks, 'monday');
  return dateRange(firstLaunch, addDays(today, -1)).filter((date) =>
    !recordsByDate.has(date) && !weekClosure(mondayOf(date), weeksByMonday, now));
}

// Semaine à passer au bilan : la plus ancienne semaine non fermée dont le bilan est ouvert,
// à partir de son dimanche 16 h (DEC-017).
export function weekToReview({ weeks, firstLaunch, now }) {
  const weeksByMonday = byKey(weeks, 'monday');
  for (let monday = mondayOf(firstLaunch); now >= reviewOpeningTime(monday); monday = addDays(monday, 7)) {
    if (!weekClosure(monday, weeksByMonday, now)) return monday;
  }
  return null;
}

// État du bilan d'une semaine : jours à compléter, dimanche pas encore raconté, bonus
// honnêteté possible, et possibilité de fermer (RG-005, RG-021, DEC-103).
export function reviewState(monday, { days, weeks, firstLaunch, now }) {
  const recordsByDate = byKey(days, 'date');
  const today = storyDate(now);
  const sunday = addDays(monday, 6);
  const closed = weekClosure(monday, byKey(weeks, 'monday'), now) !== null;
  const open = !closed && now >= reviewOpeningTime(monday);
  // Le dimanche reste à l'enfant jusqu'au lundi 4 h.
  const sundayPending = !recordsByDate.has(sunday) && now < atLocal(addDays(sunday, 1), CLOSING_HOUR);
  const played = playedDates(monday, firstLaunch).filter((date) => date <= today);
  const datesToComplete = played.filter((date) =>
    !recordsByDate.has(date) && !(date === sunday && sundayPending));
  const records = played.map((date) => recordsByDate.get(date)).filter(Boolean);
  return {
    monday,
    open,
    closed,
    sundayPending,
    datesToComplete,
    declaredCount: records.filter((record) => record.source === 'child').length,
    honestyAvailable: !records.some(isRedToad),
    canClose: open && !sundayPending && datesToComplete.length === 0,
  };
}
