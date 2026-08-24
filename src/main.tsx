// Per-weight dynamic subsets: the browser fetches only the Hangul ranges a
// page actually renders. Only the two weights the type ramp uses are loaded.
import 'pretendard/dist/web/static/Pretendard-Regular.css';
import 'pretendard/dist/web/static/Pretendard-SemiBold.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoot } from '@/app/AppRoot';
import '@/styles/globals.css';
import '@/styles/travel-list.css';
import '@/styles/travel-detail.css';
import '@/styles/travel-register.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container was not found.');
}

createRoot(container).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
