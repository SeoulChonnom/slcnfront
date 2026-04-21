import type { ReactNode } from 'react';
import type { DeviceType } from './route-constants';

export type DeviceShellKey = 'main' | 'detail';

export type RoutePageKey =
  | 'home'
  | 'tripList'
  | 'tripRegister'
  | 'tripDetail'
  | 'calendarMonth'
  | 'calendarWeek'
  | 'shoesCatalog'
  | 'shoeDetail';

export type DeviceProtectedRouteDefinition = {
  index?: true;
  path?: string;
  page: RoutePageKey;
  shell: DeviceShellKey;
};

export type BaseRouteDefinition = Omit<DeviceProtectedRouteDefinition, 'shell'>;

export const BASE_PROTECTED_ROUTES: BaseRouteDefinition[] = [
  { index: true, page: 'home' },
  { path: 'map', page: 'tripList' },
  { path: 'map/register', page: 'tripRegister' },
  { path: 'map/:date', page: 'tripDetail' },
  { path: 'calendar', page: 'calendarMonth' },
  { path: 'calendar/week', page: 'calendarWeek' },
  { path: 'shoesRecom', page: 'shoesCatalog' },
  { path: ':brand/:shoesName', page: 'shoeDetail' },
];

export function withShell(
  routes: BaseRouteDefinition[],
  shellOverrides: Partial<Record<RoutePageKey, DeviceShellKey>>,
  defaultShell: DeviceShellKey,
): DeviceProtectedRouteDefinition[] {
  return routes.map((route) => ({
    ...route,
    shell: shellOverrides[route.page] ?? defaultShell,
  }));
}

export type DeviceRouteConfig = {
  loginPath: string;
  rootPath: string;
  notFoundPath: string;
  loginElement: ReactNode;
  notFoundElement: ReactNode;
  protectedRoutes: DeviceProtectedRouteDefinition[];
};

export const PUBLIC_ENTRY_ROUTE_PATHS = [
  '/login',
  '/',
  '/map/register',
  '/map/:date',
  '/map',
  '/calendar/week',
  '/calendar',
  '/shoesRecom',
  '/:brand/:shoesName',
  '*',
] as const;

export function filterRoutesByShell(
  routes: DeviceProtectedRouteDefinition[],
  shell: DeviceShellKey,
) {
  return routes.filter((route) => route.shell === shell);
}

export function getRouteDefinitionKey(route: DeviceProtectedRouteDefinition) {
  return route.index ? `${route.page}:index` : `${route.page}:${route.path}`;
}

export function createDeviceRouteConfig(
  device: DeviceType,
  config: Omit<DeviceRouteConfig, 'protectedRoutes'> & {
    protectedRoutes: DeviceProtectedRouteDefinition[];
  },
) {
  return {
    device,
    ...config,
  };
}
