import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LiquidGlassFilter } from '../components/LiquidGlassFilter';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router/AppRouter';

const browserRouter = createBrowserRouter([
  {
    path: '*',
    element: <AppRouter />,
  },
]);

export function AppRoot() {
  return (
    <AppProviders>
      <LiquidGlassFilter />
      <RouterProvider router={browserRouter} />
    </AppProviders>
  );
}
