// Ongles de sorcière - Dates du calendrier.
// Un jour est désigné par sa date locale, sous la forme 'AAAA-MM-JJ' (RG-001).
// Les jours se comptent sur le calendrier, jamais en ajoutant des heures : un changement d'heure
// ne crée ni doublon ni trou (EX-048). Aucune fonction ne lit l'heure elle-même : l'instant
// présent est toujours passé en paramètre, pour que les tests puissent simuler n'importe quel jour.

// Heures des bascules (RG-001) : la déclaration ouvre à 16 h et ferme à 4 h le lendemain.
export const OPENING_HOUR = 16;
export const CLOSING_HOUR = 4;

const pad = (n) => String(n).padStart(2, '0');

// Date locale d'un instant, en 'AAAA-MM-JJ'.
export function dateKey(instant) {
  return `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(instant.getDate())}`;
}

// Instant local correspondant à une date et une heure.
export function atLocal(key, hour = 0, minute = 0) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

// Date décalée d'un nombre de jours. Le calcul se fait en temps universel, où aucun jour
// ne dure 23 ou 25 heures.
export function addDays(key, count) {
  const [year, month, day] = key.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + count));
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

// Nombre de jours de la première date à la seconde.
export function daysBetween(from, to) {
  const toUtc = (key) => {
    const [year, month, day] = key.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtc(to) - toUtc(from)) / 86400000);
}

// Jour de la semaine : 0 pour lundi, 6 pour dimanche (RG-004).
export function weekday(key) {
  const [year, month, day] = key.split('-').map(Number);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

// Lundi de la semaine qui contient cette date.
export function mondayOf(key) {
  return addDays(key, -weekday(key));
}

// Les sept dates d'une semaine, du lundi au dimanche.
export function weekDates(monday) {
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

// Toutes les dates de la première à la dernière, incluses.
export function dateRange(first, last) {
  const dates = [];
  for (let key = first; key <= last; key = addDays(key, 1)) dates.push(key);
  return dates;
}

// Le jour que l'enfant raconte à cet instant : entre 0 h et 4 h, c'est la veille (RG-001).
export function storyDate(now) {
  const today = dateKey(now);
  return now.getHours() < CLOSING_HOUR ? addDays(today, -1) : today;
}

// La déclaration du soir est ouverte de 16 h à 4 h (RG-001).
export function isDeclarationOpen(now) {
  const hour = now.getHours();
  return hour >= OPENING_HOUR || hour < CLOSING_HOUR;
}

// Le 4 h du matin qui suit un instant : c'est l'heure de verrouillage d'une saisie (RG-003).
export function nextLockTime(instant) {
  const today = dateKey(instant);
  return instant.getHours() < CLOSING_HOUR
    ? atLocal(today, CLOSING_HOUR)
    : atLocal(addDays(today, 1), CLOSING_HOUR);
}

// Ouverture du bilan d'une semaine : son dimanche à 16 h.
export function reviewOpeningTime(monday) {
  return atLocal(addDays(monday, 6), OPENING_HOUR);
}

// Fermeture automatique d'une semaine : à la fin du dimanche suivant, soit le lundi
// d'après à 0 h (RG-005, DEC-017).
export function autoClosingTime(monday) {
  return atLocal(addDays(monday, 14), 0);
}
