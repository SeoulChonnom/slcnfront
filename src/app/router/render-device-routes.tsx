import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { RequireAuth } from '@/app/router/guards';
import { renderLazyRoutePage } from '@/app/router/lazy-route-pages';
import type { DeviceType } from '@/app/router/route-constants';
import {
  type DeviceRouteConfig,
  type DeviceShellKey,
  filterRoutesByShell,
  getRouteDefinitionKey,
} from '@/app/router/route-manifest';

type ShellDefinition = {
  key: DeviceShellKey;
  element: ReactNode;
};

function renderProtectedRoutes(
  device: DeviceType,
  routeConfig: DeviceRouteConfig,
  shell: DeviceShellKey
) {
  return filterRoutesByShell(routeConfig.protectedRoutes, shell).map(
    (route) => (
      <Route
        key={getRouteDefinitionKey(route)}
        index={route.index}
        path={route.path}
        element={renderLazyRoutePage(device, route.page)}
      />
    )
  );
}

export function renderDeviceRoutes(
  device: DeviceType,
  routeConfig: DeviceRouteConfig,
  shells: ShellDefinition[]
): ReactElement {
  return (
    <Fragment key={device}>
      <Route path={routeConfig.loginPath} element={routeConfig.loginElement} />
      {shells.map((shell) => (
        <Route
          key={`${device}:${shell.key}`}
          path={routeConfig.rootPath}
          element={shell.element}
        >
          {shell.key === 'main' ? (
            <>
              <Route path='404' element={routeConfig.notFoundElement} />
              <Route
                path='*'
                element={<Navigate replace to={routeConfig.notFoundPath} />}
              />
            </>
          ) : (
            <Route
              path='*'
              element={<Navigate replace to={routeConfig.notFoundPath} />}
            />
          )}
          <Route element={<RequireAuth />}>
            {renderProtectedRoutes(device, routeConfig, shell.key)}
          </Route>
        </Route>
      ))}
    </Fragment>
  );
}
