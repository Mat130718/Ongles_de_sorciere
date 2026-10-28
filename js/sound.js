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

// Une note douce : montée très rapide, puis extinction. glide : fréquence d'arrivée, pour
// une note qui glisse ; shape : forme de l'onde, plus rugueuse pour le crapaud et le rot.
function note(output, frequency, start, duration, volume, { shape = 'sine', glide } = {}) {
  const oscillator = output.createOscillator();
  const gain = output.createGain();
  oscillator.type = shape;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (glide) oscillator.frequency.exponentialRampToValueAtTime(glide, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(output.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

// Un petit souffle : du bruit qui s'éteint vite (ailes, éclatement).
function noise(output, start, duration, volume) {
  const buffer = output.createBuffer(1, Math.ceil(output.sampleRate * duration), output.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i += 1) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length) ** 3;
  const source = output.createBufferSource();
  const gain = output.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(output.destination);
  source.start(start);
}

// Les bruitages. Celui de la fonte est fait de petites clochettes qui s'éteignent,
// jamais un son qui descend comme « perdu » (DEC-104). Les effets de la boutique restent
// courts et rigolos, comme ceux de la maquette (DEC-133).
const SOUNDS = {
  melt: (output, t) => [1568, 2093, 1760, 2349].forEach((f, i) => note(output, f, t + i * 0.11, 0.7, 0.07)),
  grow: (output, t) => [660, 880, 1175].forEach((f, i) => note(output, f, t + i * 0.12, 0.4, 0.1)),
  tap: (output, t) => note(output, 880, t, 0.12, 0.08),
  buy: (output, t) => [784, 988, 1175, 1568].forEach((f, i) => note(output, f, t + i * 0.09, 0.5, 0.09)),
  sparkles: (output, t) => [2400, 1900, 3100, 2600, 3400, 2100, 2900, 3300, 2500]
    .forEach((f, i) => note(output, f, t + 0.05 + i * 0.06, 0.25, 0.05)),
  bat: (output, t) => {
    for (let i = 0; i < 8; i += 1) noise(output, t + 0.3 + i * 0.11, 0.06, 0.12);
    note(output, 2400, t + 0.35, 0.18, 0.04, { glide: 3200 });
  },
  toad: (output, t) => [0.6, 1.3, 2].forEach((d) => note(output, 140, t + d, 0.28, 0.16, { shape: 'sawtooth', glide: 90 })),
  pumpkin: (output, t) => {
    note(output, 220, t, 0.9, 0.05, { glide: 520 });
    noise(output, t + 0.95, 0.35, 0.35);
    note(output, 660, t + 1, 0.3, 0.06);
  },
  cauldron: (output, t) => {
    note(output, 300, t + 0.7, 0.12, 0.1, { shape: 'square', glide: 500 });
    note(output, 300, t + 1.25, 0.12, 0.1, { shape: 'square', glide: 520 });
    note(output, 120, t + 2.1, 0.7, 0.18, { shape: 'sawtooth', glide: 60 });
  },
};

// Bruitage de chaque effet de casse.
export const EFFECT_SOUNDS = {
  fond: 'melt', paillettes: 'sparkles', chauvesouris: 'bat', crapaud: 'toad', citrouille: 'pumpkin', chaudron: 'cauldron',
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
