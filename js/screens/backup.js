// Ongles de sorcière - Sauvegarde, restauration et tout effacer (écran 8, US-012).
// La sauvegarde est un fichier téléchargé dans « Mes fichiers » (EX-037). La restauration
// lit un fichier, le vérifie, montre un résumé, puis remplace les données en gardant le code
// parent (DEC-094). Tout effacer demande deux confirmations, la seconde avec le code (EX-055).
// params.action ouvre directement : 'save', 'restore' ou 'erase'.

import { backupFileName, backupSummary, downloadBackup, parseBackup } from '../backup.js';
import { dateKey } from '../calendar.js';
import * as data from '../data.js';
import { checkCode } from '../parent-code.js';
import { dayLabel, PARENT_TEXTS } from '../texts.js';
import { bigButton, element, keypad, linkButton, openSheet, parentHeader } from '../ui.js';

export function render(container, navigate, { action } = {}) {
  const texts = PARENT_TEXTS.backup;
  parentHeader(container, navigate, texts.title);

  const last = data.setting('lastBackupAt');
  const card = element('div', 'card');
  const lastText = last
    ? texts.lastAt(dayLabel(dateKey(new Date(last))), new Date(last).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    : texts.never;
  card.append(element('h2', null, texts.last), element('p', 'strong-line', lastText),
    element('p', 'quiet', texts.protected(data.setting('persisted') === true)));

  // Choix du fichier à restaurer : le sélecteur de fichiers du téléphone.
  const picker = element('input');
  picker.type = 'file';
  picker.accept = '.json,application/json';
  picker.hidden = true;
  picker.addEventListener('change', async () => {
    const file = picker.files[0];
    picker.value = '';
    if (file) showRestore(container, navigate, file.name, await file.text());
  });

  const actions = element('div', 'stack');
  actions.append(
    bigButton(texts.save, () => save(container, navigate)),
    bigButton(texts.restore, () => picker.click(), { variant: 'second' }),
    bigButton(texts.eraseAll, () => confirmErase(container, navigate), { variant: 'second' }),
  );
  container.append(card, actions, picker, element('p', 'quiet', texts.photos));

  if (action === 'save') save(container, navigate);
  else if (action === 'restore') picker.click();
  else if (action === 'erase') confirmErase(container, navigate);
}

async function save(container, navigate) {
  const texts = PARENT_TEXTS.backup;
  const now = new Date();
  downloadBackup(data.all(), now);
  await data.saveSetting('lastBackupAt', now.toISOString());
  openSheet(container, [
    element('p', null, texts.savedText),
    element('p', 'file-name', backupFileName(now)),
    element('p', null, texts.savedAdvice),
    bigButton(texts.ok, () => navigate('backup')),
  ], { title: texts.savedTitle });
}

function showRestore(container, navigate, name, content) {
  const texts = PARENT_TEXTS.backup;
  const result = parseBackup(content);
  const children = [element('p', null, texts.chosenFile), element('p', 'file-name', name)];
  let close;
  if (!result.ok) {
    // Fichier refusé : un message clair, et rien ne change (REC-29).
    children.push(element('p', 'strong-line', texts.refused[result.reason]), element('p', 'quiet', texts.untouched),
      bigButton(texts.ok, () => close(), { variant: 'second' }));
  } else {
    const summary = backupSummary(result.data, new Date());
    const box = element('div', 'card');
    box.append(element('p', null, texts.summary(dayLabel(summary.from), dayLabel(summary.to), summary.evenings, summary.balance)));
    children.push(box, element('p', 'strong-line', texts.replaceWarning),
      bigButton(texts.restoreConfirm, async () => {
        close();
        await data.restore(result.data);
        navigate('backup');
        openSheet(container, [bigButton(texts.ok, () => navigate('parent-menu'))], { title: texts.restored });
      }),
      linkButton(PARENT_TEXTS.cancel, () => close()));
  }
  close = openSheet(container, children, { title: texts.restoreTitle });
}

function confirmErase(container, navigate) {
  const texts = PARENT_TEXTS.backup;
  const close = openSheet(container, [
    element('p', null, texts.eraseText),
    bigButton(texts.eraseContinue, () => { close(); lastConfirmation(container, navigate); }, { variant: 'danger' }),
    linkButton(PARENT_TEXTS.cancel, () => close()),
  ], { title: texts.eraseTitle });
}

function lastConfirmation(container, navigate) {
  const texts = PARENT_TEXTS.backup;
  const pad = keypad({
    onComplete: async (code) => {
      if (!(await checkCode(code, data.setting('parentCode')))) return pad.setMessage(PARENT_TEXTS.wrongCode);
      close();
      await data.eraseAll();
      navigate('first-launch');
    },
  });
  const close = openSheet(container, [element('p', null, texts.eraseLastText), pad.element, linkButton(PARENT_TEXTS.cancel, () => close())],
    { title: texts.eraseLastTitle });
}
