// Ongles de sorcière - Tests automatiques du fichier de sauvegarde (TA-15, TA-19).
// Lancement, à la racine du dépôt : npm test, ou node --test "tests/*.test.js".
// Toutes les données sont fictives (DEC-041).

process.env.TZ = 'Europe/Paris';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atLocal } from '../js/calendar.js';
import {
  APP_ID, backupFileName, backupSummary, buildBackup, FORMAT_VERSION, migrate, parseBackup,
} from '../js/backup.js';
import { childRecord, closedWeekRecord, completedRecord, correctedRecord } from '../js/rules.js';

const MONDAY = '2026-11-02';
const now = atLocal('2026-11-09', 20);

// Données fictives du téléphone : une semaine avec un ongle rongé, un jour complété au bilan,
// une correction et une fermeture au bilan.
function sampleData() {
  const days = ['2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08']
    .map((date) => childRecord(date, date === '2026-11-03' ? [0, 9] : [], atLocal(date, 18)));
  days.push(completedRecord('2026-11-04', 'forgotten', [4], atLocal('2026-11-08', 20)));
  days[3] = correctedRecord(days[3], [6], atLocal('2026-11-08', 20));
  return {
    days,
    weeks: [closedWeekRecord(MONDAY, false, atLocal('2026-11-08', 21))],
    settings: {
      firstLaunch: MONDAY,
      soundOn: true,
      lastBackupAt: atLocal('2026-11-08', 21).toISOString(),
      formatVersion: FORMAT_VERSION,
      parentCode: { salt: 'sel-fictif', hash: 'empreinte-fictive' },
      persisted: true,
    },
  };
}

const roundTrip = (data) => parseBackup(JSON.stringify(buildBackup(data, now)));

test('EX-037 : nom du fichier daté', () => {
  assert.equal(backupFileName(now), 'ongles-de-sorciere-2026-11-09.json');
});

test('EX-037, DEC-094 : le fichier contient tout, sauf le code parent', () => {
  const file = buildBackup(sampleData(), now);
  assert.equal(file.app, APP_ID);
  assert.equal(file.formatVersion, FORMAT_VERSION);
  assert.equal(file.exportedAt, now.toISOString());
  assert.equal(file.days.length, 7);
  assert.equal(file.weeks.length, 1);
  assert.equal('parentCode' in file.settings, false);
  assert.equal('persisted' in file.settings, false);
  assert.equal(JSON.stringify(file).includes('empreinte-fictive'), false);
});

test('Ongles numérotés de 1 à 10 dans le fichier, de 0 à 9 dans le téléphone', () => {
  const file = buildBackup(sampleData(), now);
  assert.deepEqual(file.days.find((record) => record.date === '2026-11-03').bitten, [1, 10]);
  const restored = roundTrip(sampleData());
  assert.deepEqual(restored.data.days.find((record) => record.date === '2026-11-03').bitten, [0, 9]);
});

test('EX-037 : une sauvegarde relue redonne exactement les mêmes données, sans le code parent', () => {
  const data = sampleData();
  const result = roundTrip(data);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.days, data.days);
  assert.deepEqual(result.data.weeks, data.weeks);
  const { parentCode, persisted, formatVersion, ...portable } = data.settings;
  assert.deepEqual(result.data.settings, portable);
});

test('Résumé avant restauration : période, soirs racontés, solde', () => {
  const summary = backupSummary(roundTrip(sampleData()).data, now);
  assert.equal(summary.from, MONDAY);
  assert.equal(summary.to, '2026-11-08');
  assert.equal(summary.evenings, 7);
  assert.equal(typeof summary.balance, 'number');
  assert.ok(summary.balance > 0);
});

test('TA-15 RG-019 : une sauvegarde d’un format plus ancien est migrée sans perte', () => {
  // Migration fictive de la version 1 à une version 2 qui ajoute un réglage.
  const migrations = { 1: (file) => ({ ...file, settings: { ...file.settings, theme: 'nuit' } }) };
  const file = buildBackup(sampleData(), now);
  const migrated = migrate(file, { migrations, target: 2 });
  assert.equal(migrated.formatVersion, 2);
  assert.deepEqual(migrated.days, file.days);
  assert.deepEqual(migrated.weeks, file.weeks);
  assert.equal(migrated.settings.theme, 'nuit');
  assert.equal(migrated.settings.firstLaunch, MONDAY);

  const result = parseBackup(JSON.stringify(file), { migrations, target: 2 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.days, sampleData().days);
  assert.equal(result.data.settings.theme, 'nuit');

  // Une version sans migration prévue est refusée sans erreur.
  assert.throws(() => migrate(file, { migrations: {}, target: 2 }));
  assert.deepEqual(parseBackup(JSON.stringify(file), { migrations: {}, target: 2 }), { ok: false, reason: 'invalid' });
});

test('TA-19 : un fichier qui n’est pas une sauvegarde, ou d’un format plus récent, est refusé clairement', () => {
  assert.deepEqual(parseBackup('ceci n’est pas du JSON'), { ok: false, reason: 'not-json' });
  assert.deepEqual(parseBackup('[1, 2, 3]'), { ok: false, reason: 'not-backup' });
  assert.deepEqual(parseBackup('null'), { ok: false, reason: 'not-backup' });
  assert.deepEqual(parseBackup(JSON.stringify({ app: 'autre-application', formatVersion: 1 })), { ok: false, reason: 'not-backup' });

  const recent = { ...buildBackup(sampleData(), now), formatVersion: FORMAT_VERSION + 1 };
  assert.deepEqual(parseBackup(JSON.stringify(recent)), { ok: false, reason: 'too-recent' });

  const damaged = (change) => {
    const file = buildBackup(sampleData(), now);
    change(file);
    return parseBackup(JSON.stringify(file));
  };
  assert.deepEqual(damaged((file) => { file.days[0].bitten = [0]; }), { ok: false, reason: 'invalid' });
  assert.deepEqual(damaged((file) => { file.days[0].bitten = [11]; }), { ok: false, reason: 'invalid' });
  assert.deepEqual(damaged((file) => { file.days[0].date = '2 novembre'; }), { ok: false, reason: 'invalid' });
  assert.deepEqual(damaged((file) => { delete file.weeks; }), { ok: false, reason: 'invalid' });
  assert.deepEqual(damaged((file) => { delete file.settings.firstLaunch; }), { ok: false, reason: 'invalid' });
  assert.deepEqual(damaged((file) => { file.weeks[0].mode = 'magie'; }), { ok: false, reason: 'invalid' });
});

test('DEC-094 : un code parent glissé dans un fichier n’est jamais restauré', () => {
  const file = buildBackup(sampleData(), now);
  file.settings.parentCode = { salt: 'autre', hash: 'autre' };
  const result = parseBackup(JSON.stringify(file));
  assert.equal(result.ok, true);
  assert.equal('parentCode' in result.data.settings, false);
});
