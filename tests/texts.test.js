// Ongles de sorcière - Tests des textes de l'enfant et du code parent (TA-20, EX-031).
// Lancement, à la racine du dépôt : npm test, ou node --test "tests/*.test.js".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { childTexts, dayLabel, pick, TEXTS } from '../js/texts.js';
import { checkCode, createCodeRecord, isValidCode } from '../js/parent-code.js';

test('TA-20 EX-049 : aucun texte de l’enfant ne parle de mensonge, de menteuse ou de punition', () => {
  const texts = childTexts();
  assert.ok(texts.length > 30);
  for (const text of texts) {
    assert.doesNotMatch(text, /mensonge|menteu|punition|puni/i, text);
  }
});

test('DEC-106 : cinq phrases de bonne nuit, cinq messages « trop tôt », quatre phrases de franchise', () => {
  assert.equal(TEXTS.goodnight.length, 5);
  assert.equal(TEXTS.tooEarly.length, 5);
  assert.equal(TEXTS.honesty.length, 4);
});

test('Phrase au hasard, jamais deux fois de suite la même', () => {
  for (let round = 0; round < 50; round += 1) {
    const previous = TEXTS.honesty[round % 4];
    assert.notEqual(pick(TEXTS.honesty, previous), previous);
  }
});

test('Date en toutes lettres', () => {
  assert.equal(dayLabel('2026-10-27'), 'mardi 27 octobre');
  assert.equal(dayLabel('2026-11-01'), 'dimanche 1er novembre');
});

test('EX-031 : le code parent n’est gardé que sous forme d’empreinte salée', async () => {
  assert.equal(isValidCode('0427'), true);
  assert.equal(isValidCode('427'), false);
  assert.equal(isValidCode('12a4'), false);
  const record = await createCodeRecord('0427');
  assert.equal(JSON.stringify(record).includes('0427'), false);
  assert.equal(await checkCode('0427', record), true);
  assert.equal(await checkCode('0428', record), false);
  assert.equal(await checkCode('0427', undefined), false);
  // Deux fiches du même code ont des sels et des empreintes différents.
  const other = await createCodeRecord('0427');
  assert.notEqual(other.salt, record.salt);
  assert.notEqual(other.hash, record.hash);
  await assert.rejects(createCodeRecord('12'));
});
