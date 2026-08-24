import { renderDeviceRoutes } from '@/app/router/render-device-routes';
import { MOBILE_ROUTE_PATTERNS } from '@/app/router/route-constants';
import {
  BASE_PROTECTED_ROUTES,
  createDeviceRouteConfig,
  withShell,
} from '@/app/router/route-manifest';
import { DetailMobileShell } from '@/app/shells/DetailMobileShell';
import { MainMobileShell } from '@/app/shells/MainMobileShell';
import { PublicShell } from '@/app/shells/PublicShell';
import { LoginPage } from '@/pages/shared/LoginPage';
import { NotFoundPage } from '@/pages/shared/NotFoundPage';

const mobileRouteConfig = createDeviceRouteConfig('mobile', {
  loginPath: MOBILE_ROUTE_PATTERNS.login,
  rootPath: MOBILE_ROUTE_PATTERNS.root,
  notFoundPath: MOBILE_ROUTE_PATTERNS.notFound,
  loginElement: (
    <PublicShell>
      <LoginPage device='mobile' />
    </PublicShell>
  ),
  notFoundElement: <NotFoundPage device='mobile' />,
  protectedRoutes: withShell(
    BASE_PROTECTED_ROUTES,
    {
      tripRegister: 'detail',
      tripDetail: 'detail',
      profile: 'detail',
      profileVerify: 'detail',
      profileEdit: 'detail',
      shoeDetail: 'detail',
    },
    'main'
  ),
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
