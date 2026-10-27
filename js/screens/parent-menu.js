// Ongles de sorcière - Menu parent (écran 7).
// Bilan de la semaine, sauvegarde et restauration, changement de code, tout effacer.

import { PARENT_TEXTS } from '../texts.js';
import { bigButton, element, linkButton } from '../ui.js';

export function render(container, navigate) {
  container.dataset.tone = 'parent';
  const texts = PARENT_TEXTS.menu;
  const actions = element('div', 'stack');
  actions.append(
    bigButton(texts.review, () => navigate('weekly-review')),
    bigButton(texts.backup, () => navigate('backup'), { variant: 'second' }),
    bigButton(texts.restore, () => navigate('backup', { action: 'restore' }), { variant: 'second' }),
    bigButton(texts.changeCode, () => navigate('parent-code', { change: true }), { variant: 'second' }),
    bigButton(texts.eraseAll, () => navigate('backup', { action: 'erase' }), { variant: 'second' }),
    linkButton(texts.backToGame, () => navigate('home')),
  );
  container.append(element('div', 'spacer'), element('h1', 'screen-title', texts.title), actions);
}
