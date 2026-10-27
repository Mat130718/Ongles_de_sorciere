// Ongles de sorcière - Code parent (EX-031).
// Le code n'est jamais gardé en clair : le téléphone garde seulement un sel tiré au hasard et
// une empreinte calculée par PBKDF2, avec l'outil de chiffrement du navigateur (crypto.subtle).
// Le code ne quitte jamais le téléphone, ni dans la sauvegarde (DEC-094).

export const CODE_LENGTH = 4;
const ITERATIONS = 100000;
const SALT_BYTES = 16;

const toBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = (text) => Uint8Array.from(atob(text), (char) => char.charCodeAt(0));

export function isValidCode(code) {
  return typeof code === 'string' && new RegExp(`^[0-9]{${CODE_LENGTH}}$`).test(code);
}

async function digest(code, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return toBase64(bits);
}

// Fiche à garder dans les réglages : { salt, hash, iterations }.
export async function createCodeRecord(code) {
  if (!isValidCode(code)) throw new Error('Le code parent compte quatre chiffres.');
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return { salt: toBase64(salt), hash: await digest(code, salt, ITERATIONS), iterations: ITERATIONS };
}

export async function checkCode(code, record) {
  if (!isValidCode(code) || !record?.salt || !record?.hash) return false;
  return (await digest(code, fromBase64(record.salt), record.iterations ?? ITERATIONS)) === record.hash;
}
