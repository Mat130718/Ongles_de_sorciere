# Conventions du projet pour Claude

Ce fichier rassemble les règles de travail du projet, pour qu'une nouvelle session de Claude, locale ou dans le cloud, reparte sans redemander ce qui est déjà tranché. Il ne contient aucune donnée personnelle.

## Où sont les références

- Les douze documents de référence (Doc#1 à Doc#12) sont des Claude Docs, hors du dépôt. Leur index est donné par le projet Claude, pas par ce dépôt.
- Avant toute nouvelle décision, relire Doc#4 (registre des décisions) et Doc#12 (questions ouvertes).
- Un seul fil du projet, « Documents de référence », écrit dans les documents (DEC-032). Les autres fils lui envoient leurs demandes de modification.
- Les identifiants ne sont jamais réutilisés : le dernier numéro utilisé figure en tête de chaque registre.

## Méthode

- Méthode de projet : skill `methode-projet-developpement`.
- Échanges en français, au tutoiement. Les questions sont fermées et numérotées, avec une recommandation marquée. Elles sont posées sur des cartes de choix cliquables, une carte par question, dès que l'outil le permet (DEC-114).
- Aucune décision silencieuse : tout choix qui engage le projet est soumis à Mat, puis inscrit dans Doc#4.
- Déroulé en neuf étapes, décrit dans Doc#1. Les étapes 0 (cadrage), 1 (documents de référence), 2 (test de faisabilité) et 3 (conception du palier 1, close le 27/10/2026 par DEC-113) sont closes. L'étape 4, développement du palier 1, est en cours.

## Règles du dépôt

- Dépôt public, sans aucune donnée personnelle : ni prénom, ni photo, ni voix, ni document familial (DEC-029). GitHub Pages gratuit exige un dépôt public (réponse à QO-016).
- Aucun composant tiers, ni dans l'application ni pour la fabriquer : HTML, CSS et JavaScript écrits à la main, publiés tels quels (DEC-038, précisée par DEC-091).
- Les mains, la sorcière et les symboles du calendrier sont des images produites par une IA de dessin choisie par Mat, qui s'assure du droit d'usage. Claude rédige les consignes de dessin, sans aucune donnée personnelle, puis retire le fond des images et les allège (WebP transparent). Le programme dessine les ongles, les effets et les animations, et fabrique les sons (DEC-091, remplace DEC-039).
- Les deux mains sont croisées en diagonale sur un seul écran, sans texte ; un balayage agrandit l'une ou l'autre (DEC-092).
- Tests automatiques des règles de points avec l'outil de test intégré à Node.js.
- Chaque ajout passe par une branche et une pull request. Claude ouvre la pull request, l'assigne à Mat et lui en donne le lien ; Mat la relit et la fusionne (DEC-070, remplace DEC-068).

## Étape 2, test de faisabilité

- Page de test autonome dans `test-faisabilite/`, publiée par GitHub Pages depuis `main` (DEC-065, DEC-067).
- Le compte rendu s'affiche à l'écran ; Mat le colle dans le fil de l'étape 2, jamais dans le dépôt (DEC-066).
- Test d'abord sur le téléphone de Mat, puis sur le téléphone cible, puis désinstallation (DEC-069).
- Étape close le 26/10/2026 (DEC-072) : tous les essais sont réussis sur les deux téléphones, sauf le partage direct d'un fichier, écarté par DEC-071. Les résultats sont dans Doc#5 et Doc#12, et la page reste dans le dépôt pour mémoire.
