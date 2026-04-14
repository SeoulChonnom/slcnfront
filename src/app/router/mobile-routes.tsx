import { Navigate, Route } from 'react-router-dom';
import { MOBILE_ROUTE_PATTERNS } from './route-constants';
import { RequireAuth } from './guards';
import { DetailMobileShell } from '../shells/DetailMobileShell';
import { MainMobileShell } from '../shells/MainMobileShell';
import { PublicShell } from '../shells/PublicShell';
import { LoginPage } from '../../pages/shared/LoginPage';
import { NotFoundPage } from '../../pages/shared/NotFoundPage';
import {
  MobileCalendarMonthRoutePage,
  MobileCalendarWeekRoutePage,
  MobileHomeRoutePage,
  MobileShoeDetailRoutePage,
  MobileShoesCatalogRoutePage,
  MobileTripDetailRoutePage,
  MobileTripListRoutePage,
  MobileTripRegisterRoutePage,
} from './lazy-route-pages';

export function renderMobileRoutes() {
  return (
    <>
      <Route
        path={MOBILE_ROUTE_PATTERNS.login}
        element={
          <PublicShell>
            <LoginPage device="mobile" />
          </PublicShell>
        }
      />
      <Route path={MOBILE_ROUTE_PATTERNS.root} element={<MainMobileShell />}>
        <Route path="404" element={<NotFoundPage device="mobile" />} />
        <Route
          path="*"
          element={<Navigate replace to={MOBILE_ROUTE_PATTERNS.notFound} />}
        />
        <Route element={<RequireAuth />}>
          <Route
            index
            element={<MobileHomeRoutePage />}
          />
          <Route
            path="map"
            element={<MobileTripListRoutePage />}
          />
          <Route
            path="calendar"
            element={<MobileCalendarMonthRoutePage />}
          />
          <Route
            path="calendar/week"
            element={<MobileCalendarWeekRoutePage />}
          />
          <Route
            path="shoesRecom"
            element={<MobileShoesCatalogRoutePage />}
          />
        </Route>
      </Route>
      <Route path={MOBILE_ROUTE_PATTERNS.root} element={<DetailMobileShell />}>
        <Route
          path="*"
          element={<Navigate replace to={MOBILE_ROUTE_PATTERNS.notFound} />}
        />
        <Route element={<RequireAuth />}>
          <Route
            path="map/register"
            element={<MobileTripRegisterRoutePage />}
          />
          <Route
            path="map/:date"
            element={<MobileTripDetailRoutePage />}
          />
          <Route
            path=":brand/:shoesName"
            element={<MobileShoeDetailRoutePage />}
          />
        </Route>
      </Route>
    </>
  );
}
