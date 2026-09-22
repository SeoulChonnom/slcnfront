import type { ReactNode } from 'react';
import type { DeviceType } from '@/app/router/route-constants';
import type { Role } from '@/domains/auth/types';

export type DeviceShellKey = 'main' | 'detail';

export type RoutePageKey =
  | 'home'
  | 'tripList'
  | 'tripRegister'
  | 'tripDetail'
  | 'travelList'
  | 'travelRegister'
  | 'travelDetail'
  | 'travelEdit'
  | 'calendarMonth'
  | 'calendarWeek'
  | 'shoesCatalog'
  | 'profile'
  | 'profileVerify'
  | 'profileEdit'
  | 'shoeDetail'
  | 'inspectionAreaList'
  | 'inspectionAreaDetail'
  | 'inspectionPropertyDetail'
  | 'inspectionRegister'
  | 'inspectionVisitEdit'
  | 'inspectionPropertyEdit'
  | 'inspectionQuestions';

export type DeviceProtectedRouteDefinition = {
  index?: true;
  path?: string;
  page: RoutePageKey;
  shell: DeviceShellKey;
  requireRole?: Role;
};

export type BaseRouteDefinition = Omit<DeviceProtectedRouteDefinition, 'shell'>;

export const BASE_PROTECTED_ROUTES: BaseRouteDefinition[] = [
  { index: true, page: 'home' },
  { path: 'map', page: 'tripList' },
  { path: 'map/register', page: 'tripRegister' },
  { path: 'map/:id', page: 'tripDetail' },
  { path: 'travel', page: 'travelList' },
  { path: 'travel/register', page: 'travelRegister' },
  { path: 'travel/:id', page: 'travelDetail' },
  { path: 'travel/:id/edit', page: 'travelEdit' },
  { path: 'calendar', page: 'calendarMonth' },
  { path: 'calendar/week', page: 'calendarWeek' },
  { path: 'shoesRecom', page: 'shoesCatalog' },
  { path: 'profile', page: 'profile' },
  { path: 'profile/verify', page: 'profileVerify' },
  { path: 'profile/edit', page: 'profileEdit' },
  { path: 'inspection', page: 'inspectionAreaList' },
  { path: 'inspection/register', page: 'inspectionRegister' },
  {
    path: 'inspection/questions',
    page: 'inspectionQuestions',
    requireRole: 'admin',
  },
  { path: 'inspection/:areaId', page: 'inspectionAreaDetail' },
  {
    path: 'inspection/:areaId/property/:propertyId',
    page: 'inspectionPropertyDetail',
  },
  {
    path: 'inspection/:areaId/visit/:visitId/edit',
    page: 'inspectionVisitEdit',
  },
  {
    path: 'inspection/:areaId/visit/:visitId/property/:propertyId/edit',
    page: 'inspectionPropertyEdit',
  },
  { path: ':brand/:shoesName', page: 'shoeDetail' },
];

export function withShell(
  routes: BaseRouteDefinition[],
  shellOverrides: Partial<Record<RoutePageKey, DeviceShellKey>>,
  defaultShell: DeviceShellKey
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

export function filterRoutesByShell(
  routes: DeviceProtectedRouteDefinition[],
  shell: DeviceShellKey
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
  }
) {
  return {
    device,
    ...config,
  };
}
