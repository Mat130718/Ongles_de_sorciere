// Ongles de sorcière - Bruitages fabriqués par programme, avec Web Audio (DEC-039, DEC-091).
// Aucun fichier son : chaque bruitage est une suite de notes calculées. Tout reste
// compréhensible sans le son (EX-027). Si le téléphone ne joue pas de son, rien ne casse.

let context = null;
let enabled = true;

export function setSoundEnabled(value) {
  enabled = Boolean(value);
}

export function isSoundEnabled() {
  return enabled;
}

function audio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  context ??= new AudioContext();
  // Chrome suspend le son tant que l'enfant n'a rien touché ; un toucher le réveille.
  if (context.state === 'suspended') context.resume();
  return context;
}

// Une note douce : montée très rapide, puis extinction.
function note(output, frequency, start, duration, volume) {
  const oscillator = output.createOscillator();
  const gain = output.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(output.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

// Les bruitages. Celui de la fonte est fait de petites clochettes qui s'éteignent,
// jamais un son qui descend comme « perdu » (DEC-104).
const SOUNDS = {
  melt: (output, t) => [1568, 2093, 1760, 2349].forEach((f, i) => note(output, f, t + i * 0.11, 0.7, 0.07)),
  grow: (output, t) => [660, 880, 1175].forEach((f, i) => note(output, f, t + i * 0.12, 0.4, 0.1)),
  tap: (output, t) => note(output, 880, t, 0.12, 0.08),
};

export function play(name) {
  if (!enabled || !SOUNDS[name]) return;
  try {
    const output = audio();
    if (output) SOUNDS[name](output, output.currentTime);
  } catch {
    // Pas de son : l'application reste utilisable.
  }
}
