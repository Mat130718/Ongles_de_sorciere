# Ongles de sorcière

Application web installable (PWA) qui aide un enfant à ne plus se ronger les ongles, sous la forme d'un petit jeu du soir : une main de sorcière dont les ongles poussent chaque jour où les vrais ongles sont préservés.

## Principes

- **Gratuite et sans compte** : publiée sur GitHub Pages, installée depuis Chrome sur l'écran d'accueil d'un téléphone Android.
- **Entièrement locale** : toutes les données et les photos restent sur le téléphone. Aucun serveur, aucun envoi, aucune statistique.
- **Hors ligne** : une fois installée, l'application fonctionne sans connexion.
- **Sans composant tiers** : HTML, CSS et JavaScript écrits à la main, publiés tels quels, sans étape de fabrication.
- **Bienveillante** : un ongle rongé donne un crapaud rigolo, jamais une punition.

## État du projet

Cadrage, documents de référence et test de faisabilité terminés ; conception du palier 1 en cours. Le développement n'a pas commencé.

## Règle du dépôt

Ce dépôt est public. Il ne contient **aucune donnée personnelle** : ni prénom, ni photo, ni enregistrement de voix, ni document familial. Le fichier `.gitignore` bloque les photos, les fichiers audio et vidéo, les PDF, les e-mails, les tableurs, les documents bureautiques et les fichiers de sauvegarde de l'application. Les documents de pilotage du projet sont tenus hors du dépôt.

## Organisation prévue

Le contenu sera ajouté au fil des étapes, chaque fois par une pull request relue :

- la page de test de faisabilité, à ouvrir sur le téléphone cible (dossier `test-faisabilite`, voir son `LISEZMOI.md`) ;
- l'application elle-même ;
- les tests automatiques des règles de points, lancés avec l'outil de test intégré à Node.js.
