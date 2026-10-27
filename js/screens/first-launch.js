// Ongles de sorcière - Premier lancement (écran 1, US-011).
// La sorcière se présente en deux bulles, le parent crée le code et le confirme, puis
// la sorcière annonce que son grimoire est prêt (EX-039, EX-031).

import * as data from '../data.js';
import { createCodeRecord } from '../parent-code.js';
import { PARENT_TEXTS, TEXTS } from '../texts.js';
import { bigButton, element, keypad, witch } from '../ui.js';

export function render(container, navigate) {
  const show = (...children) => {
    delete container.dataset.tone;
    container.replaceChildren(...children);
  };

  const intro = (expression, text, next) => show(
    element('div', 'spacer'),
    witch(expression, text, { large: true }).element,
    bigButton(TEXTS.firstLaunch.next, next),
  );

  const ready = () => show(
    element('div', 'spacer'),
    witch(5, TEXTS.firstLaunch.ready, { large: true }).element,
    bigButton(TEXTS.firstLaunch.start, () => navigate('home'), { variant: 'gold' }),
  );

  // Création du code : une première saisie, puis une confirmation.
  const code = () => {
    let first = null;
    const title = element('h1', 'screen-title', PARENT_TEXTS.createCode);
    const hint = element('p', 'hint', PARENT_TEXTS.createHint);
    const pad = keypad({
      onComplete: async (typed) => {
        if (first === null) {
          first = typed;
          title.textContent = PARENT_TEXTS.confirmCode;
          return;
        }
        if (typed !== first) {
          first = null;
          title.textContent = PARENT_TEXTS.createCode;
          pad.setMessage(PARENT_TEXTS.codeMismatch);
          return;
        }
        await data.finishSetUp(await createCodeRecord(typed));
        ready();
      },
    });
    show(title, hint, pad.element);
    container.dataset.tone = 'parent';
  };

  const step = (expression, text, next) => () => intro(expression, text, next);
  step(1, TEXTS.firstLaunch.hello, step(2, TEXTS.firstLaunch.rule, code))();
}
