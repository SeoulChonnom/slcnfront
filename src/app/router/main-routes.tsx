import { Navigate, Route } from 'react-router-dom';
import { MAIN_ROUTE_PATTERNS } from './route-constants';
import { RequireAuth } from './guards';
import { MainDesktopShell } from '../shells/MainDesktopShell';
import { PublicShell } from '../shells/PublicShell';
import { LoginPage } from '../../pages/shared/LoginPage';
import { NotFoundPage } from '../../pages/shared/NotFoundPage';
import { AppPlaceholderPage } from '../../pages/shared/AppPlaceholderPage';
import { TripDetailPage } from '../../pages/main/TripDetailPage';
import { TripListPage } from '../../pages/main/TripListPage';
import { TripRegisterPage } from '../../pages/main/TripRegisterPage';
import { CalendarMonthPage } from '../../pages/main/CalendarMonthPage';
import { CalendarWeekPage } from '../../pages/main/CalendarWeekPage';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceShoesCatalogPath,
  buildDeviceTripListPath,
} from '../../lib/routing/route-builders';

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
            element={
              <AppPlaceholderPage
                eyebrow="Desktop Main"
                title="SLCN 데스크톱 홈"
                description="메인 라우트와 desktop shell이 연결된 상태입니다."
                device="main"
                actions={[
                  { label: '나들이 목록', to: buildDeviceTripListPath('main') },
                  {
                    label: '캘린더 월간',
                    to: buildDeviceCalendarMonthPath('main'),
                  },
                ]}
              />
            }
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
            element={
              <AppPlaceholderPage
                eyebrow="Shoes Catalog"
                title="신발 추천"
                description="정적 카탈로그 shell은 Step 08에서 붙습니다."
                device="main"
              />
            }
          />
          <Route
            path=":brand/:shoesName"
            element={
              <AppPlaceholderPage
                eyebrow="Shoes Detail"
                title="신발 상세"
                description="브랜드/slug 기반 상세 라우트가 desktop shell에 연결된 상태입니다."
                device="main"
                actions={[
                  {
                    label: '목록으로',
                    to: buildDeviceShoesCatalogPath('main'),
                  },
                ]}
              />
            }
          />
        </Route>
      </Route>
    </>
  );
}
