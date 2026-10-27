// Ongles de sorcière - Tests du fonctionnement hors ligne et de l'absence de flux externe.
// Lancement, à la racine du dépôt : npm test, ou node --test "tests/*.test.js".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

// Fichiers publiés de l'application : les fichiers de la racine et les dossiers css, fonts, img et js.
function appFiles() {
  const files = ['index.html', 'manifest.webmanifest'];
  const walk = (dir) => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else files.push(relative(root, join(root, path)).split('\\').join('/'));
    }
  };
  ['css', 'fonts', 'img', 'js'].forEach(walk);
  return files.sort();
}

// Liste FILES du service worker, lue dans sw.js sans l'exécuter.
function cachedFiles() {
  const source = readFileSync(join(root, 'sw.js'), 'utf8');
  const list = source.match(/const FILES = \[([\s\S]*?)\];/)[1];
  return [...list.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

test('EX-042 : le service worker garde en cache tous les fichiers de l\u2019application', () => {
  const cached = cachedFiles();
  for (const file of appFiles()) {
    assert.ok(cached.includes(file), `${file} manque dans la liste FILES de sw.js`);
  }
});

test('EX-042 : chaque fichier listé par le service worker existe', () => {
  for (const file of cachedFiles()) {
    if (file === './') continue;
    assert.ok(existsSync(join(root, file)), `${file} est listé dans sw.js mais n'existe pas`);
  }
});

test('EX-043 : aucun fichier de l\u2019application n\u2019appelle une adresse extérieure', () => {
  // Seules exceptions : l'espace de noms des dessins SVG, qui n'est pas un appel réseau.
  const allowed = ['http://www.w3.org/2000/svg'];
  // Seuls les fichiers de code sont lus : les images et les polices sont des fichiers binaires,
  // et le texte des licences des polices cite des adresses sans jamais les appeler.
  const code = /\.(html|css|js|svg|webmanifest)$/;
  for (const file of [...appFiles(), 'sw.js'].filter((name) => code.test(name))) {
    const source = readFileSync(join(root, file), 'utf8');
    const urls = source.match(/(https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}[^\s'"`)]*/gi) ?? [];
    const external = urls.filter((url) => !allowed.includes(url));
    assert.deepEqual(external, [], `${file} contient une adresse extérieure`);
  }
});
