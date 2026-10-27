# Ongles de sorcière

Application web installable (PWA) qui aide un enfant à ne plus se ronger les ongles, sous la forme d'un petit jeu du soir : une main de sorcière dont les ongles poussent chaque jour où les vrais ongles sont préservés.

## Principes

- **Gratuite et sans compte** : publiée sur GitHub Pages, installée depuis Chrome sur l'écran d'accueil d'un téléphone Android.
- **Entièrement locale** : toutes les données et les photos restent sur le téléphone. Aucun serveur, aucun envoi, aucune statistique.
- **Hors ligne** : une fois installée, l'application fonctionne sans connexion.
- **Sans composant tiers** : HTML, CSS et JavaScript écrits à la main, publiés tels quels, sans étape de fabrication. Les ongles, leurs effets et les sons sont fabriqués par programme.
- **Bienveillante** : un ongle rongé donne un crapaud rigolo, jamais une punition.

## État du projet

Cadrage, documents de référence, test de faisabilité et conception terminés. Le développement du palier 1 est en cours, lot par lot : le squelette de l'application est en place, ses écrans sont encore vides.

## Règle du dépôt

Ce dépôt est public. Il ne contient **aucune donnée personnelle** : ni prénom, ni photo, ni enregistrement de voix, ni document familial. Le fichier `.gitignore` bloque les photos, les fichiers audio et vidéo, les PDF, les e-mails, les tableurs, les documents bureautiques et les fichiers de sauvegarde de l'application. Les documents de pilotage du projet sont tenus hors du dépôt.

## Organisation du dépôt

| Fichier ou dossier | Rôle |
| --- | --- |
| `index.html` | La page unique de l'application |
| `manifest.webmanifest` | Nom, icône et couleurs pour l'installation sur l'écran d'accueil |
| `sw.js` | Service worker : garde tous les fichiers sur le téléphone pour le fonctionnement hors ligne |
| `css/` | Styles |
| `js/` | Code de l'application ; `js/screens/` contient un fichier par écran |
| `img/` | Images et icônes |
| `tests/` | Tests automatiques |
| `test-faisabilite/` | La page de test de faisabilité, gardée pour mémoire (voir son `LISEZMOI.md`) |

Les fichiers sont publiés tels quels par GitHub Pages, sans étape de fabrication.

## Lancer les tests

Avec Node.js installé, à la racine du dépôt :

```
npm test
```

Les tests utilisent l'outil de test intégré à Node.js. Le fichier `package.json` ne déclare aucune dépendance.
