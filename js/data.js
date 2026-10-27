// Ongles de sorcière - Données de l'application, partagées par les écrans.
// Une copie en mémoire de la base (jours, semaines, réglages), relue au démarrage. Chaque
// écriture passe par le stockage, puis met la copie à jour. Points, séries et longueurs sont
// recalculés par le moteur de règles à chaque lecture (TEC-007).

import { FORMAT_VERSION } from './backup.js';
import { storyDate } from './calendar.js';
import { computeHistory, dueAutoClosures, forgottenDates, weekToReview } from './rules.js';
import { loadAndMigrate, putDay, putWeeks, requestPersistence, setSetting } from './store.js';
import { setSoundEnabled } from './sound.js';

let data = { days: [], weeks: [], settings: {} };

export async function load(now = new Date()) {
  data = await loadAndMigrate(now);
  setSoundEnabled(data.settings.soundOn !== false);
  await closeDueWeeks(now);
}

export const isSetUp = () => Boolean(data.settings.firstLaunch && data.settings.parentCode);
export const setting = (name) => data.settings[name];

export async function saveSetting(name, value) {
  await setSetting(name, value);
  data.settings[name] = value;
}

// Fin du premier lancement : le code parent et le jour de départ (DEC-119), en une fois.
export async function finishSetUp(parentCode, now = new Date()) {
  await saveSetting('parentCode', parentCode);
  await saveSetting('formatVersion', FORMAT_VERSION);
  await saveSetting('soundOn', data.settings.soundOn ?? true);
  await saveSetting('firstLaunch', storyDate(now));
  requestPersistence().catch(() => {});
}

export async function saveDay(record) {
  await putDay(record);
  data.days = [...data.days.filter((day) => day.date !== record.date), record];
}

export const dayRecord = (date) => data.days.find((day) => day.date === date) ?? null;
export const weeks = () => data.weeks;

const context = (now) => ({ days: data.days, weeks: data.weeks, firstLaunch: data.settings.firstLaunch, now });

export const history = (now = new Date()) => computeHistory(context(now));
export const forgotten = (now = new Date()) => forgottenDates(context(now));
export const reviewDue = (now = new Date()) => weekToReview(context(now)) !== null;

// Semaines oubliées par le parent : fermées toutes seules le lundi à 0 h qui suit le
// dimanche d'après (RG-005). Appelé au démarrage et au retour au premier plan.
export async function closeDueWeeks(now = new Date()) {
  if (!data.settings.firstLaunch) return;
  const due = dueAutoClosures(context(now));
  if (!due.length) return;
  await putWeeks(due);
  data.weeks = [...data.weeks, ...due];
}
