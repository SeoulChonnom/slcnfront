import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { DEVICE_PREFIX } from './route-constants';
import {
  selectAuthPhase,
  useAuthStore,
} from '../../domains/auth/store/auth-store';
import { buildDeviceLoginPath } from '../../lib/routing/route-builders';

function resolveLoginPath(pathname: string) {
  return pathname.startsWith(DEVICE_PREFIX.mobile)
    ? buildDeviceLoginPath('mobile')
    : buildDeviceLoginPath('main');
}

export function RequireAuth() {
  const location = useLocation();
  const authPhase = useAuthStore(selectAuthPhase);

  if (authPhase === 'hydrating' || authPhase === 'restoring') {
    return (
      <div className="slcn-guard-pending" role="status" aria-live="polite">
        세션을 확인하고 있어요.
      </div>
    );
  }

  if (authPhase !== 'authenticated') {
    const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
    const searchParams = new URLSearchParams();

    searchParams.set('redirect', redirectTarget);

    return (
      <Navigate
        replace
        to={{
          pathname: resolveLoginPath(location.pathname),
          search: `?${searchParams.toString()}`,
        }}
      />
    );
  }

  return <Outlet />;
}
