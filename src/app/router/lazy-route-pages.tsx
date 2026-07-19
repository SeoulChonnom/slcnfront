import { type ComponentType, lazy, type ReactElement, Suspense } from 'react';
import { RouteLoadingFallback } from '../../pages/shared/RouteLoadingFallback';
import type { DeviceType } from './route-constants';
import type { RoutePageKey } from './route-manifest';

type PageModule = {
  default: ComponentType;
};

type PageLoader = () => Promise<PageModule>;

const PAGE_LOADERS = {
  main: {
    home: () =>
      import('../../pages/main/HomePage').then((module) => ({
        default: module.HomePage,
      })),
    tripList: () =>
      import('../../pages/main/TripListPage').then((module) => ({
        default: module.TripListPage,
      })),
    tripRegister: () =>
      import('../../pages/main/TripRegisterPage').then((module) => ({
        default: module.TripRegisterPage,
      })),
    tripDetail: () =>
      import('../../pages/main/TripDetailPage').then((module) => ({
        default: module.TripDetailPage,
      })),
    travelList: () =>
      import('../../pages/main/TravelListPage').then((module) => ({
        default: module.TravelListPage,
      })),
    travelRegister: () =>
      import('../../pages/main/TravelRegisterPage').then((module) => ({
        default: module.TravelRegisterPage,
      })),
    travelDetail: () =>
      import('../../pages/main/TravelDetailPage').then((module) => ({
        default: module.TravelDetailPage,
      })),
    travelEdit: () =>
      import('../../pages/main/TravelEditPage').then((module) => ({
        default: module.TravelEditPage,
      })),
    calendarMonth: () =>
      import('../../pages/main/CalendarMonthPage').then((module) => ({
        default: module.CalendarMonthPage,
      })),
    calendarWeek: () =>
      import('../../pages/main/CalendarWeekPage').then((module) => ({
        default: module.CalendarWeekPage,
      })),
    shoesCatalog: () =>
      import('../../pages/main/ShoesCatalogPage').then((module) => ({
        default: module.ShoesCatalogPage,
      })),
    shoeDetail: () =>
      import('../../pages/main/ShoeDetailPage').then((module) => ({
        default: module.ShoeDetailPage,
      })),
  },
  mobile: {
    home: () =>
      import('../../pages/mobile/HomePage').then((module) => ({
        default: module.HomePage,
      })),
    tripList: () =>
      import('../../pages/mobile/TripListPage').then((module) => ({
        default: module.TripListPage,
      })),
    tripRegister: () =>
      import('../../pages/mobile/TripRegisterPage').then((module) => ({
        default: module.TripRegisterPage,
      })),
    tripDetail: () =>
      import('../../pages/mobile/TripDetailPage').then((module) => ({
        default: module.TripDetailPage,
      })),
    travelList: () =>
      import('../../pages/mobile/TravelListPage').then((module) => ({
        default: module.TravelListPage,
      })),
    travelRegister: () =>
      import('../../pages/mobile/TravelRegisterPage').then((module) => ({
        default: module.TravelRegisterPage,
      })),
    travelDetail: () =>
      import('../../pages/mobile/TravelDetailPage').then((module) => ({
        default: module.TravelDetailPage,
      })),
    travelEdit: () =>
      import('../../pages/mobile/TravelEditPage').then((module) => ({
        default: module.TravelEditPage,
      })),
    calendarMonth: () =>
      import('../../pages/mobile/CalendarMonthPage').then((module) => ({
        default: module.CalendarMonthPage,
      })),
    calendarWeek: () =>
      import('../../pages/mobile/CalendarWeekPage').then((module) => ({
        default: module.CalendarWeekPage,
      })),
    shoesCatalog: () =>
      import('../../pages/mobile/ShoesCatalogPage').then((module) => ({
        default: module.ShoesCatalogPage,
      })),
    shoeDetail: () =>
      import('../../pages/mobile/ShoeDetailPage').then((module) => ({
        default: module.ShoeDetailPage,
      })),
  },
} satisfies Record<DeviceType, Record<RoutePageKey, PageLoader>>;

const lazyPageCache = new Map<string, ReturnType<typeof lazy<ComponentType>>>();

function getLazyRoutePage(device: DeviceType, page: RoutePageKey) {
  const cacheKey = `${device}:${page}`;
  const cachedPage = lazyPageCache.get(cacheKey);

  if (cachedPage) {
    return cachedPage;
  }

  const lazyPage = lazy(PAGE_LOADERS[device][page]);
  lazyPageCache.set(cacheKey, lazyPage);

  return lazyPage;
}

export function renderLazyRoutePage(
  device: DeviceType,
  page: RoutePageKey
): ReactElement {
  const RoutePage = getLazyRoutePage(device, page);

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <RoutePage />
    </Suspense>
  );
}
