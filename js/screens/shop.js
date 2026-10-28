// Ongles de sorcière - Boutique de la sorcière (écran 5, palier 2 : US-015, US-016, US-024).
// Reprise de la maquette validée par l'enfant (DEC-133). Trois onglets : les vernis, les effets
// de casse, et « Mes trésors », où l'enfant pose ses vernis et choisit son effet (EX-022).
// Toucher un objet ouvre son aperçu sur la main ; l'achat se confirme, sans code parent (DEC-132).
// Les ongles de l'aperçu sont longs pour bien voir le vernis ; ailleurs, ils gardent leur vraie
// longueur. Solde négatif : catalogue visible, achats en pause, trésors gardés (DEC-129).

import * as data from '../data.js';
import { createHands } from '../hands.js';
import { effectPictogram, polishSwatch } from '../magic.js';
import {
  canBuy, EFFECTS, item, itemKey, level, LEVELS, MELT, ownedKeys,
  polishAll, polishOne, POLISHES, priceOf, SURPRISE,
} from '../shop.js';
import { EFFECT_SOUNDS, play } from '../sound.js';
import { TEXTS } from '../texts.js';
import { bigButton, element, icon, openSheet, topBar, witch } from '../ui.js';

// Longueur des ongles de l'aperçu, en jours préservés.
const PREVIEW_LENGTH = 5;
// Ongle où se jouent les essais d'effets : l'index de la main gauche, agrandie.
const TRY_NAIL = 1;
// Délai avant de jouer l'effet à l'ouverture de son aperçu.
const AUTOPLAY_DELAY = 350;

const texts = TEXTS.shop;
// Onglet et mode de pose gardés pendant que l'application reste ouverte.
let tab = 'polish';
let nailByNail = false;
let brush = null;

const preview = () => new Array(10).fill(PREVIEW_LENGTH);

export function render(container, navigate, params = {}) {
  if (params.tab) tab = params.tab;
  const now = new Date();
  // La boutique attend la soirée racontée (RG-016, DEC-128).
  if (!data.shopOpen(now)) return navigate('home', { shopClosed: true });

  const { balance } = data.history(now);
  const sorceress = witch(balance < 0 ? 6 : 2, params.bubble ?? (balance < 0 ? texts.paused : texts.welcome));
  const refresh = (bubble) => {
    const scroll = window.scrollY;
    container.replaceChildren();
    render(container, navigate, { bubble });
    window.scrollTo(0, scroll);
  };

  const tabs = element('div', 'shop-tabs');
  tabs.setAttribute('role', 'tablist');
  for (const [id, label, iconName] of [['polish', texts.tabs.polish, 'bottle'], ['effects', texts.tabs.effects, 'bolt'], ['treasures', texts.tabs.treasures, 'chest']]) {
    const button = element('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(tab === id));
    button.append(icon(iconName), label);
    button.addEventListener('click', () => { tab = id; play('tap'); refresh(); });
    tabs.append(button);
  }

  container.append(topBar(navigate, { back: true, balance: true, now }), element('h1', 'screen-title', texts.title), sorceress.element, tabs);
  if (tab === 'treasures') container.append(...treasures(container, refresh));
  else container.append(...catalogue(container, tab === 'polish' ? 'polish' : 'effect', balance, refresh));
}

// --- Catalogue ---

function moons(count) {
  const row = element('span', 'moons');
  row.setAttribute('aria-hidden', 'true');
  for (let k = 0; k < count; k += 1) row.append(icon('moon'));
  return row;
}

function tile(key, balance, onOpen) {
  const entry = item(key);
  const purchases = data.purchases();
  const owned = ownedKeys(purchases).has(key);
  const price = priceOf(key);
  const worn = entry.kind === 'polish' ? data.polish().includes(entry.id) : data.effectChoice() === entry.id;
  const button = element('button', 'shop-item');
  button.type = 'button';
  button.classList.toggle('owned', owned);
  button.classList.toggle('out-of-reach', !owned && !canBuy(key, { balance, purchases }).ok);
  button.classList.toggle('worn', worn);
  button.setAttribute('aria-label', `${entry.name}, ${owned ? texts.owned : TEXTS.common.points(price)}`);
  const picture = element('span', 'thumb');
  picture.append(entry.kind === 'polish' ? polishSwatch(entry.id) : effectPictogram(entry.id));
  const state = element('span', 'item-state');
  if (owned) state.append(`${texts.owned} ✓`);
  else state.append(icon('star'), String(price));
  button.append(picture, element('span', 'item-name', entry.name), state);
  button.addEventListener('click', () => { play('tap'); onOpen(key); });
  return button;
}

function catalogue(container, kind, balance, refresh) {
  const open = (key) => showItem(container, key, refresh);
  const sections = [];
  if (kind === 'effect') {
    const offered = element('section', 'shop-level');
    const grid = element('div', 'shop-grid');
    grid.append(tile(itemKey('effect', MELT), balance, open));
    offered.append(element('h2', null, texts.alreadyMine), grid);
    sections.push(offered);
  }
  const entries = kind === 'polish' ? POLISHES : EFFECTS;
  for (const step of LEVELS) {
    const items = entries.filter((entry) => entry.level === step.id);
    if (!items.length) continue;
    const section = element('section', 'shop-level');
    const head = element('div', 'level-head');
    const name = element('h2');
    name.append(moons(step.moons), step.name);
    head.append(name, element('span', 'level-price', TEXTS.common.points(step.price)));
    const grid = element('div', 'shop-grid');
    grid.append(...items.map((entry) => tile(itemKey(kind, entry.id), balance, open)));
    section.append(head, grid);
    sections.push(section);
  }
  return sections;
}

// --- Aperçu d'un objet, achat confirmé ---

function showItem(container, key, refresh, stage = 'look') {
  const entry = item(key);
  const now = new Date();
  const { balance } = data.history(now);
  const purchases = data.purchases();
  const owned = ownedKeys(purchases).has(key);
  const price = priceOf(key);
  const isPolish = entry.kind === 'polish';

  const hands = createHands({
    preserved: preview(),
    polish: isPolish ? polishAll(entry.id) : data.polish(),
    mini: true,
  });
  if (!isPolish) hands.setFocus('left');
  const tryIt = () => {
    const played = hands.tryEffect(TRY_NAIL, entry.id);
    if (played) play(EFFECT_SOUNDS[played]);
  };

  const step = entry.level ? level(entry.level) : null;
  const subtitle = element('p', 'sheet-subtitle');
  if (step) subtitle.append(moons(step.moons), texts.levelPrice(step.name, step.price));
  else subtitle.append(texts.offered);

  const children = [subtitle, hands.element];
  let closeSheet = () => {};
  const reopen = (next) => { closeSheet(); refresh(); showItem(container, key, refresh, next); };

  if (stage === 'bought') children.push(witch(5, texts.bought).element);
  if (!isPolish) children.push(bigButton(texts.replay, tryIt, { variant: 'second' }));

  if (stage === 'confirm') {
    const box = element('div', 'confirm-box');
    const choices = element('div', 'pair');
    choices.append(
      bigButton(texts.confirmYes, async () => {
        await data.buyItem(key, new Date());
        play('buy');
        reopen('bought');
        celebrate(container);
      }),
      bigButton(texts.confirmNo, () => reopen('look'), { variant: 'second' }),
    );
    box.append(element('p', null, texts.confirm(price, balance, entry.name)), choices);
    children.push(box);
  } else if (owned) {
    if (isPolish) {
      children.push(bigButton(texts.wear, async () => {
        await data.savePolish(polishAll(entry.id));
        brush = entry.id;
        nailByNail = false;
        tab = 'treasures';
        closeSheet();
        play('buy');
        refresh(texts.shining);
      }, { variant: 'gold' }));
    } else {
      const chosen = data.effectChoice() === entry.id;
      children.push(bigButton(chosen ? `${texts.chosen} ✓` : texts.choose, async () => {
        await data.saveEffectChoice(entry.id);
        tab = 'treasures';
        closeSheet();
        refresh(texts.effectChosen(entry.name));
      }, { variant: 'gold' }));
    }
  } else {
    const check = canBuy(key, { balance, purchases });
    if (check.ok) {
      children.push(bigButton(texts.buy(price), () => reopen('confirm'), { variant: 'gold' }));
    } else {
      const label = check.reason === 'paused' ? texts.pausedButton : texts.missingButton(check.missing);
      const blocked = bigButton(label, () => {}, { variant: 'gold' });
      blocked.disabled = true;
      children.push(blocked, element('p', 'centered quiet', check.reason === 'paused' ? texts.paused : texts.missing(check.missing)));
    }
  }
  children.push(bigButton(stage === 'bought' ? texts.keepShopping : texts.close, () => closeSheet(), { variant: 'second' }));
  closeSheet = openSheet(container, children, { title: entry.name });
  if (!isPolish && stage === 'look') setTimeout(() => { if (hands.element.isConnected) tryIt(); }, AUTOPLAY_DELAY);
}

// Pluie de confettis après un achat.
function celebrate(container) {
  const box = element('div', 'confetti');
  box.setAttribute('aria-hidden', 'true');
  const colors = ['#f2c14e', '#b685e6', '#6cc24a', '#ff8fc8'];
  for (let k = 0; k < 28; k += 1) {
    const piece = element('i');
    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 160;
    piece.style.setProperty('--dx', `${Math.round(Math.cos(angle) * distance)}px`);
    piece.style.setProperty('--dy', `${Math.round(Math.sin(angle) * distance)}px`);
    piece.style.background = colors[k % colors.length];
    box.append(piece);
  }
  container.append(box);
  setTimeout(() => box.remove(), 1800);
}

// --- Mes trésors : poser ses vernis, choisir son effet ---

function treasures(container, refresh) {
  const purchases = data.purchases();
  const owned = ownedKeys(purchases);
  const myPolish = POLISHES.filter((entry) => owned.has(itemKey('polish', entry.id)));
  const myEffects = EFFECTS.filter((entry) => owned.has(itemKey('effect', entry.id)));
  const parts = [element('h2', 'section-title', texts.myPolish)];

  let hands = null;
  if (!myPolish.length) {
    parts.push(element('p', 'hint', texts.noPolishYet));
  } else {
    const modes = element('div', 'pair modes');
    for (const [byNail, label] of [[false, texts.wholeHand], [true, texts.nailByNail]]) {
      const button = element('button', 'mode', label);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(nailByNail === byNail));
      button.addEventListener('click', () => { nailByNail = byNail; play('tap'); refresh(); });
      modes.append(button);
    }
    const palette = element('div', 'palette');
    const swatchButton = (id, label, content) => {
      const button = element('button', `swatch${id ? '' : ' bare'}`);
      button.type = 'button';
      button.setAttribute('aria-label', label);
      const worn = data.polish();
      const pressed = nailByNail ? brush === id : worn.every((value) => value === id);
      button.setAttribute('aria-pressed', String(pressed));
      button.append(content);
      button.addEventListener('click', async () => {
        brush = id;
        play('tap');
        if (!nailByNail) {
          await data.savePolish(polishAll(id));
          for (let nail = 0; nail < 10; nail += 1) hands.setPolish(nail, id);
        }
        palette.querySelectorAll('.swatch').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      });
      return button;
    };
    palette.append(swatchButton(null, texts.noPolish, texts.noPolish),
      ...myPolish.map((entry) => swatchButton(entry.id, entry.name, polishSwatch(entry.id))));
    hands = createHands({
      preserved: preview(),
      polish: data.polish(),
      interactive: nailByNail,
      swipe: true,
      onTouch: async (nail) => {
        hands.setPolish(nail, brush);
        play('tap');
        await data.savePolish(polishOne(data.polish(), nail, brush));
      },
    });
    parts.push(modes, palette, element('p', 'hint', nailByNail ? texts.nailHint : texts.wholeHandHint), hands.element);
  }

  // Effet de casse : un des siens, ou la surprise (DEC-131).
  parts.push(element('h2', 'section-title', texts.myEffect));
  const list = element('div', 'effect-list');
  const choice = data.effectChoice();
  const row = (id, label, picture, hint) => {
    const button = element('button', 'effect-row');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(choice === id));
    const name = element('span', 'effect-name');
    name.append(element('strong', null, label));
    if (hint) name.append(element('span', 'quiet block', hint));
    button.append(picture, name, element('span', 'tick', choice === id ? '✓' : ''));
    button.addEventListener('click', async () => {
      await data.saveEffectChoice(id);
      play('tap');
      refresh();
    });
    return button;
  };
  list.append(...myEffects.map((entry) => row(entry.id, entry.name, effectPictogram(entry.id))),
    row(SURPRISE, texts.surprise, icon('dice'), texts.surpriseHint));
  parts.push(list);

  // Essai de l'effet sur un ongle : avec ses vernis si elle en a, sinon sur une main d'aperçu.
  let tryHands = hands;
  if (!tryHands) {
    tryHands = createHands({ preserved: preview(), polish: data.polish(), mini: true });
    parts.push(tryHands.element);
  }
  parts.push(bigButton(texts.tryEffect, () => {
    tryHands.setFocus('left');
    const played = tryHands.tryEffect(TRY_NAIL, data.nextBreakEffect());
    if (played) play(EFFECT_SOUNDS[played]);
  }, { variant: 'second', iconName: 'bolt' }));
  return parts;
}
