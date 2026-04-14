import { Route } from 'react-router-dom';
import { PUBLIC_ROUTE_PATTERNS } from './route-constants';
import { LoginEntryPage } from '../../pages/public/LoginEntryPage';
import { RouteEntryPage } from '../../pages/public/RouteEntryPage';

export function renderPublicEntryRoutes() {
  return (
    <>
      <Route path={PUBLIC_ROUTE_PATTERNS.login} element={<LoginEntryPage />} />
      <Route path={PUBLIC_ROUTE_PATTERNS.root} element={<RouteEntryPage />} />
      <Route
        path={PUBLIC_ROUTE_PATTERNS.tripRegister}
        element={<RouteEntryPage />}
      />
      <Route
        path={PUBLIC_ROUTE_PATTERNS.tripDetail}
        element={<RouteEntryPage />}
      />
      <Route
        path={PUBLIC_ROUTE_PATTERNS.tripList}
        element={<RouteEntryPage />}
      />
      <Route
        path={PUBLIC_ROUTE_PATTERNS.calendarWeek}
        element={<RouteEntryPage />}
      />
      <Route
        path={PUBLIC_ROUTE_PATTERNS.calendarMonth}
        element={<RouteEntryPage />}
      />
      <Route
        path={PUBLIC_ROUTE_PATTERNS.shoesCatalog}
        element={<RouteEntryPage />}
      />
      <Route
        path={PUBLIC_ROUTE_PATTERNS.shoeDetail}
        element={<RouteEntryPage />}
      />
      <Route
        path={PUBLIC_ROUTE_PATTERNS.notFound}
        element={<RouteEntryPage />}
      />
    </>
  );
}
