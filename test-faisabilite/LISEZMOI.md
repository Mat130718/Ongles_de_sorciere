# Page de test de faisabilité

Version 1.0 du 26/10/2026.

Cette page vérifie, sur un vrai téléphone Android, ce dont l'application Ongle de sorcière aura besoin. Elle répond aux questions ouvertes QO-001 et QO-002 (modèle et versions), QO-017 (stockage durable) et QO-018 (voix française hors ligne).

## Ce qu'elle vérifie

1. **Le téléphone** : modèle, version d'Android, version de Chrome, taille de l'écran.
2. **Installation et hors ligne** : Chrome propose-t-il d'installer la page comme une application, et s'affiche-t-elle sans réseau ?
3. **Stockage durable** : Chrome promet-il de ne pas effacer les données quand le téléphone manque de place ?
4. **Données fictives** : écriture et relecture d'une journée inventée dans la base du téléphone, et compteur de visites pour vérifier que les données survivent à la fermeture.
5. **Voix française** : liste des voix françaises, en précisant celles qui sont sur le téléphone (utilisables sans réseau), et lecture d'une phrase.
6. **Caméra** : aperçu de la caméra arrière et de la caméra avant. Aucune image n'est enregistrée ni envoyée.

## Ce qu'elle ne fait pas

- Elle n'envoie rien : la politique de sécurité de la page (balise `Content-Security-Policy` de `index.html`) interdit tout appel vers un autre site.
- Elle n'utilise aucun composant tiers : quatre fichiers écrits à la main (`index.html`, `style.css`, `test.js`, `sw.js`), plus le manifeste et l'icône.
- Elle ne garde que les données fictives du test, dans le stockage de Chrome ; elles disparaissent quand on désinstalle la page de test.

## Déroulé sur le téléphone

1. Ouvrir dans Chrome : https://mat130718.github.io/Ongles_de_sorciere/test-faisabilite/
2. Attendre trois secondes que les sections se remplissent.
3. Appuyer sur « Installer l'application de test » (ou menu ⋮ de Chrome, puis « Ajouter à l'écran d'accueil » ou « Installer l'application »).
4. Fermer Chrome, ouvrir « Test sorcière » depuis l'écran d'accueil.
5. Appuyer sur « Demander le stockage durable ».
6. Appuyer sur « Écouter la sorcière » et cocher la case si la phrase est entendue en français.
7. Essayer les deux caméras, accepter l'autorisation, cocher la case si l'image apparaît, puis « Arrêter la caméra ».
8. Passer en mode avion, fermer l'application, la rouvrir : cocher la case si elle s'affiche ; refaire « Écouter la sorcière » et cocher la case correspondante.
9. Appuyer sur « Copier le compte rendu » et coller le texte dans le fil du projet (jamais dans le dépôt).
10. Quitter le mode avion. Une fois les deux téléphones testés, désinstaller « Test sorcière » (appui long sur l'icône, puis « Désinstaller »).
