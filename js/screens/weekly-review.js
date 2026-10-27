// Ongles de sorcière - Bilan de la semaine (écran 9, US-018, US-019).
// Ouvert à partir du dimanche 16 h (DEC-017). Le parent complète chaque soir non raconté
// (aucun ongle rongé, vrai oubli ou mensonge par omission, DEC-090), corrige un soir déclaré
// en ajoutant des ongles rongés (RG-022), coche le bonus honnêteté (RG-021), puis ferme la
// semaine, ce qui est définitif (RG-005). Le dimanche reste à l'enfant jusqu'au lundi 4 h (DEC-103).

import { addDays, mondayOf, storyDate } from '../calendar.js';
import * as data from '../data.js';
import { createHands } from '../hands.js';
import { closedWeekRecord, completedRecord, correctedRecord } from '../rules.js';
import { dayLabel, PARENT_TEXTS } from '../texts.js';
import { bigButton, element, icon, linkButton, openSheet, parentHeader, smallButton, witch } from '../ui.js';

// Case « honnêteté » cochée, gardée tant que le bilan de cette semaine est ouvert.
const honestyChecked = new Map();

export function render(container, navigate) {
  const texts = PARENT_TEXTS.review;
  const now = new Date();
  const monday = data.weekUnderReview(now);
  if (!monday) {
    parentHeader(container, navigate, PARENT_TEXTS.menu.review);
    const current = mondayOf(storyDate(now));
    const card = element('div', 'card');
    card.append(element('p', null, texts.nothing), element('p', 'quiet', texts.nextOpening(dayLabel(current), dayLabel(addDays(current, 6)))));
    container.append(card);
    return;
  }

  const sunday = addDays(monday, 6);
  const state = data.review(monday, now);
  const history = data.history(now);
  const summary = history.weeks.find((week) => week.monday === monday);
  const firstLaunch = data.setting('firstLaunch');
  const played = Array.from({ length: 7 }, (_, index) => addDays(monday, index)).filter((date) => date >= firstLaunch);
  parentHeader(container, navigate, texts.title(dayLabel(monday), dayLabel(sunday)));

  const declared = element('div', 'card');
  declared.append(
    element('h2', null, texts.declared),
    element('div', 'big-number', texts.declaredCount(state.declaredCount, played.filter((date) => date <= history.today).length)),
    element('p', 'quiet', texts.childOnly),
  );

  const rows = element('div', 'card');
  for (const date of played) {
    const record = data.dayRecord(date);
    const day = history.days.find((entry) => entry.date === date);
    const row = element('div', 'review-row');
    const symbol = element('div', 'review-icon');
    if (day?.symbol) symbol.append(icon(day.symbol));
    const body = element('div');
    body.append(element('strong', null, dayLabel(date)));
    if (record) {
      const by = record.correctedAt ? texts.by.corrected : record.source === 'child' ? texts.by.child : texts.by[record.choice];
      body.append(element('span', 'quiet', `${texts.nails(record.bitten.length)}, ${by}.`));
      if (record.source === 'child') {
        body.append(rowActions(smallButton(texts.correct, () => chooseNails(container, navigate, date, 'correct', record))));
      }
    } else if (date === sunday && state.sundayPending) {
      body.append(element('span', 'quiet', texts.sundayPending));
    } else if (date > history.today) {
      body.append(element('span', 'quiet', texts.future));
    } else {
      body.append(element('span', 'quiet', texts.toComplete), rowActions(
        smallButton(texts.choiceNone, async () => {
          await data.saveDay(completedRecord(date, 'none', [], new Date()));
          navigate('weekly-review');
        }),
        smallButton(texts.choiceForgotten, () => chooseNails(container, navigate, date, 'forgotten')),
        smallButton(texts.choiceOmission, () => chooseNails(container, navigate, date, 'omission')),
      ));
    }
    row.append(symbol, body);
    rows.append(row);
  }

  const bonus = element('div', 'card');
  const honesty = element('label', 'checkbox');
  const box = element('input');
  box.type = 'checkbox';
  box.disabled = !state.honestyAvailable;
  box.checked = state.honestyAvailable && Boolean(honestyChecked.get(monday));
  box.addEventListener('change', () => honestyChecked.set(monday, box.checked));
  const label = element('span', null, texts.honesty);
  label.append(element('span', 'quiet block', state.honestyAvailable ? texts.honestyHint : texts.honestyBlocked));
  honesty.append(box, label);
  bonus.append(element('h2', null, texts.weekBonus), element('p', 'strong-line', texts.perfect(summary?.perfect)), honesty);

  const close = bigButton(texts.close, () => {
    const closeSheet = openSheet(container, [
      element('p', null, texts.confirmText),
      bigButton(texts.close, async () => {
        closeSheet();
        const withHonesty = state.honestyAvailable && box.checked;
        await data.saveWeek(closedWeekRecord(monday, withHonesty, new Date()));
        honestyChecked.delete(monday);
        showClosed(container, navigate, state.honestyAvailable);
      }),
      linkButton(PARENT_TEXTS.cancel, () => closeSheet()),
    ], { title: texts.confirmTitle });
  });
  close.disabled = !state.canClose;

  container.append(declared, rows, bonus, close);
  if (state.datesToComplete.length) container.append(element('p', 'quiet centered', texts.remaining(state.datesToComplete.length)));
  else if (state.sundayPending) container.append(element('p', 'quiet centered', texts.waitSunday));
}

function rowActions(...buttons) {
  const actions = element('div', 'row-actions');
  actions.append(...buttons);
  return actions;
}

// Choix des ongles rongés d'un soir : complété (vrai oubli, omission) ou corrigé.
function chooseNails(container, navigate, date, mode, record = null) {
  const texts = PARENT_TEXTS.review;
  const now = new Date();
  const before = data.history(now).days.find((day) => day.date === addDays(date, -1));
  const original = record?.bitten ?? [];
  const validate = bigButton(texts.validate, async () => {
    const bitten = hands.melted();
    const saved = mode === 'correct'
      ? correctedRecord(record, bitten.filter((nail) => !original.includes(nail)), new Date())
      : completedRecord(date, mode, bitten, new Date());
    closeSheet();
    await data.saveDay(saved);
    navigate('weekly-review');
  });
  // Valider demande au moins un ongle rongé, et pour une correction, au moins un de plus.
  const refresh = () => {
    validate.disabled = !hands.melted().some((nail) => !original.includes(nail));
  };
  const hands = createHands({
    preserved: before?.nails ?? new Array(10).fill(0),
    melted: original,
    interactive: true,
    swipe: true,
    onToggle: refresh,
  });
  refresh();
  const closeSheet = openSheet(container, [
    element('p', 'quiet centered', mode === 'correct' ? texts.correctHint : texts.nailsHint),
    hands.element,
    validate,
    linkButton(PARENT_TEXTS.cancel, () => closeSheet()),
  ], { title: texts.nailsTitle[mode](dayLabel(date)) });
}

// Semaine fermée : la sorcière félicite, et propose de sauvegarder tout de suite (EX-054).
function showClosed(container, navigate, honest) {
  const texts = PARENT_TEXTS.review;
  openSheet(container, [
    witch(honest ? 5 : 6, honest ? texts.closedBravo : texts.closedFresh).element,
    element('p', 'quiet', texts.closedNote),
    bigButton(texts.saveNow, () => navigate('backup', { action: 'save' })),
    linkButton(texts.later, () => navigate('parent-menu')),
  ], { title: texts.closedTitle });
}
