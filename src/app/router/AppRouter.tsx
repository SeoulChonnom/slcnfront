import { Navigate, Route, Routes } from 'react-router-dom';
import { buildDeviceNotFoundPath } from '../../lib/routing/route-builders';
import { renderMainRoutes } from './main-routes';
import { renderMobileRoutes } from './mobile-routes';

export function AppRouter() {
  return (
    <Routes>
      {renderMainRoutes()}
      {renderMobileRoutes()}
      <Route
        path='*'
        element={<Navigate replace to={buildDeviceNotFoundPath('main')} />}
      />
    </Routes>
  );
}
