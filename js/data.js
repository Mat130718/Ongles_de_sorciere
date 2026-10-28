// Ongles de sorcière - Données de l'application, partagées par les écrans.
// Une copie en mémoire de la base (jours, semaines, réglages), relue au démarrage. Chaque
// écriture passe par le stockage, puis met la copie à jour. Points, séries et longueurs sont
// recalculés par le moteur de règles à chaque lecture (TEC-007).

import { FORMAT_VERSION } from './backup.js';
import { storyDate } from './calendar.js';
import { computeHistory, dueAutoClosures, forgottenDates, reviewState, weekToReview } from './rules.js';
import { breakEffect, buy, isShopOpen, MELT, wornPolish } from './shop.js';
import { clearAll, loadAndMigrate, putDay, putWeeks, replaceAll, requestPersistence, setSetting } from './store.js';
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

export async function saveWeek(record) {
  await putWeeks([record]);
  data.weeks = [...data.weeks.filter((week) => week.monday !== record.monday), record];
}

// Toutes les données, pour la sauvegarde.
export const all = () => data;

// Après une restauration : les données du fichier remplacent tout, le code parent reste (DEC-094).
export async function restore(fileData, now = new Date()) {
  await replaceAll(fileData);
  await load(now);
}

// Tout effacer (EX-055) : l'application revient au premier lancement.
export async function eraseAll() {
  await clearAll();
  data = { days: [], weeks: [], settings: {} };
}

// Semaine fermée pas encore annoncée à l'enfant : la plus récente, avec ses bonus.
export function weekToAnnounce(now = new Date()) {
  const announced = data.settings.announcedWeek ?? '';
  const closed = history(now).weeks.filter((week) => week.closed && week.monday > announced);
  return closed.at(-1) ?? null;
}

export const dayRecord = (date) => data.days.find((day) => day.date === date) ?? null;
export const weeks = () => data.weeks;

const context = (now) => ({
  days: data.days, weeks: data.weeks, firstLaunch: data.settings.firstLaunch, now, purchases: purchases(),
});

export const history = (now = new Date()) => computeHistory(context(now));
export const forgotten = (now = new Date()) => forgottenDates(context(now));
export const reviewDue = (now = new Date()) => weekToReview(context(now)) !== null;
export const weekUnderReview = (now = new Date()) => weekToReview(context(now));
export const review = (monday, now = new Date()) => reviewState(monday, context(now));

// Semaines oubliées par le parent : fermées toutes seules le lundi à 0 h qui suit le
// dimanche d'après (RG-005). Appelé au démarrage et au retour au premier plan.
export async function closeDueWeeks(now = new Date()) {
  if (!data.settings.firstLaunch) return;
  const due = dueAutoClosures(context(now));
  if (!due.length) return;
  await putWeeks(due);
  data.weeks = [...data.weeks, ...due];
}

// --- Boutique (palier 2) ---
// Achats, vernis posés et effet choisi sont des réglages : ils partent dans le fichier de
// sauvegarde avec le reste, sans changer son format (RG-019).

export const purchases = () => data.settings.purchases ?? [];
export const polish = () => wornPolish(data.settings.polish, purchases());
export const effectChoice = () => data.settings.breakEffect ?? MELT;
// Effet à jouer pour un ongle rongé : l'effet choisi, ou un tirage pour « Surprise ».
export const nextBreakEffect = () => breakEffect(effectChoice(), purchases());
export const shopOpen = (now = new Date()) => isShopOpen(context(now));

export async function buyItem(key, now = new Date()) {
  const { balance } = history(now);
  await saveSetting('purchases', buy(key, { balance, purchases: purchases(), now }));
}

export async function savePolish(list) {
  await saveSetting('polish', [...list]);
}

export async function saveEffectChoice(choice) {
  await saveSetting('breakEffect', choice);
}
