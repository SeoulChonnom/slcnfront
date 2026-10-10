import { useId, useMemo, useState } from 'react';
import {
  buildWalkingRouteKey,
  useWalkingRoute,
  type WalkingRouteFailure,
} from '@/domains/geo/hooks/useWalkingRoute';
import { RouteMap } from '@/domains/geo/map/RouteMap';
import { useKakaoMaps } from '@/domains/geo/map/useKakaoMaps';
import {
  buildSegments,
  buildStops,
  estimateWalkMinutes,
  type GeoPoint,
} from '@/domains/geo/utils/route-geometry';
import {
  secondsToWalkMinutes,
  toWalkingRouteDisplay,
} from '@/domains/geo/utils/walking-route';

type VisitRouteProperty = {
  propertyId: string;
  /** Row label shown in the list, e.g. "트리마제 · 101동 1203호". */
  title: string;
  location: (GeoPoint & { bdMgtSn: string }) | null;
};

type VisitRouteSectionProps = {
  visitId: string;
  /** Completed visit: the route is a present-day recommendation, not the walk taken. */
  isCompleted?: boolean;
  /** In screen (API array) order. */
  properties: VisitRouteProperty[];
  origin?: GeoPoint | null;
  defaultOpen?: boolean;
};

const FAILURE_MESSAGES: Record<WalkingRouteFailure, string> = {
  quota: '오늘 경로 조회 한도를 넘었습니다',
  failed: '잠시 후 다시 시도해 주세요',
  unavailable: '지금은 도보 경로를 볼 수 없어요',
  other: '잠시 후 다시 시도해 주세요',
};

function formatDistance(meters: number) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)}km`
    : `${Math.round(meters)}m`;
}

/**
 * Visit order on a map plus a compact list. The list is the whole feature when
 * no Kakao key is configured or the SDK cannot load.
 */
export function VisitRouteSection({
  visitId,
  isCompleted = false,
  properties,
  origin = null,
  defaultOpen = true,
}: VisitRouteSectionProps) {
  const bodyId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const kakaoMaps = useKakaoMaps();
  const stops = useMemo(() => buildStops(properties), [properties]);
  const straightSegments = useMemo(() => buildSegments(stops), [stops]);
  const walking = useWalkingRoute(visitId, properties);
  const key = buildWalkingRouteKey(visitId, properties);
  // Which key the user chose to view the real route for; a new key resets it.
  const [routeViewKey, setRouteViewKey] = useState<string | null>(null);
  const routeDisplay = useMemo(
    () => (walking.route ? toWalkingRouteDisplay(walking.route, stops) : null),
    [walking.route, stops]
  );
  const showingRoute =
    routeDisplay !== null && routeViewKey === key && !walking.isPending;
  const isEmptyRoute = walking.route !== null && routeDisplay === null;

  const shownStops = showingRoute ? routeDisplay.stops : stops;
  const segments = showingRoute ? routeDisplay.segments : straightSegments;

  if (properties.length === 0) {
    return null;
  }

  const titleById = new Map(properties.map((p) => [p.propertyId, p.title]));
  const unlocatedCount = properties.filter((p) => !p.location).length;
  const totalMeters = segments.reduce((sum, s) => sum + s.meters, 0);
  const canRequestRoute = stops.length >= 2;

  function handleRouteButton() {
    if (showingRoute) {
      setRouteViewKey(null);

      return;
    }
    if (routeDisplay) {
      setRouteViewKey(key);

      return;
    }
    setRouteViewKey(key);
    walking.request();
  }

  return (
    <section className='slcn-visit-route' aria-label='방문 순서'>
      <div className='slcn-visit-route__head'>
        <h3 className='slcn-visit-route__title'>방문 순서</h3>
        {showingRoute ? (
          <span className='slcn-visit-route__total'>
            실제 도보 약 {secondsToWalkMinutes(routeDisplay.totalSeconds)}분 ·{' '}
            {formatDistance(routeDisplay.totalMeters)}
          </span>
        ) : segments.length > 0 ? (
          <span className='slcn-visit-route__total'>
            총 {formatDistance(totalMeters)} · 약{' '}
            {estimateWalkMinutes(totalMeters)}분 (직선 기준 추정)
          </span>
        ) : null}
        <button
          type='button'
          className='slcn-visit-route__toggle'
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? '접기' : '펼치기'}
        </button>
      </div>

      <div id={bodyId} hidden={!isOpen} className='slcn-visit-route__body'>
        {canRequestRoute ? (
          <div className='slcn-visit-route__route-actions'>
            <button
              type='button'
              className='slcn-visit-route__route-button'
              disabled={walking.isPending || walking.unavailable}
              onClick={handleRouteButton}
            >
              {walking.isPending
                ? '도보 경로 불러오는 중…'
                : showingRoute
                  ? '직선으로 보기'
                  : '도보 경로 보기'}
            </button>
            {walking.unavailable ? (
              <p className='slcn-visit-route__notice' role='alert'>
                {FAILURE_MESSAGES.unavailable}
              </p>
            ) : walking.failure ? (
              <p className='slcn-visit-route__notice' role='alert'>
                {FAILURE_MESSAGES[walking.failure]}
              </p>
            ) : null}
            {isEmptyRoute ? (
              <p className='slcn-visit-route__notice' role='status'>
                경로를 그릴 지점이 2곳 이상 필요해요
              </p>
            ) : null}
            {showingRoute && isCompleted ? (
              <p className='slcn-visit-route__notice'>
                화면 순서대로 걸었을 때의 현재 기준 추천 경로예요
              </p>
            ) : null}
          </div>
        ) : null}

        {isOpen && kakaoMaps.status === 'ready' && shownStops.length > 0 ? (
          <RouteMap
            maps={kakaoMaps.maps}
            stops={shownStops}
            segments={segments}
            origin={origin}
          />
        ) : null}

        {shownStops.length > 0 ? (
          <ol className='slcn-visit-route__list'>
            {shownStops.map((stop, index) => {
              const next = segments.find((segment) => segment.from === stop);
              const reachesFurther =
                next !== undefined && next.to !== shownStops[index + 1];
              const title = stop.propertyIds
                .map((id) => titleById.get(id))
                .join(' / ');

              return (
                <li key={`${index}:${stop.propertyIds.join(',')}`}>
                  <span className='slcn-visit-route__number'>{stop.label}</span>
                  <span className='slcn-visit-route__name'>{title}</span>
                  {next ? (
                    <span className='slcn-visit-route__leg'>
                      {reachesFurther
                        ? `${next.to.label}번 지점까지`
                        : '다음까지'}{' '}
                      {formatDistance(next.meters)} · 약 {next.walkMinutes}분
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className='slcn-visit-route__empty'>
            위치가 저장된 매물이 아직 없어요.
          </p>
        )}

        {unlocatedCount > 0 ? (
          <p className='slcn-visit-route__unlocated'>
            위치 미지정 {unlocatedCount}건
          </p>
        ) : null}
      </div>
    </section>
  );
}
