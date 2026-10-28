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
    shop: 'Ma boutique',
    sundayReminder: 'Pour les parents : fermer la semaine et sauvegarder.',
    forgotten: (count) => `Tu as oublié ${count === 1 ? 'un soir' : `${count} soirs`}, on ${count === 1 ? 'le' : 'les'} rattrape ?`,
    forgottenYes: 'Oui',
    forgottenLater: 'Plus tard',
    // Annonce d'une semaine fermée, à la première ouverture qui suit (maquette).
    weekSealed: (bonuses) => (bonuses.length
      ? `La semaine dernière est scellée dans mon grimoire : ${bonuses.join(', ')} !`
      : 'La semaine dernière est scellée dans mon grimoire. Une nouvelle aventure commence !'),
    weekSealedFresh: (bonuses) => `Une nouvelle semaine commence. Plein de chapeaux nous attendent !${bonuses.length ? ` Bonus : ${bonuses.join(', ')}.` : ''}`,
    perfectWeekBonus: 'semaine parfaite +15',
    honestyBonus: 'bonus honnêteté +20',
    thanksAnnouncement: 'Merci !',
  },
  declaration: {
    prompt: 'Touche les doigts dont tu as rongé l’ongle aujourd’hui.',
    nailBack: 'D’accord, cet ongle est revenu.',
    done: 'J’ai fini',
    noneQuestion: 'Aucun ongle rongé ce soir ?',
    noneYes: 'Oui !',
    noneCheck: 'Je vérifie',
  },
  catchUp: {
    title: 'Les soirs oubliés',
    which: 'Lequel me racontes-tu ?',
    button: 'Rattraper un soir oublié',
    declarationTitle: (label) => `Le soir oublié : ${label}`,
    told: (label) => `${label} est raconté !`,
    summary: (classic, bonuses = [], total = classic) => `${classic} point${classic > 1 ? 's' : ''} pour les ongles préservés${bonuses.length ? `, ${bonuses.join(', ')}` : ''}. Total du soir : ${total}. Les séries sont recalculées.`,
    next: 'Soir oublié suivant',
  },
  calendar: {
    title: 'Mon calendrier',
    look: 'Regarde tous les soirs que tu m’as racontés !',
    lastWeek: 'Semaine dernière',
    thisWeek: 'Cette semaine',
    sealed: 'Grimoire scellé',
    hint: 'Touche un jour pour voir sa main et ses points.',
    legend: {
      hat: 'Aucun ongle rongé',
      toad: 'Au moins un ongle rongé',
      redToad: 'Jour corrigé par les parents',
      streak: 'Soirs de suite',
    },
    symbols: { hat: 'chapeau pailleté', toad: 'crapaud', 'red-toad': 'crapaud rouge pailleté' },
    future: 'à venir',
    notTold: 'pas encore raconté',
    beforeStart: 'avant le début du jeu',
    notToldEvening: 'Ce soir-là n’est pas encore raconté.',
    catchUpDay: 'Rattraper ce soir-là',
    tellTonight: 'Raconter ce soir',
    beforeStartText: 'Ce soir-là, mon grimoire n’était pas encore ouvert.',
    redToad: 'Tes parents ont corrigé ce jour. La confiance revient vite, petite sorcière !',
    none: 'Aucun',
    close: 'Fermer',
  },
  // Boutique (palier 2) : phrases choisies par l'enfant sur la maquette (DEC-133).
  shop: {
    title: 'La boutique de la sorcière',
    welcome: 'Entre, petite apprentie ! Mes étagères débordent de magie.',
    missing: (count) => `Encore ${count} point${count > 1 ? 's' : ''} et il est à toi. Chaque chapeau te rapproche !`,
    bought: 'Abracadabra, il est à toi !',
    paused: 'Mon chaudron se remplit doucement. Encore quelques chapeaux et tu pourras acheter de nouveau !',
    closed: 'Raconte-moi d’abord ta soirée, ensuite on ouvre la boutique !',
    tabs: { polish: 'Vernis', effects: 'Effets', treasures: 'Mes trésors' },
    owned: 'À toi',
    alreadyMine: 'Déjà à toi',
    offered: 'Offert au départ',
    levelPrice: (name, price) => `${name} · ${price} points`,
    buy: (price) => `Acheter pour ${price} points`,
    missingButton: (count) => `Encore ${count} point${count > 1 ? 's' : ''}`,
    pausedButton: 'Achats en pause',
    confirm: (price, balance, name) => `Tu donnes ${price} de tes ${balance} points pour « ${name} » ?`,
    confirmYes: 'Oui, je l’achète',
    confirmNo: 'Non, pas maintenant',
    wear: 'Mettre sur ma main',
    choose: 'Choisir cet effet',
    chosen: 'C’est mon effet',
    replay: 'Rejouer l’effet',
    close: 'Fermer',
    keepShopping: 'Continuer mes achats',
    myPolish: 'Mes vernis',
    wholeHand: 'Toute la main',
    nailByNail: 'Ongle par ongle',
    noPolish: 'Sans vernis',
    noPolishYet: 'Tu n’as pas encore de vernis. Va voir l’onglet « Vernis » !',
    wholeHandHint: 'Touche un vernis : il se pose sur les dix ongles.',
    nailHint: 'Choisis un vernis, puis touche les ongles à peindre.',
    myEffect: 'Mon effet quand un ongle casse',
    surprise: 'Surprise !',
    surpriseHint: 'Un de tes effets, tiré au hasard',
    tryEffect: 'Essayer sur un ongle',
    shining: 'Regarde comme tes ongles brillent !',
    effectChosen: (name) => `C’est noté : « ${name} » !`,
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
    // Un solde négatif s'écrit avec un vrai signe moins, sans couleur d'alerte (DEC-129).
    points: (count) => `${count < 0 ? `−${-count}` : count} point${Math.abs(count) > 1 ? 's' : ''}`,
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
  cancel: 'Annuler',
  menu: {
    title: 'Espace parent',
    review: 'Bilan de la semaine',
    backup: 'Sauvegarder',
    restore: 'Restaurer',
    changeCode: 'Changer le code',
    eraseAll: 'Tout effacer',
    backToGame: 'Revenir au jeu',
    back: '← Espace parent',
  },
  changeCode: {
    old: 'Tape l’ancien code',
    new: 'Choisis le nouveau code',
    confirm: 'Confirme le nouveau code',
    done: 'Le code est changé.',
  },
  review: {
    title: (from, to) => `Semaine du ${from} au ${to}`,
    nothing: 'Aucune semaine à fermer pour l’instant.',
    nextOpening: (monday, sunday) => `Le bilan de la semaine du ${monday} ouvrira ${sunday} à 16 h.`,
    declared: 'Soirs déclarés par ta fille',
    declaredCount: (count, total) => `${count} sur ${total}`,
    childOnly: 'Visible seulement ici, jamais par ta fille.',
    toComplete: 'Soir non raconté, à compléter.',
    sundayPending: 'Ta fille peut encore raconter ce soir, jusqu’à lundi 4 h.',
    future: 'Soir à venir.',
    nails: (count) => (count ? `${count} ongle${count > 1 ? 's' : ''} rongé${count > 1 ? 's' : ''}` : 'Aucun ongle rongé'),
    by: {
      child: 'déclaré par ta fille',
      none: 'complété : aucun ongle rongé',
      forgotten: 'complété : vrai oubli',
      omission: 'complété : mensonge par omission',
      corrected: 'corrigé',
    },
    choiceNone: 'Aucun ongle rongé',
    choiceForgotten: 'Ongle rongé, vrai oubli',
    choiceOmission: 'Ongle rongé, mensonge par omission',
    correct: 'Corriger',
    nailsTitle: {
      forgotten: (label) => `${label} : vrai oubli`,
      omission: (label) => `${label} : mensonge par omission`,
      correct: (label) => `Corriger ${label}`,
    },
    nailsHint: 'Touche les ongles rongés ce jour-là.',
    correctHint: 'Touche les ongles rongés en plus. Ceux déjà déclarés restent rongés.',
    validate: 'Valider',
    weekBonus: 'Bonus de la semaine',
    perfect: (yes) => `Semaine parfaite : ${yes ? 'oui, +15' : 'pas cette fois'}`,
    honesty: 'La semaine a été déclarée honnêtement : +20',
    honestyHint: 'À cocher si tu as constaté que les déclarations étaient justes.',
    honestyBlocked: 'Impossible cette semaine : un jour a été corrigé ou complété comme mensonge par omission.',
    close: 'Fermer la semaine',
    remaining: (count) => `Il reste ${count} soir${count > 1 ? 's' : ''} à compléter avant de fermer.`,
    waitSunday: 'Le dimanche reste à ta fille jusqu’à lundi 4 h : tu pourras fermer ensuite.',
    confirmTitle: 'Fermer la semaine ?',
    confirmText: 'C’est définitif : plus aucun rattrapage ni changement pour cette semaine.',
    closedTitle: 'Semaine fermée',
    closedBravo: 'Bravo pour cette semaine ! On continue ?',
    closedFresh: 'Une nouvelle semaine commence. Plein de chapeaux nous attendent !',
    closedNote: 'Ta fille verra les bonus à sa prochaine ouverture.',
    saveNow: 'Sauvegarder maintenant',
    later: 'Plus tard',
  },
  backup: {
    title: 'Sauvegarde',
    last: 'Dernière sauvegarde',
    never: 'Jamais',
    lastAt: (day, time) => `${day}, à ${time}`,
    protected: (yes) => (yes
      ? 'Le téléphone protège les données de l’application.'
      : 'Le téléphone n’a pas promis de protéger les données : sauvegarde souvent.'),
    save: 'Sauvegarder maintenant',
    restore: 'Restaurer une sauvegarde',
    eraseAll: 'Tout effacer',
    photos: 'Les photos ne sont pas dans la sauvegarde (elles arrivent au palier 2).',
    savedTitle: 'Sauvegarde enregistrée',
    savedText: 'Le fichier est dans « Mes fichiers », dossier Téléchargements :',
    savedAdvice: 'Copie-le sur ton PC avec un câble USB, puis range-le hors ligne. Garde aussi le dernier fichier sur le téléphone.',
    ok: 'D’accord',
    restoreTitle: 'Restaurer une sauvegarde',
    chosenFile: 'Fichier choisi :',
    summary: (from, to, evenings, balance) => `Du ${from} au ${to}, ${evenings} soir${evenings > 1 ? 's' : ''}, solde de ${balance} point${balance > 1 ? 's' : ''}. Format vérifié.`,
    replaceWarning: 'Ces données remplaceront celles du téléphone. Le code parent actuel est gardé.',
    restoreConfirm: 'Restaurer',
    restored: 'Sauvegarde restaurée.',
    refused: {
      'not-json': 'Ce fichier n’est pas une sauvegarde de l’application : il n’est pas lisible.',
      'not-backup': 'Ce fichier n’est pas une sauvegarde de l’application.',
      'too-recent': 'Cette sauvegarde vient d’une version plus récente de l’application. Mets d’abord l’application à jour.',
      invalid: 'Cette sauvegarde est abîmée : elle ne peut pas être restaurée.',
    },
    untouched: 'Les données du téléphone n’ont pas changé.',
    eraseTitle: 'Tout effacer ?',
    eraseText: 'Tout l’historique, les points et le code seront effacés. Rien ne pourra être récupéré sans sauvegarde. Pense à sauvegarder avant.',
    eraseContinue: 'Continuer',
    eraseLastTitle: 'Dernière confirmation',
    eraseLastText: 'Tape le code parent pour tout effacer.',
  },
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
