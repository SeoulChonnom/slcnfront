import { Navigate, Route, Routes } from 'react-router-dom';
import { DeviceRedirect } from '@/app/router/DeviceRedirect';
import { renderMainRoutes } from '@/app/router/main-routes';
import { renderMobileRoutes } from '@/app/router/mobile-routes';
import { buildDeviceNotFoundPath } from '@/lib/routing/route-builders';

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
