import { Navigate, Route, Routes } from 'react-router-dom';
import { buildDeviceNotFoundPath } from '../../lib/routing/route-builders';
import { DeviceRedirect } from './DeviceRedirect';
import { renderMainRoutes } from './main-routes';
import { renderMobileRoutes } from './mobile-routes';

export function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<DeviceRedirect />} />
      {renderMainRoutes()}
      {renderMobileRoutes()}
      <Route
        path='*'
        element={<Navigate replace to={buildDeviceNotFoundPath('main')} />}
      />
    </Routes>
  );
}
