import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import { LiquidGlassFilter } from '@/components/LiquidGlassFilter';

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
