import { MAIN_ROUTE_PATTERNS } from './route-constants';
import {
  BASE_PROTECTED_ROUTES,
  createDeviceRouteConfig,
  withShell,
} from './route-manifest';
import { renderDeviceRoutes } from './render-device-routes';
import { MainDesktopShell } from '../shells/MainDesktopShell';
import { PublicShell } from '../shells/PublicShell';
import { LoginPage } from '../../pages/shared/LoginPage';
import { NotFoundPage } from '../../pages/shared/NotFoundPage';

const mainRouteConfig = createDeviceRouteConfig('main', {
  loginPath: MAIN_ROUTE_PATTERNS.login,
  rootPath: MAIN_ROUTE_PATTERNS.root,
  notFoundPath: MAIN_ROUTE_PATTERNS.notFound,
  loginElement: (
    <PublicShell>
      <LoginPage device="main" />
    </PublicShell>
  ),
  notFoundElement: <NotFoundPage device="main" />,
  protectedRoutes: withShell(BASE_PROTECTED_ROUTES, {}, 'main'),
});

export function renderMainRoutes() {
  return renderDeviceRoutes('main', mainRouteConfig, [
    {
      key: 'main',
      element: <MainDesktopShell />,
    },
  ]);
}
