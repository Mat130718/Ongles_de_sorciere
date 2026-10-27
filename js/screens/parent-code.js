// Ongles de sorcière - Code parent (écran 7, EX-031).
// Le code est vérifié par son empreinte ; un code faux affiche un message, et l'essai reste
// possible sans limite (REC-28). « Code oublié ? » donne la marche à suivre.
// Avec { change: true }, l'écran change le code : l'ancien, puis le nouveau deux fois (REC-04).

import * as data from '../data.js';
import { checkCode, createCodeRecord } from '../parent-code.js';
import { PARENT_TEXTS, TEXTS } from '../texts.js';
import { bigButton, element, icon, keypad, linkButton, openSheet, parentHeader } from '../ui.js';

export function render(container, navigate, { change = false } = {}) {
  if (change) return renderChange(container, navigate);
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

function renderChange(container, navigate) {
  const texts = PARENT_TEXTS.changeCode;
  parentHeader(container, navigate, PARENT_TEXTS.menu.changeCode);
  const step = element('p', 'hint', texts.old);
  let checked = false;
  let first = null;
  const pad = keypad({
    onComplete: async (code) => {
      if (!checked) {
        if (!(await checkCode(code, data.setting('parentCode')))) return pad.setMessage(PARENT_TEXTS.wrongCode);
        checked = true;
        step.textContent = texts.new;
      } else if (first === null) {
        first = code;
        step.textContent = texts.confirm;
      } else if (code !== first) {
        first = null;
        step.textContent = texts.new;
        pad.setMessage(PARENT_TEXTS.codeMismatch);
      } else {
        await data.saveSetting('parentCode', await createCodeRecord(code));
        container.replaceChildren();
        parentHeader(container, navigate, PARENT_TEXTS.menu.changeCode);
        container.append(element('p', 'centered', texts.done),
          bigButton(PARENT_TEXTS.backup.ok, () => navigate('parent-menu')));
      }
    },
  });
  container.append(step, pad.element);
}
