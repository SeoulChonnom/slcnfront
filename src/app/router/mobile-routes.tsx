import { MOBILE_ROUTE_PATTERNS } from './route-constants';
import { BASE_PROTECTED_ROUTES, createDeviceRouteConfig, withShell } from './route-manifest';
import { renderDeviceRoutes } from './render-device-routes';
import { DetailMobileShell } from '../shells/DetailMobileShell';
import { MainMobileShell } from '../shells/MainMobileShell';
import { PublicShell } from '../shells/PublicShell';
import { LoginPage } from '../../pages/shared/LoginPage';
import { NotFoundPage } from '../../pages/shared/NotFoundPage';

const mobileRouteConfig = createDeviceRouteConfig('mobile', {
  loginPath: MOBILE_ROUTE_PATTERNS.login,
  rootPath: MOBILE_ROUTE_PATTERNS.root,
  notFoundPath: MOBILE_ROUTE_PATTERNS.notFound,
  loginElement: (
    <PublicShell>
      <LoginPage device="mobile" />
    </PublicShell>
  ),
  notFoundElement: <NotFoundPage device="mobile" />,
  protectedRoutes: withShell(BASE_PROTECTED_ROUTES, {
    tripRegister: 'detail',
    tripDetail: 'detail',
    shoeDetail: 'detail',
  }, 'main'),
});

export function renderMobileRoutes() {
  return renderDeviceRoutes('mobile', mobileRouteConfig, [
    {
      key: 'main',
      element: <MainMobileShell />,
    },
    {
      key: 'detail',
      element: <DetailMobileShell />,
    },
  ]);
}
