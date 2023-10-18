import { createRoot } from 'react-dom/client';

import { Editor } from './components/Editor';

const tags = [
  { label: 'Prénom', id: 'firstName', defaultValue: 'Paul' },
  { label: 'Nom', id: 'lastName', defaultValue: 'Chavard' },
  { label: 'NUR', id: 'nur', defaultValue: '12345qwerty' },
];

const App = () => (
  <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
    <Editor tags={tags} />
  </div>
);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
