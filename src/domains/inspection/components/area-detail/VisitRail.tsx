import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { formatVisitedAtWeekdayShort } from '@/domains/inspection/components/area-detail/visit-datetime';
import { RevisitIntentMark } from '@/domains/inspection/components/RevisitIntentMark';
import { useInspectionVisitList } from '@/domains/inspection/hooks/inspection-queries';
import type {
  InspectionStatus,
  RevisitIntent,
} from '@/domains/inspection/types';
import {
  formatVisitedAtDate,
  formatVisitedAtTime,
} from '@/domains/inspection/utils/inspection-format';
import { cn } from '@/lib/utils/cn';

/**
 * The rail only needs the handful of fields both `InspectionVisitSummary`
 * (initial page, from area detail) and `InspectionVisitListItem` (extra pages
 * via `useInspectionVisitList`, §3-④) share — this is what lets the two
 * sources concatenate into one list without a branch at render time.
 */
export type RailVisit = {
  visitId: string;
  visitedAt: string;
  revisitIntent: RevisitIntent | null;
  status: InspectionStatus;
  propertyCount: number | null;
};

type VisitRailProps = {
  areaId: string;
  visits: RailVisit[];
  totalVisitCount: number;
  hasMoreVisits: boolean;
  visitPageSize: number;
  selectedVisitId: string;
  onSelect: (visitId: string) => void;
};

function getOrdinalSuffix(
  index: number,
  totalVisitCount: number,
  loadedCount: number,
  hasMoreVisits: boolean
): string | null {
  if (totalVisitCount <= 1) {
    return '가장 최근';
  }
  if (index === 0) {
    return '가장 최근';
  }
  const isOldestLoaded = index === loadedCount - 1;
  const allVisitsLoaded = !hasMoreVisits && loadedCount >= totalVisitCount;
  if (isOldestLoaded && allVisitsLoaded) {
    return '처음';
  }
  return null;
}

function formatPropertyCountLabel(propertyCount: number | null): string {
  if (propertyCount === null) {
    return '';
  }
  return propertyCount === 0 ? '매물 없음' : `매물 ${propertyCount}`;
}

/**
 * §3-④ "이어받기": fetching the next page is its own tiny component so the
 * `useInspectionVisitList` request only fires once someone actually asks for
 * more — mounting a hook always fetches, so this stays unmounted until then.
 */
function VisitRailLoadMore({
  areaId,
  page,
  size,
  onLoaded,
}: {
  areaId: string;
  page: number;
  size: number;
  onLoaded: (items: RailVisit[], hasNext: boolean) => void;
}) {
  const query = useInspectionVisitList({ areaId, page, size });
  const data = query.data;

  useEffect(() => {
    if (!data) {
      return;
    }

    onLoaded(
      data.items.map((item) => ({
        visitId: item.visitId,
        visitedAt: item.visitedAt,
        revisitIntent: item.revisitIntent,
        status: item.status,
        propertyCount: item.propertyCount,
      })),
      data.hasNext
    );
  }, [data, onLoaded]);

  return (
    <div
      className='slcn-inspection-area-detail-rail__load-more-status'
      aria-live='polite'
    >
      {query.isPending ? '이전 회차를 불러오는 중…' : null}
      {query.isError ? '이전 회차를 불러오지 못했어요.' : null}
    </div>
  );
}

export function VisitRail({
  areaId,
  visits,
  totalVisitCount,
  hasMoreVisits,
  visitPageSize,
  selectedVisitId,
  onSelect,
}: VisitRailProps) {
  const [extraPages, setExtraPages] = useState<RailVisit[]>([]);
  const [nextPageToLoad, setNextPageToLoad] = useState<number | null>(null);
  const [canLoadMore, setCanLoadMore] = useState(hasMoreVisits);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const allVisits = useMemo(
    () => [...visits, ...extraPages],
    [visits, extraPages]
  );

  const selectedIndex = allVisits.findIndex(
    (visit) => visit.visitId === selectedVisitId
  );

  const handleLoadMoreClick = useCallback(() => {
    // First page beyond the initial one already embedded in the area-detail
    // response is page 2 — page 1 is what `visits` already holds.
    setNextPageToLoad((current) => current ?? 2);
  }, []);

  const handleLoaded = useCallback((items: RailVisit[], hasNext: boolean) => {
    setExtraPages((current) => [...current, ...items]);
    setCanLoadMore(hasNext);
    setNextPageToLoad(null);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const lastIndex = allVisits.length - 1;
      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          nextIndex = selectedIndex >= lastIndex ? 0 : selectedIndex + 1;
          break;
        case 'ArrowLeft':
          nextIndex = selectedIndex <= 0 ? lastIndex : selectedIndex - 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = lastIndex;
          break;
        default:
          return;
      }

      if (nextIndex === null || !allVisits[nextIndex]) {
        return;
      }

      event.preventDefault();
      const nextVisit = allVisits[nextIndex];
      onSelect(nextVisit.visitId);
      tabRefs.current[nextIndex]?.focus();
    },
    [allVisits, onSelect, selectedIndex]
  );

  return (
    <div className='slcn-inspection-area-detail-rail-wrap'>
      <div
        className='slcn-inspection-area-detail-rail'
        role='tablist'
        aria-label='임장 회차'
        onKeyDown={handleKeyDown}
      >
        {allVisits.map((visit, index) => {
          const isSelected = visit.visitId === selectedVisitId;
          const ordinal = totalVisitCount - index;
          const suffix = getOrdinalSuffix(
            index,
            totalVisitCount,
            allVisits.length,
            canLoadMore
          );

          return (
            <button
              key={visit.visitId}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type='button'
              role='tab'
              id={`inspection-visit-tab-${visit.visitId}`}
              aria-selected={isSelected}
              aria-controls='inspection-visit-panel'
              tabIndex={isSelected ? 0 : -1}
              className={cn(
                'slcn-inspection-area-detail-rail__item',
                isSelected && 'slcn-inspection-area-detail-rail__item--selected'
              )}
              onClick={() => onSelect(visit.visitId)}
            >
              <span className='slcn-inspection-area-detail-rail__ord'>
                {ordinal}차{suffix ? ` · ${suffix}` : ''}
              </span>
              <span className='slcn-inspection-area-detail-rail__date'>
                {formatVisitedAtDate(visit.visitedAt)}
              </span>
              <span className='slcn-inspection-area-detail-rail__sub'>
                {formatVisitedAtWeekdayShort(visit.visitedAt)}{' '}
                {formatVisitedAtTime(visit.visitedAt)} ·{' '}
                {formatPropertyCountLabel(visit.propertyCount)}
                <span className='slcn-inspection-area-detail-rail__revisit'>
                  <RevisitIntentMark intent={visit.revisitIntent} />
                </span>
              </span>
            </button>
          );
        })}

        {canLoadMore ? (
          <button
            type='button'
            className='slcn-inspection-area-detail-rail__more'
            onClick={handleLoadMoreClick}
            disabled={nextPageToLoad !== null}
          >
            이전 회차 더 보기
          </button>
        ) : null}
      </div>

      {nextPageToLoad !== null ? (
        <VisitRailLoadMore
          areaId={areaId}
          page={nextPageToLoad}
          size={visitPageSize}
          onLoaded={handleLoaded}
        />
      ) : null}
    </div>
  );
}
