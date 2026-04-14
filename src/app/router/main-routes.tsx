import { Navigate, Route } from 'react-router-dom';
import { MAIN_ROUTE_PATTERNS } from './route-constants';
import { RequireAuth } from './guards';
import { MainDesktopShell } from '../shells/MainDesktopShell';
import { PublicShell } from '../shells/PublicShell';
import { LoginPage } from '../../pages/shared/LoginPage';
import { NotFoundPage } from '../../pages/shared/NotFoundPage';
import {
  MainCalendarMonthRoutePage,
  MainCalendarWeekRoutePage,
  MainHomeRoutePage,
  MainShoeDetailRoutePage,
  MainShoesCatalogRoutePage,
  MainTripDetailRoutePage,
  MainTripListRoutePage,
  MainTripRegisterRoutePage,
} from './lazy-route-pages';

export function renderMainRoutes() {
  return (
    <>
      <Route
        path={MAIN_ROUTE_PATTERNS.login}
        element={
          <PublicShell>
            <LoginPage device="main" />
          </PublicShell>
        }
      />
      <Route path={MAIN_ROUTE_PATTERNS.root} element={<MainDesktopShell />}>
        <Route path="404" element={<NotFoundPage device="main" />} />
        <Route
          path="*"
          element={<Navigate replace to={MAIN_ROUTE_PATTERNS.notFound} />}
        />
        <Route element={<RequireAuth />}>
          <Route
            index
            element={<MainHomeRoutePage />}
          />
          <Route
            path="map"
            element={<MainTripListRoutePage />}
          />
          <Route
            path="map/register"
            element={<MainTripRegisterRoutePage />}
          />
          <Route
            path="map/:date"
            element={<MainTripDetailRoutePage />}
          />
          <Route
            path="calendar"
            element={<MainCalendarMonthRoutePage />}
          />
          <Route
            path="calendar/week"
            element={<MainCalendarWeekRoutePage />}
          />
          <Route
            path="shoesRecom"
            element={<MainShoesCatalogRoutePage />}
          />
          <Route
            path=":brand/:shoesName"
            element={<MainShoeDetailRoutePage />}
          />
        </Route>
      </Route>
    </>
  );
}
