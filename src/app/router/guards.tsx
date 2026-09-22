import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { DEVICE_PREFIX } from '@/app/router/route-constants';
import { selectAuthPhase, useAuthStore } from '@/domains/auth/store/auth-store';
import type { Role } from '@/domains/auth/types';
import { buildDeviceLoginPath } from '@/lib/routing/route-builders';

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
      <div className='slcn-guard-pending' role='status' aria-live='polite'>
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

type RequireRoleProps = {
  role: Role;
  fallbackPath: string;
  children: ReactNode;
};

// Module-level so it's referentially stable across selector calls. Zustand's
// `useSyncExternalStore` compares consecutive `getSnapshot()` results with
// `Object.is`; a `?? []` written inline in the selector below would
// construct a brand-new array every call, so once `userInfo` is `null` the
// selector "changes" on every single re-render check and React never stops
// re-rendering ("Maximum update depth exceeded").
const EMPTY_ROLE_LIST: Role[] = [];

/**
 * Wraps a single route element (not an `Outlet`-based layer) because
 * protected routes already render flat under one `<Route element={<RequireAuth
 * />}>` in `render-device-routes.tsx` — stacking another `Outlet` guard would
 * need a second nesting level that doesn't exist. See
 * fe_implementation_decisions.md §2.
 *
 * Renders directly under `RequireAuth`, so a user always has a session by the
 * time this runs — missing the role is a genuine permission gap, not an auth
 * gap, so it goes to 404 rather than the login screen (a login redirect here
 * would make an authenticated user suspect their account is broken).
 */
export function RequireRole({
  role,
  fallbackPath,
  children,
}: RequireRoleProps) {
  const roleList = useAuthStore(
    (state) => state.userInfo?.roleList ?? EMPTY_ROLE_LIST
  );

  if (!roleList.includes(role)) {
    return <Navigate replace to={fallbackPath} />;
  }

  return <>{children}</>;
}
