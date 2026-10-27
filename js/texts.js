// Ongles de sorcière - Textes montrés à l'enfant.
// Phrases choisies par Mat et sa fille sur la maquette (DEC-106), et propositions validées de Q03.
// Aucun texte ne parle de mensonge, de menteuse ou de punition (EX-049, test TA-20).
// Ce module n'utilise pas la page : les tests le lisent directement.

// Expressions de la sorcière (DEC-093) : 1 joyeuse, 2 clin d'œil, 3 émerveillée, 4 rêveuse,
// 5 rit, 6 sourire doux, 8 réfléchit, 9 contente.
export const EXPRESSIONS = { joyful: 1, wink: 2, amazed: 3, dreamy: 4, laughing: 5, gentle: 6, thinking: 8, pleased: 9 };

export const TEXTS = {
  firstLaunch: {
    hello: 'Bonjour, petite apprentie ! Je suis la sorcière de tes ongles.',
    rule: 'Chaque soir, tu me montres tes ongles. Quand tu les préserves, les miens poussent !',
    ready: 'Mon grimoire est prêt !',
    next: 'Suite',
    start: 'C’est parti',
  },
  home: {
    tooEarly: 'Reviens ce soir, petite sorcière !',
    invite: 'Tu me montres tes ongles, petite apprentie ?',
    thanks: 'Merci pour ce soir ! Mes ongles poussent grâce à toi.',
    evening: 'Ma soirée',
    editEvening: 'Modifier ma soirée',
    calendar: 'Mon calendrier',
    sundayReminder: 'Pour les parents : fermer la semaine et sauvegarder.',
  },
  declaration: {
    prompt: 'Touche les doigts dont tu as rongé l’ongle aujourd’hui.',
    nailBack: 'D’accord, cet ongle est revenu.',
    done: 'J’ai fini',
    noneQuestion: 'Aucun ongle rongé ce soir ?',
    noneYes: 'Oui !',
    noneCheck: 'Je vérifie',
  },
  // Message « trop tôt », avant 16 h (RG-002) : un tiré au hasard.
  tooEarly: [
    'Ma marmite bouillonne encore, reviens ce soir, petite sorcière !',
    'Chut, mes ongles font la sieste jusqu’à 16 heures. Reviens plus tard !',
    'Le chaudron n’est pas prêt, il faut d’abord que tes ongles vivent leur journée. À ce soir !',
    'Les crapauds dorment encore, ne les réveille pas. Reviens quand le soleil baisse !',
    'Abracadabra... non, trop tôt ! La magie ouvre à 16 heures.',
  ],
  // Phrase de franchise, quand un ongle fond (EX-053).
  honesty: [
    'Merci de me l’avoir dit. Les vraies sorcières disent toujours la vérité.',
    'Oups, un ongle a fondu ! Ce n’est pas grave, il repoussera. Bravo pour ta franchise.',
    'Tu es honnête, et ça, c’est la plus puissante des magies.',
    'Je préfère un ongle fondu à un ongle caché. Merci, petite apprentie !',
  ],
  sessionEnd: {
    preserved: 'Ongles préservés',
    bonus: 'Bonus',
    noBonus: 'Pas de bonus ce soir, ce n’est pas grave.',
    perfectDay: 'Journée parfaite',
    streakBonus: (length) => `Série de ${length} soirs`,
    streak: (length) => `${length} soir${length > 1 ? 's' : ''} de suite`,
    newStreak: 'Une nouvelle série commence demain !',
    goodnight: 'Bonne nuit',
    mistake: 'Je me suis trompée',
  },
  // Bonne nuit : une tirée au hasard à chaque fin de session (DEC-106).
  goodnight: [
    'Abracadabra, au lit ! Tes ongles poussent mieux en dormant.',
    'La lune est levée, ma magie veille sur tes mains. Bonne nuit !',
    'Je range ma baguette pour la nuit. Dors bien, petite apprentie !',
    'Les étoiles s’allument une à une, comme tes ongles qui brillent. Bonne nuit !',
    'Mon chat noir ronronne déjà. Fais de doux rêves magiques !',
  ],
  // États vides (DEC-106), utilisés par le calendrier et le rattrapage.
  empty: {
    newCalendar: 'Rien encore dans mon grimoire... mais la magie commence ce soir !',
    nothingForgotten: 'Rien d’oublié, tout est en ordre dans mon grimoire !',
    future: 'Même ma magie ne sait pas lire l’avenir. Reviens ce jour-là !',
    tonight: 'Mon grimoire garde une page blanche pour ce soir.',
  },
  common: {
    back: 'Retour',
    home: 'Retour à l’accueil',
    points: (count) => `${count} point${count > 1 ? 's' : ''}`,
    soundOff: 'Couper le son',
    soundOn: 'Remettre le son',
    parentArea: 'Espace parent',
  },
};

// Textes de l'espace parent : montrés aux parents seulement.
export const PARENT_TEXTS = {
  createCode: 'Crée le code parent',
  confirmCode: 'Confirme le code parent',
  createHint: 'Choisis un code que ta fille ne connaît pas.',
  codeMismatch: 'Les deux codes sont différents, on recommence.',
  enterCode: 'Code parent',
  wrongCode: 'Ce n’est pas le bon code.',
  forgotten: 'Code oublié ?',
  forgottenTitle: 'Code oublié',
  forgottenSteps: [
    'Désinstaller l’application (cela efface ses données).',
    'La réinstaller depuis Chrome.',
    'Créer un nouveau code au premier lancement.',
    'Restaurer la dernière sauvegarde : le nouveau code est gardé.',
  ],
  understood: 'J’ai compris',
  erase: 'Effacer',
  digits: (count) => `${count} chiffre${count > 1 ? 's' : ''} sur 4`,
};

const WEEKDAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// « mardi 27 octobre », à partir d'une date 'AAAA-MM-JJ'.
export function dayLabel(key) {
  const [year, month, day] = key.split('-').map(Number);
  const weekday = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
  return `${WEEKDAYS[weekday]} ${day === 1 ? '1er' : day} ${MONTHS[month - 1]}`;
}

// Une phrase au hasard, si possible différente de la précédente.
export function pick(list, avoid = null) {
  const choices = list.length > 1 ? list.filter((text) => text !== avoid) : list;
  return choices[Math.floor(Math.random() * choices.length)];
}

// Tous les textes montrés à l'enfant, pour le test TA-20.
export function childTexts() {
  const samples = [];
  const collect = (value) => {
    if (typeof value === 'string') samples.push(value);
    else if (typeof value === 'function') samples.push(value(1), value(2), value(6));
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };
  collect(TEXTS);
  return samples;
}
