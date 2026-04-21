import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoot } from './app/AppRoot';
import './styles/globals.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container was not found.');
}

createRoot(container).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
