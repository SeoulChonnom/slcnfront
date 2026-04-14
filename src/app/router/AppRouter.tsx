import { Routes } from 'react-router-dom';
import { renderMainRoutes } from './main-routes';
import { renderMobileRoutes } from './mobile-routes';
import { renderPublicEntryRoutes } from './public-entry-routes';

export function AppRouter() {
  return (
    <Routes>
      {renderPublicEntryRoutes()}
      {renderMainRoutes()}
      {renderMobileRoutes()}
    </Routes>
  );
}
