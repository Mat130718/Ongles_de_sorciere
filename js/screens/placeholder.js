// Ongles de sorcière - Écran provisoire, utilisé tant qu'un écran n'est pas construit.
// Il affiche le titre de l'écran, les boutons vers les écrans suivants et le retour à l'accueil.

export function renderPlaceholder(container, navigate, { title, next = [] }) {
  const heading = document.createElement('h1');
  heading.textContent = title;

  const note = document.createElement('p');
  note.className = 'note';
  note.textContent = 'Écran en construction.';

  const actions = document.createElement('div');
  actions.className = 'actions';
  for (const { label, screen } of next) {
    actions.append(button(label, () => navigate(screen)));
  }
  actions.append(button('Retour à l’accueil', () => navigate('home'), 'secondary'));

  container.append(heading, note, actions);
}

export function button(label, onClick, variant = 'primary') {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `button ${variant}`;
  element.textContent = label;
  element.addEventListener('click', onClick);
  return element;
}
