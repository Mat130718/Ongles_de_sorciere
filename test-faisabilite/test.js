// Ongle de sorcière - Page de test de faisabilité
// Version 1.0 du 26/10/2026 : première version.
// Chaque vérification remplit sa section et le compte rendu à copier.
// Rien n'est envoyé : la page ne fait aucun appel réseau, hormis le chargement de ses propres fichiers.
'use strict';

const VERSION = '1.0';
const resultats = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
const TITRES = {
  1: 'Téléphone',
  2: 'Installation et hors ligne',
  3: 'Stockage durable',
  4: 'Données fictives',
  5: 'Voix française',
  6: 'Caméra'
};

function $(id) { return document.getElementById(id); }

function noter(numero, lignes) {
  resultats[numero] = lignes;
  $('r' + numero).textContent = lignes.join('\n');
  composerCompteRendu();
}

function ouiNon(valeur) { return valeur ? 'oui' : 'non'; }

function enMo(octets) {
  return typeof octets === 'number' ? Math.round(octets / 1048576) + ' Mo' : 'inconnu';
}

function composerCompteRendu() {
  const lignes = ['Ongle de sorcière - Test de faisabilité v' + VERSION,
    'Date : ' + new Date().toLocaleString('fr-FR')];
  for (const numero of [1, 2, 3, 4, 5, 6]) {
    lignes.push('', numero + '. ' + TITRES[numero]);
    for (const ligne of resultats[numero]) lignes.push('- ' + ligne);
  }
  lignes.push('', 'Constats de Mat',
    '- Rouverte en mode avion : ' + ouiNon($('c-hors-ligne').checked),
    '- Voix entendue : ' + ouiNon($('c-voix').checked),
    '- Voix entendue en mode avion : ' + ouiNon($('c-voix-avion').checked),
    '- Image de la caméra vue : ' + ouiNon($('c-camera').checked));
  $('texte').value = lignes.join('\n');
}

// 1. Le téléphone : modèle, versions d'Android et de Chrome (QO-001, QO-002).
async function testerTelephone() {
  const lignes = [];
  const donnees = navigator.userAgentData;
  if (donnees && donnees.getHighEntropyValues) {
    try {
      const v = await donnees.getHighEntropyValues(['model', 'platformVersion', 'fullVersionList']);
      const chrome = (v.fullVersionList || []).find((m) => /Chrome|Chromium/.test(m.brand));
      lignes.push('Modèle : ' + (v.model || 'non communiqué'));
      lignes.push('Système : ' + v.platform + ' ' + (v.platformVersion || ''));
      lignes.push('Chrome : ' + (chrome ? chrome.version : 'non trouvé'));
    } catch (erreur) {
      lignes.push('Lecture détaillée refusée : ' + erreur.message);
    }
  }
  lignes.push('Identifiant du navigateur : ' + navigator.userAgent);
  lignes.push('Écran : ' + screen.width + ' x ' + screen.height + ' points, densité ' + window.devicePixelRatio);
  lignes.push('Langue : ' + navigator.language + ' ; fuseau : ' + Intl.DateTimeFormat().resolvedOptions().timeZone);
  noter(1, lignes);
}

// 2. Installation comme application et fonctionnement sans réseau.
let invitationInstallation = null;
let etatService = 'pas encore lu';

window.addEventListener('beforeinstallprompt', (evenement) => {
  evenement.preventDefault();
  invitationInstallation = evenement;
  $('b-installer').hidden = false;
  testerInstallation();
});

window.addEventListener('appinstalled', () => {
  $('b-installer').hidden = true;
  testerInstallation('installation terminée');
});

function testerInstallation(evenement) {
  const installee = window.matchMedia('(display-mode: standalone)').matches;
  const lignes = [
    'Ouverte comme application installée : ' + ouiNon(installee),
    'Chrome propose l\'installation : ' + (installee ? 'sans objet' : ouiNon(invitationInstallation !== null)),
    'Fonctionnement hors ligne : ' + etatService,
    'Réseau disponible en ce moment : ' + ouiNon(navigator.onLine)
  ];
  if (evenement) lignes.push('Événement : ' + evenement);
  noter(2, lignes);
}

async function preparerHorsLigne() {
  if (!('serviceWorker' in navigator)) {
    etatService = 'non pris en charge';
  } else {
    try {
      await navigator.serviceWorker.register('sw.js');
      await navigator.serviceWorker.ready;
      etatService = 'prêt (fichiers gardés sur le téléphone)';
    } catch (erreur) {
      etatService = 'échec : ' + erreur.message;
    }
  }
  testerInstallation();
}

$('b-installer').addEventListener('click', async () => {
  if (!invitationInstallation) return;
  invitationInstallation.prompt();
  const choix = await invitationInstallation.userChoice;
  invitationInstallation = null;
  $('b-installer').hidden = true;
  testerInstallation('choix : ' + choix.outcome);
});

// 3. Stockage durable (QO-017) : Chrome peut-il effacer les données en cas de manque de place ?
async function testerStockage(demande) {
  const lignes = [];
  if (!navigator.storage || !navigator.storage.persisted) {
    noter(3, ['Stockage durable non pris en charge']);
    return;
  }
  if (demande) {
    try {
      lignes.push('Demande faite, réponse : ' + ouiNon(await navigator.storage.persist()));
    } catch (erreur) {
      lignes.push('Demande refusée : ' + erreur.message);
    }
  }
  lignes.push('Stockage durable accordé : ' + ouiNon(await navigator.storage.persisted()));
  if (navigator.storage.estimate) {
    const estimation = await navigator.storage.estimate();
    lignes.push('Place utilisée : ' + enMo(estimation.usage) + ' sur ' + enMo(estimation.quota) + ' autorisés');
  }
  noter(3, lignes);
}

$('b-durable').addEventListener('click', () => testerStockage(true));

// 4. Écriture et relecture de données fictives dans la base locale du téléphone.
// La base garde aussi le nombre de visites, pour vérifier que les données survivent à la fermeture.
function ouvrirBase() {
  return new Promise((resoudre, rejeter) => {
    const requete = indexedDB.open('test-faisabilite', 1);
    requete.onupgradeneeded = () => requete.result.createObjectStore('essais');
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}

function lire(base, cle) {
  return new Promise((resoudre, rejeter) => {
    const requete = base.transaction('essais').objectStore('essais').get(cle);
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}

function ecrire(base, cle, valeur) {
  return new Promise((resoudre, rejeter) => {
    const transaction = base.transaction('essais', 'readwrite');
    transaction.objectStore('essais').put(valeur, cle);
    transaction.oncomplete = () => resoudre();
    transaction.onerror = () => rejeter(transaction.error);
  });
}

async function testerDonnees() {
  const lignes = [];
  try {
    const base = await ouvrirBase();
    const fictif = { jour: '2026-10-26', ongles: [1, 0, 1, 1, 1], crapauds: 1 };
    await ecrire(base, 'jour-fictif', fictif);
    const relu = await lire(base, 'jour-fictif');
    lignes.push('Écriture et relecture : ' + (JSON.stringify(relu) === JSON.stringify(fictif) ? 'OK' : 'KO'));

    const visites = (await lire(base, 'visites')) || { premiere: new Date().toISOString(), nombre: 0 };
    visites.nombre += 1;
    await ecrire(base, 'visites', visites);
    lignes.push('Visites enregistrées : ' + visites.nombre +
      ' (première le ' + new Date(visites.premiere).toLocaleString('fr-FR') + ')');
  } catch (erreur) {
    lignes.push('Base locale en échec : ' + erreur.message);
  }
  noter(4, lignes);
}

// 5. Voix française de synthèse (QO-018) : une voix « locale » fonctionne sans réseau.
let voixChoisie = null;

function listerVoix() {
  return new Promise((resoudre) => {
    const voix = speechSynthesis.getVoices();
    if (voix.length) { resoudre(voix); return; }
    const delai = setTimeout(() => resoudre(speechSynthesis.getVoices()), 3000);
    speechSynthesis.addEventListener('voiceschanged', () => {
      clearTimeout(delai);
      resoudre(speechSynthesis.getVoices());
    }, { once: true });
  });
}

async function testerVoix() {
  if (!('speechSynthesis' in window)) {
    noter(5, ['Synthèse vocale non prise en charge']);
    $('b-voix').hidden = true;
    return;
  }
  const voix = await listerVoix();
  const francaises = voix.filter((v) => /^fr/i.test(v.lang));
  voixChoisie = francaises.find((v) => v.localService) || francaises[0] || null;
  const lignes = ['Voix disponibles : ' + voix.length + ', dont françaises : ' + francaises.length];
  for (const v of francaises) {
    lignes.push(v.name + ' (' + v.lang + ', ' + (v.localService ? 'sur le téléphone' : 'en ligne') + ')');
  }
  lignes.push('Voix utilisée pour l\'essai : ' + (voixChoisie ? voixChoisie.name : 'aucune voix française'));
  noter(5, lignes);
}

$('b-voix').addEventListener('click', () => {
  speechSynthesis.cancel();
  const phrase = new SpeechSynthesisUtterance('Bonsoir ! Montre-moi tes ongles, petite sorcière.');
  phrase.lang = 'fr-FR';
  if (voixChoisie) phrase.voice = voixChoisie;
  phrase.onerror = (evenement) => noter(5, resultats[5].concat('Erreur de lecture : ' + evenement.error));
  speechSynthesis.speak(phrase);
});

// 6. Caméra : aperçu seulement, aucune image n'est enregistrée ni envoyée.
let flux = null;

function arreterCamera() {
  if (flux) flux.getTracks().forEach((piste) => piste.stop());
  flux = null;
  $('apercu').srcObject = null;
  $('apercu').hidden = true;
  $('b-camera-stop').hidden = true;
}

async function essayerCamera(cote) {
  arreterCamera();
  const libelle = cote === 'environment' ? 'Caméra arrière' : 'Caméra avant';
  const lignes = resultats[6].filter((ligne) => !ligne.startsWith(libelle) && !ligne.startsWith('Caméras'));
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    noter(6, ['Caméra non prise en charge']);
    return;
  }
  try {
    flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cote }, audio: false });
    const reglages = flux.getVideoTracks()[0].getSettings();
    lignes.push(libelle + ' : OK, ' + reglages.width + ' x ' + reglages.height);
    $('apercu').srcObject = flux;
    $('apercu').hidden = false;
    $('b-camera-stop').hidden = false;
    await $('apercu').play();
    const appareils = await navigator.mediaDevices.enumerateDevices();
    lignes.push('Caméras détectées : ' + appareils.filter((a) => a.kind === 'videoinput').length);
  } catch (erreur) {
    lignes.push(libelle + ' : échec (' + erreur.name + ')');
  }
  noter(6, lignes);
}

$('b-camera-arriere').addEventListener('click', () => essayerCamera('environment'));
$('b-camera-avant').addEventListener('click', () => essayerCamera('user'));
$('b-camera-stop').addEventListener('click', arreterCamera);

// Compte rendu : cases à cocher et bouton de copie.
for (const id of ['c-hors-ligne', 'c-voix', 'c-voix-avion', 'c-camera']) {
  $(id).addEventListener('change', composerCompteRendu);
}

$('b-copier').addEventListener('click', async () => {
  composerCompteRendu();
  try {
    await navigator.clipboard.writeText($('texte').value);
  } catch (erreur) {
    $('texte').select();
    document.execCommand('copy');
  }
  $('copie-ok').hidden = false;
  setTimeout(() => { $('copie-ok').hidden = true; }, 3000);
});

window.addEventListener('online', () => testerInstallation());
window.addEventListener('offline', () => testerInstallation());

testerTelephone();
preparerHorsLigne();
testerStockage(false);
testerDonnees();
testerVoix();
