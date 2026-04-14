import { Navigate, Route } from 'react-router-dom';
import { MAIN_ROUTE_PATTERNS } from './route-constants';
import { RequireAuth } from './guards';
import { MainDesktopShell } from '../shells/MainDesktopShell';
import { PublicShell } from '../shells/PublicShell';
import { LoginPage } from '../../pages/shared/LoginPage';
import { NotFoundPage } from '../../pages/shared/NotFoundPage';
import { HomePage } from '../../pages/main/HomePage';
import { TripDetailPage } from '../../pages/main/TripDetailPage';
import { TripListPage } from '../../pages/main/TripListPage';
import { TripRegisterPage } from '../../pages/main/TripRegisterPage';
import { CalendarMonthPage } from '../../pages/main/CalendarMonthPage';
import { CalendarWeekPage } from '../../pages/main/CalendarWeekPage';
import { ShoeDetailPage } from '../../pages/main/ShoeDetailPage';
import { ShoesCatalogPage } from '../../pages/main/ShoesCatalogPage';

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
            element={<HomePage />}
          />
          <Route
            path="map"
            element={<TripListPage />}
          />
          <Route
            path="map/register"
            element={<TripRegisterPage />}
          />
          <Route
            path="map/:date"
            element={<TripDetailPage />}
          />
          <Route
            path="calendar"
            element={<CalendarMonthPage />}
          />
          <Route
            path="calendar/week"
            element={<CalendarWeekPage />}
          />
          <Route
            path="shoesRecom"
            element={<ShoesCatalogPage />}
          />
          <Route
            path=":brand/:shoesName"
            element={<ShoeDetailPage />}
          />
        </Route>
      </Route>
    </>
  );
}
