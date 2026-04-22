import { Navigate, Route, Routes } from 'react-router-dom';
import { renderMainRoutes } from './main-routes';
import { renderMobileRoutes } from './mobile-routes';
import { buildDeviceNotFoundPath } from '../../lib/routing/route-builders';

export function AppRouter() {
  return (
    <Routes>
      {renderMainRoutes()}
      {renderMobileRoutes()}
      <Route
        path="*"
        element={<Navigate replace to={buildDeviceNotFoundPath('main')} />}
      />
    </Routes>
  );
}
