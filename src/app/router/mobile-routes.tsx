import { Navigate, Route } from 'react-router-dom';
import { MOBILE_ROUTE_PATTERNS } from './route-constants';
import { RequireAuth } from './guards';
import { DetailMobileShell } from '../shells/DetailMobileShell';
import { MainMobileShell } from '../shells/MainMobileShell';
import { PublicShell } from '../shells/PublicShell';
import { LoginPage } from '../../pages/shared/LoginPage';
import { NotFoundPage } from '../../pages/shared/NotFoundPage';
import { AppPlaceholderPage } from '../../pages/shared/AppPlaceholderPage';
import { TripDetailPage } from '../../pages/mobile/TripDetailPage';
import { TripListPage } from '../../pages/mobile/TripListPage';
import { TripRegisterPage } from '../../pages/mobile/TripRegisterPage';
import { CalendarMonthPage } from '../../pages/mobile/CalendarMonthPage';
import { CalendarWeekPage } from '../../pages/mobile/CalendarWeekPage';
import {
  buildDeviceShoesCatalogPath,
} from '../../lib/routing/route-builders';

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
            element={
              <AppPlaceholderPage
                eyebrow="Mobile Main"
                title="SLCN 모바일 홈"
                description="모바일 shell과 bottom navigation이 연결된 상태입니다."
                device="mobile"
              />
            }
          />
          <Route
            path="map"
            element={<TripListPage />}
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
                title="모바일 신발 추천"
                description="카탈로그 그리드와 상세 라우트는 Step 08에서 채웁니다."
                device="mobile"
              />
            }
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
            element={<TripRegisterPage />}
          />
          <Route
            path="map/:date"
            element={<TripDetailPage />}
          />
          <Route
            path=":brand/:shoesName"
            element={
              <AppPlaceholderPage
                eyebrow="Shoes Detail"
                title="모바일 신발 상세"
                description="신발 상세도 detail shell 위에서 렌더링됩니다."
                device="mobile"
                actions={[
                  {
                    label: '목록으로',
                    to: buildDeviceShoesCatalogPath('mobile'),
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
