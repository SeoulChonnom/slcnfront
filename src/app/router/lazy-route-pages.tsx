import { lazy, Suspense, type ReactNode } from 'react';
import { RouteLoadingFallback } from '../../pages/shared/RouteLoadingFallback';

const MainHomePageLazy = lazy(() =>
  import('../../pages/main/HomePage').then((module) => ({
    default: module.HomePage,
  })),
);
const MainTripDetailPageLazy = lazy(() =>
  import('../../pages/main/TripDetailPage').then((module) => ({
    default: module.TripDetailPage,
  })),
);
const MainTripListPageLazy = lazy(() =>
  import('../../pages/main/TripListPage').then((module) => ({
    default: module.TripListPage,
  })),
);
const MainTripRegisterPageLazy = lazy(() =>
  import('../../pages/main/TripRegisterPage').then((module) => ({
    default: module.TripRegisterPage,
  })),
);
const MainCalendarMonthPageLazy = lazy(() =>
  import('../../pages/main/CalendarMonthPage').then((module) => ({
    default: module.CalendarMonthPage,
  })),
);
const MainCalendarWeekPageLazy = lazy(() =>
  import('../../pages/main/CalendarWeekPage').then((module) => ({
    default: module.CalendarWeekPage,
  })),
);
const MainShoeDetailPageLazy = lazy(() =>
  import('../../pages/main/ShoeDetailPage').then((module) => ({
    default: module.ShoeDetailPage,
  })),
);
const MainShoesCatalogPageLazy = lazy(() =>
  import('../../pages/main/ShoesCatalogPage').then((module) => ({
    default: module.ShoesCatalogPage,
  })),
);

const MobileHomePageLazy = lazy(() =>
  import('../../pages/mobile/HomePage').then((module) => ({
    default: module.HomePage,
  })),
);
const MobileTripDetailPageLazy = lazy(() =>
  import('../../pages/mobile/TripDetailPage').then((module) => ({
    default: module.TripDetailPage,
  })),
);
const MobileTripListPageLazy = lazy(() =>
  import('../../pages/mobile/TripListPage').then((module) => ({
    default: module.TripListPage,
  })),
);
const MobileTripRegisterPageLazy = lazy(() =>
  import('../../pages/mobile/TripRegisterPage').then((module) => ({
    default: module.TripRegisterPage,
  })),
);
const MobileCalendarMonthPageLazy = lazy(() =>
  import('../../pages/mobile/CalendarMonthPage').then((module) => ({
    default: module.CalendarMonthPage,
  })),
);
const MobileCalendarWeekPageLazy = lazy(() =>
  import('../../pages/mobile/CalendarWeekPage').then((module) => ({
    default: module.CalendarWeekPage,
  })),
);
const MobileShoeDetailPageLazy = lazy(() =>
  import('../../pages/mobile/ShoeDetailPage').then((module) => ({
    default: module.ShoeDetailPage,
  })),
);
const MobileShoesCatalogPageLazy = lazy(() =>
  import('../../pages/mobile/ShoesCatalogPage').then((module) => ({
    default: module.ShoesCatalogPage,
  })),
);

type LazyRouteWrapperProps = {
  children: ReactNode;
};

function LazyRouteWrapper({ children }: LazyRouteWrapperProps) {
  return <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>;
}

export function MainHomeRoutePage() {
  return (
    <LazyRouteWrapper>
      <MainHomePageLazy />
    </LazyRouteWrapper>
  );
}

export function MainTripDetailRoutePage() {
  return (
    <LazyRouteWrapper>
      <MainTripDetailPageLazy />
    </LazyRouteWrapper>
  );
}

export function MainTripListRoutePage() {
  return (
    <LazyRouteWrapper>
      <MainTripListPageLazy />
    </LazyRouteWrapper>
  );
}

export function MainTripRegisterRoutePage() {
  return (
    <LazyRouteWrapper>
      <MainTripRegisterPageLazy />
    </LazyRouteWrapper>
  );
}

export function MainCalendarMonthRoutePage() {
  return (
    <LazyRouteWrapper>
      <MainCalendarMonthPageLazy />
    </LazyRouteWrapper>
  );
}

export function MainCalendarWeekRoutePage() {
  return (
    <LazyRouteWrapper>
      <MainCalendarWeekPageLazy />
    </LazyRouteWrapper>
  );
}

export function MainShoeDetailRoutePage() {
  return (
    <LazyRouteWrapper>
      <MainShoeDetailPageLazy />
    </LazyRouteWrapper>
  );
}

export function MainShoesCatalogRoutePage() {
  return (
    <LazyRouteWrapper>
      <MainShoesCatalogPageLazy />
    </LazyRouteWrapper>
  );
}

export function MobileHomeRoutePage() {
  return (
    <LazyRouteWrapper>
      <MobileHomePageLazy />
    </LazyRouteWrapper>
  );
}

export function MobileTripDetailRoutePage() {
  return (
    <LazyRouteWrapper>
      <MobileTripDetailPageLazy />
    </LazyRouteWrapper>
  );
}

export function MobileTripListRoutePage() {
  return (
    <LazyRouteWrapper>
      <MobileTripListPageLazy />
    </LazyRouteWrapper>
  );
}

export function MobileTripRegisterRoutePage() {
  return (
    <LazyRouteWrapper>
      <MobileTripRegisterPageLazy />
    </LazyRouteWrapper>
  );
}

export function MobileCalendarMonthRoutePage() {
  return (
    <LazyRouteWrapper>
      <MobileCalendarMonthPageLazy />
    </LazyRouteWrapper>
  );
}

export function MobileCalendarWeekRoutePage() {
  return (
    <LazyRouteWrapper>
      <MobileCalendarWeekPageLazy />
    </LazyRouteWrapper>
  );
}

export function MobileShoeDetailRoutePage() {
  return (
    <LazyRouteWrapper>
      <MobileShoeDetailPageLazy />
    </LazyRouteWrapper>
  );
}

export function MobileShoesCatalogRoutePage() {
  return (
    <LazyRouteWrapper>
      <MobileShoesCatalogPageLazy />
    </LazyRouteWrapper>
  );
}
