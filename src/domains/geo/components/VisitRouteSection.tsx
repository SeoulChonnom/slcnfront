import { useId, useMemo, useState } from 'react';
import { RouteMap } from '@/domains/geo/map/RouteMap';
import { useKakaoMaps } from '@/domains/geo/map/useKakaoMaps';
import {
  buildSegments,
  buildStops,
  estimateWalkMinutes,
  type GeoPoint,
} from '@/domains/geo/utils/route-geometry';

type VisitRouteProperty = {
  propertyId: string;
  /** Row label shown in the list, e.g. "트리마제 · 101동 1203호". */
  title: string;
  location: (GeoPoint & { bdMgtSn: string }) | null;
};

type VisitRouteSectionProps = {
  /** In screen (API array) order. */
  properties: VisitRouteProperty[];
  origin?: GeoPoint | null;
  defaultOpen?: boolean;
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
  properties,
  origin = null,
  defaultOpen = true,
}: VisitRouteSectionProps) {
  const bodyId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const kakaoMaps = useKakaoMaps();
  const stops = useMemo(() => buildStops(properties), [properties]);
  const segments = useMemo(() => buildSegments(stops), [stops]);

  if (properties.length === 0) {
    return null;
  }

  const titleById = new Map(properties.map((p) => [p.propertyId, p.title]));
  const unlocatedCount = properties.filter((p) => !p.location).length;
  const totalMeters = segments.reduce((sum, s) => sum + s.meters, 0);

  return (
    <section className='slcn-visit-route' aria-label='방문 순서'>
      <div className='slcn-visit-route__head'>
        <h3 className='slcn-visit-route__title'>방문 순서</h3>
        {segments.length > 0 ? (
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
        {isOpen && kakaoMaps.status === 'ready' && stops.length > 0 ? (
          <RouteMap
            maps={kakaoMaps.maps}
            stops={stops}
            segments={segments}
            origin={origin}
          />
        ) : null}

        {stops.length > 0 ? (
          <ol className='slcn-visit-route__list'>
            {stops.map((stop, index) => {
              const next = segments[index];
              const title = stop.propertyIds
                .map((id) => titleById.get(id))
                .join(' / ');

              return (
                <li key={stop.propertyIds.join(',')}>
                  <span className='slcn-visit-route__number'>{stop.label}</span>
                  <span className='slcn-visit-route__name'>{title}</span>
                  {next ? (
                    <span className='slcn-visit-route__leg'>
                      다음까지 {formatDistance(next.meters)} · 약{' '}
                      {next.walkMinutes}분
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
