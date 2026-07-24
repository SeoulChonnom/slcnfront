import { BrowserRouter } from 'react-router-dom';
import { LiquidGlassFilter } from '../components/LiquidGlassFilter';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router/AppRouter';

export function AppRoot() {
  return (
    <AppProviders>
      <LiquidGlassFilter />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  );
}
