import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  selectAuthPhase,
  useAuthStore,
} from '../../domains/auth/store/auth-store';
import { buildPublicLoginPath } from '../../lib/routing/route-builders';

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
          pathname: buildPublicLoginPath(),
          search: `?${searchParams.toString()}`,
        }}
      />
    );
  }

  return <Outlet />;
}
