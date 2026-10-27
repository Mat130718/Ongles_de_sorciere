// Ongles de sorcière - Code parent (écran 7, EX-031).
// Le code est vérifié par son empreinte ; un code faux affiche un message, et l'essai reste
// possible sans limite (REC-28). « Code oublié ? » donne la marche à suivre.

import * as data from '../data.js';
import { checkCode } from '../parent-code.js';
import { PARENT_TEXTS, TEXTS } from '../texts.js';
import { bigButton, element, icon, keypad, linkButton, openSheet } from '../ui.js';

export function render(container, navigate) {
  container.dataset.tone = 'parent';

  const back = element('button', 'round');
  back.type = 'button';
  back.setAttribute('aria-label', TEXTS.common.home);
  back.append(icon('back'));
  back.addEventListener('click', () => navigate('home'));
  const bar = element('div', 'top-bar');
  bar.append(back);

  const pad = keypad({
    onComplete: async (code) => {
      if (await checkCode(code, data.setting('parentCode'))) navigate('parent-menu');
      else pad.setMessage(PARENT_TEXTS.wrongCode);
    },
  });

  const forgotten = linkButton(PARENT_TEXTS.forgotten, () => {
    const steps = element('ol', 'steps');
    steps.append(...PARENT_TEXTS.forgottenSteps.map((text) => element('li', null, text)));
    const close = openSheet(container, [steps, bigButton(PARENT_TEXTS.understood, () => close(), { variant: 'second' })],
      { title: PARENT_TEXTS.forgottenTitle });
  });

  container.append(bar, element('h1', 'screen-title', PARENT_TEXTS.enterCode), pad.element, forgotten);
}
