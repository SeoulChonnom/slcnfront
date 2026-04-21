import { Route } from 'react-router-dom';
import { PUBLIC_ENTRY_ROUTE_PATHS } from './route-manifest';
import { RouteEntryPage } from '../../pages/public/RouteEntryPage';

export function renderPublicEntryRoutes() {
  return (
    <>
      {PUBLIC_ENTRY_ROUTE_PATHS.map((path) => (
        <Route key={path} path={path} element={<RouteEntryPage />} />
      ))}
    </>
  );
}
