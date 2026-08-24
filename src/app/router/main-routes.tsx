import { renderDeviceRoutes } from '@/app/router/render-device-routes';
import { MAIN_ROUTE_PATTERNS } from '@/app/router/route-constants';
import {
  BASE_PROTECTED_ROUTES,
  createDeviceRouteConfig,
  withShell,
} from '@/app/router/route-manifest';
import { MainDesktopShell } from '@/app/shells/MainDesktopShell';
import { PublicShell } from '@/app/shells/PublicShell';
import { LoginPage } from '@/pages/shared/LoginPage';
import { NotFoundPage } from '@/pages/shared/NotFoundPage';

const mainRouteConfig = createDeviceRouteConfig('main', {
  loginPath: MAIN_ROUTE_PATTERNS.login,
  rootPath: MAIN_ROUTE_PATTERNS.root,
  notFoundPath: MAIN_ROUTE_PATTERNS.notFound,
  loginElement: (
    <PublicShell>
      <LoginPage device='main' />
    </PublicShell>
  ),
  notFoundElement: <NotFoundPage device='main' />,
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
