// Ongles de sorcière - Stockage sur le téléphone, dans IndexedDB (TEC-004).
// Une seule base, trois magasins : les jours racontés, les semaines fermées et les réglages.
// Rien ne quitte le téléphone (EX-043). Points, séries et longueurs ne sont jamais stockés :
// le moteur de règles les recalcule (TEC-007).

import { buildBackup, FORMAT_VERSION, LOCAL_SETTINGS, migrate, parseBackup } from './backup.js';

const DATABASE = 'ongles-de-sorciere';
// Version de la structure de la base (magasins), distincte de la version du format des données.
const SCHEMA_VERSION = 1;

let opening = null;

function request(operation) {
  return new Promise((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error);
  });
}

function done(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function openDatabase() {
  opening ??= new Promise((resolve, reject) => {
    const operation = indexedDB.open(DATABASE, SCHEMA_VERSION);
    operation.onupgradeneeded = () => {
      const database = operation.result;
      if (!database.objectStoreNames.contains('days')) database.createObjectStore('days', { keyPath: 'date' });
      if (!database.objectStoreNames.contains('weeks')) database.createObjectStore('weeks', { keyPath: 'monday' });
      if (!database.objectStoreNames.contains('settings')) database.createObjectStore('settings');
    };
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error);
  });
  return opening;
}

async function transaction(stores, mode = 'readonly') {
  const database = await openDatabase();
  return database.transaction(stores, mode);
}

// --- Lecture ---

// Toutes les données, avec les réglages sous forme d'objet { nom: valeur }.
export async function loadAll() {
  const tx = await transaction(['days', 'weeks', 'settings']);
  const settingsStore = tx.objectStore('settings');
  const [days, weeks, names, values] = await Promise.all([
    request(tx.objectStore('days').getAll()),
    request(tx.objectStore('weeks').getAll()),
    request(settingsStore.getAllKeys()),
    request(settingsStore.getAll()),
  ]);
  const settings = Object.fromEntries(names.map((name, index) => [name, values[index]]));
  return { days, weeks, settings };
}

export async function getSetting(name) {
  const tx = await transaction(['settings']);
  return request(tx.objectStore('settings').get(name));
}

// --- Écriture ---

export async function putDay(record) {
  const tx = await transaction(['days'], 'readwrite');
  tx.objectStore('days').put(record);
  return done(tx);
}

export async function putWeeks(records) {
  const tx = await transaction(['weeks'], 'readwrite');
  for (const record of records) tx.objectStore('weeks').put(record);
  return done(tx);
}

export async function setSetting(name, value) {
  const tx = await transaction(['settings'], 'readwrite');
  tx.objectStore('settings').put(value, name);
  return done(tx);
}

// Remplace toutes les données, en une seule fois : si quelque chose échoue, rien ne change.
// Les réglages propres au téléphone (code parent, stockage protégé) sont gardés (DEC-094).
export async function replaceAll({ days, weeks, settings }) {
  const tx = await transaction(['days', 'weeks', 'settings'], 'readwrite');
  const settingsStore = tx.objectStore('settings');
  const localValues = await Promise.all(LOCAL_SETTINGS.map((name) => request(settingsStore.get(name))));
  tx.objectStore('days').clear();
  tx.objectStore('weeks').clear();
  settingsStore.clear();
  for (const record of days) tx.objectStore('days').put(record);
  for (const record of weeks) tx.objectStore('weeks').put(record);
  for (const [name, value] of Object.entries(settings)) {
    if (!LOCAL_SETTINGS.includes(name)) settingsStore.put(value, name);
  }
  LOCAL_SETTINGS.forEach((name, index) => {
    if (localValues[index] !== undefined) settingsStore.put(localValues[index], name);
  });
  settingsStore.put(FORMAT_VERSION, 'formatVersion');
  return done(tx);
}

// Tout effacer (EX-055) : l'application revient au premier lancement.
export async function clearAll() {
  const tx = await transaction(['days', 'weeks', 'settings'], 'readwrite');
  for (const name of ['days', 'weeks', 'settings']) tx.objectStore(name).clear();
  return done(tx);
}

// --- Démarrage ---

// À l'ouverture : migre les données d'un format plus ancien (RG-019), en passant par le
// même chemin que la restauration d'un fichier, puis rend toutes les données.
export async function loadAndMigrate(now = new Date()) {
  const data = await loadAll();
  const version = data.settings.formatVersion;
  if (version === undefined || version === FORMAT_VERSION) return data;
  const file = { ...buildBackup(data, now), formatVersion: version };
  const result = parseBackup(JSON.stringify(migrate(file)));
  if (!result.ok) throw new Error(`Migration impossible depuis la version ${version}`);
  await replaceAll(result.data);
  return loadAll();
}

// Demande au navigateur de protéger les données contre l'effacement automatique, et garde
// sa réponse pour l'afficher sur l'écran de sauvegarde (revue de l'étape 3).
export async function requestPersistence() {
  const granted = Boolean(await navigator.storage?.persist?.());
  await setSetting('persisted', granted);
  return granted;
}
