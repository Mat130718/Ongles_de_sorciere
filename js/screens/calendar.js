// Ongles de sorcière - Calendrier (écran 5, US-009).
// La semaine dernière et cette semaine, un symbole par soir raconté (RG-013), une guirlande
// d'or entre les soirs d'une même série, et un ruban sur les semaines fermées.
// Toucher un jour montre sa main et ses points, ou propose de le rattraper.

import { addDays, mondayOf } from '../calendar.js';
import * as data from '../data.js';
import { createHands } from '../hands.js';
import { dayLabel, TEXTS } from '../texts.js';
import { bigButton, dayRecap, element, icon, openSheet, topBar, witch } from '../ui.js';

const LETTERS = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];

export function render(container, navigate) {
  const now = new Date();
  const history = data.history(now);
  const byDate = new Map(history.days.map((day) => [day.date, day]));
  const forgotten = data.forgotten(now);
  const texts = TEXTS.calendar;
  const inStreak = (date) => (byDate.get(date)?.streak ?? 0) > 0 && byDate.get(date).status !== 'pending';

  const openDay = (date) => {
    const day = byDate.get(date);
    const children = [];
    const close = () => closeSheet();
    if (date > history.today) {
      children.push(element('p', 'centered', TEXTS.empty.future));
    } else if (!day) {
      children.push(element('p', 'centered', texts.beforeStartText));
    } else if (day.status === 'pending') {
      children.push(element('p', 'centered', TEXTS.empty.tonight),
        bigButton(texts.tellTonight, () => { close(); navigate('declaration'); }, { iconName: 'moon' }));
    } else if (day.status === 'empty') {
      children.push(element('p', 'centered', texts.notToldEvening));
      if (forgotten.includes(date)) {
        children.push(bigButton(texts.catchUpDay, () => { close(); navigate('declaration', { date }); }, { variant: 'gold' }));
      }
    } else {
      children.push(createHands({ preserved: day.nails, melted: day.bitten, polish: data.polish(), mini: true }).element, dayRecap(day, texts.none));
      if (day.symbol === 'red-toad') children.push(element('p', 'centered', texts.redToad));
    }
    children.push(bigButton(texts.close, close, { variant: 'second' }));
    const closeSheet = openSheet(container, children, { title: dayLabel(date) });
  };

  const week = (monday, title) => {
    const closed = history.weeks.find((summary) => summary.monday === monday)?.closed;
    const head = element('div', 'week-head');
    head.append(element('h2', null, title));
    if (closed) head.append(element('span', 'ribbon', texts.sealed));
    const cells = element('div', 'days');
    for (let index = 0; index < 7; index += 1) {
      const date = addDays(monday, index);
      const day = byDate.get(date);
      const cell = element('button', 'day');
      cell.type = 'button';
      if (date === history.today) cell.classList.add('today');
      if (date > history.today) cell.classList.add('future');
      if (!day || !day.symbol) cell.classList.add('blank');
      if (!day && date < history.today) cell.classList.add('before-start');
      if (inStreak(date) && inStreak(addDays(date, -1))) cell.classList.add('link-left');
      if (inStreak(date) && inStreak(addDays(date, 1))) cell.classList.add('link-right');
      let state = texts.notTold;
      if (date > history.today) state = texts.future;
      else if (!day) state = texts.beforeStart;
      else if (day.symbol) state = texts.symbols[day.symbol];
      cell.setAttribute('aria-label', `${dayLabel(date)} : ${state}`);
      const box = element('span', 'box');
      if (day?.symbol) box.append(icon(day.symbol));
      cell.append(element('span', 'letter', LETTERS[index]), box, element('span', 'number', String(Number(date.slice(8)))));
      cell.addEventListener('click', () => openDay(date));
      cells.append(cell);
    }
    const section = element('section', 'week');
    section.append(head, cells);
    return section;
  };

  const told = history.days.some((day) => day.status === 'declared' || day.status === 'completed');
  const legend = element('div', 'card legend');
  for (const [name, text] of [['hat', texts.legend.hat], ['toad', texts.legend.toad], ['red-toad', texts.legend.redToad], ['garland', texts.legend.streak]]) {
    const item = element('span');
    item.append(icon(name), text);
    legend.append(item);
  }

  const thisMonday = mondayOf(history.today);
  container.append(
    topBar(navigate, { back: true, now }),
    element('h1', 'screen-title', texts.title),
    witch(4, told ? texts.look : TEXTS.empty.newCalendar).element,
    week(addDays(thisMonday, -7), texts.lastWeek),
    week(thisMonday, texts.thisWeek),
    legend,
    element('p', 'hint', texts.hint),
  );
}
