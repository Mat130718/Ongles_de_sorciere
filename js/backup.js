// Ongles de sorcière - Fichier de sauvegarde.
// Préparation, lecture, contrôle et migration du fichier `ongles-de-sorciere-AAAA-MM-JJ.json`
// (EX-037, RG-019). Seule la fonction downloadBackup touche au navigateur ; les autres sont
// pures et testées par Node.js.
//
// Le fichier contient la version du format, la date d'export, les fiches des jours et des
// semaines, et les réglages, sauf le code parent (DEC-094). Les ongles y sont numérotés de 1 à 10 :
// 1 à 5 pour la main gauche, du pouce à l'auriculaire, puis 6 à 10 pour la main droite.

import { dateKey } from './calendar.js';
import { computeHistory, NAIL_COUNT, PARENT_CHOICES } from './rules.js';

export const APP_ID = 'ongles-de-sorciere';
export const FORMAT_VERSION = 1;

// Réglages jamais mis dans le fichier : ceux propres au téléphone (code parent, stockage
// protégé), et la version du format, déjà portée par le fichier lui-même.
export const LOCAL_SETTINGS = ['parentCode', 'persisted', 'formatVersion'];

// Migrations du format : MIGRATIONS[n] transforme un fichier de version n en version n + 1.
// Aucune pour l'instant : la version 1 est la première.
export const MIGRATIONS = {};

// --- Numérotation des ongles : le seul endroit où l'on passe de 0-9 à 1-10 ---

export const toFileNail = (nail) => nail + 1;
export const fromFileNail = (nail) => nail - 1;

// --- Écriture ---

export function backupFileName(now) {
  return `${APP_ID}-${dateKey(now)}.json`;
}

// Contenu du fichier, à partir des données du téléphone.
export function buildBackup({ days, weeks, settings }, now) {
  const kept = Object.fromEntries(
    Object.entries(settings).filter(([name]) => !LOCAL_SETTINGS.includes(name)));
  return {
    app: APP_ID,
    formatVersion: FORMAT_VERSION,
    exportedAt: now.toISOString(),
    days: days.map((record) => ({ ...record, bitten: record.bitten.map(toFileNail) })),
    weeks: weeks.map((record) => ({ ...record })),
    settings: kept,
  };
}

// --- Lecture ---

// Fait passer un fichier d'une version ancienne à la version actuelle, étape par étape.
export function migrate(file, { migrations = MIGRATIONS, target = FORMAT_VERSION } = {}) {
  let current = file;
  while (current.formatVersion < target) {
    const step = migrations[current.formatVersion];
    if (!step) throw new Error(`Aucune migration depuis la version ${current.formatVersion}`);
    current = { ...step(current), formatVersion: current.formatVersion + 1 };
  }
  return current;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const isInstant = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

function isValidDay(record) {
  return record
    && DATE_PATTERN.test(record.date)
    && Array.isArray(record.bitten)
    && record.bitten.every((nail) => Number.isInteger(nail) && nail >= 1 && nail <= NAIL_COUNT)
    && isInstant(record.startedAt)
    && ['child', 'review'].includes(record.source)
    && (record.choice === undefined || PARENT_CHOICES.includes(record.choice))
    && (record.correctedAt === undefined || isInstant(record.correctedAt));
}

// Achats de la boutique (palier 2) : facultatifs, pour relire une sauvegarde du palier 1.
function isValidPurchases(list) {
  return list === undefined || (Array.isArray(list) && list.every((purchase) => purchase
    && typeof purchase.item === 'string'
    && Number.isInteger(purchase.price) && purchase.price >= 0
    && isInstant(purchase.at)));
}

function isValidPolish(list) {
  return list === undefined || (Array.isArray(list) && list.length === NAIL_COUNT
    && list.every((id) => id === null || typeof id === 'string'));
}

function isValidWeek(record) {
  return record
    && DATE_PATTERN.test(record.monday)
    && isInstant(record.closedAt)
    && ['review', 'auto'].includes(record.mode)
    && typeof record.honesty === 'boolean';
}

// Lit le texte d'un fichier choisi par le parent. Rend soit { ok: true, data }, avec les
// données au format du téléphone, soit { ok: false, reason } sans rien toucher (TA-19) :
//   'not-json'   : le fichier n'est pas lisible ;
//   'not-backup' : ce n'est pas une sauvegarde de l'application ;
//   'too-recent' : sauvegarde faite par une version plus récente de l'application ;
//   'invalid'    : sauvegarde abîmée.
export function parseBackup(text, options = {}) {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'not-json' };
  }
  if (!file || file.app !== APP_ID || !Number.isInteger(file.formatVersion)) {
    return { ok: false, reason: 'not-backup' };
  }
  const target = options.target ?? FORMAT_VERSION;
  if (file.formatVersion > target) return { ok: false, reason: 'too-recent' };
  try {
    file = migrate(file, options);
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  const settings = file.settings ?? {};
  if (!Array.isArray(file.days) || !file.days.every(isValidDay)
      || !Array.isArray(file.weeks) || !file.weeks.every(isValidWeek)
      || typeof settings !== 'object' || !DATE_PATTERN.test(settings.firstLaunch)
      || !isValidPurchases(settings.purchases) || !isValidPolish(settings.polish)
      || (settings.breakEffect !== undefined && typeof settings.breakEffect !== 'string')) {
    return { ok: false, reason: 'invalid' };
  }
  const kept = Object.fromEntries(
    Object.entries(settings).filter(([name]) => !LOCAL_SETTINGS.includes(name)));
  return {
    ok: true,
    data: {
      days: file.days.map((record) => ({ ...record, bitten: record.bitten.map(fromFileNail) })),
      weeks: file.weeks.map((record) => ({ ...record })),
      settings: kept,
    },
  };
}

// Résumé montré au parent avant de confirmer une restauration : période, soirs racontés, solde.
export function backupSummary({ days, weeks, settings }, now) {
  const dates = days.map((record) => record.date).sort();
  const { balance } = computeHistory({
    days, weeks, firstLaunch: settings.firstLaunch, now, purchases: settings.purchases ?? [],
  });
  return {
    from: settings.firstLaunch,
    to: dates.at(-1) ?? settings.firstLaunch,
    evenings: days.length,
    balance,
  };
}

// --- Navigateur ---

// Enregistre le fichier dans les téléchargements du téléphone (DEC-071).
export function downloadBackup(data, now) {
  const content = JSON.stringify(buildBackup(data, now), null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFileName(now);
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
