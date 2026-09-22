import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button, LinkButton } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { AreaEditModal } from '@/domains/inspection/components/area-detail/AreaEditModal';
import { PlusIcon } from '@/domains/inspection/components/area-detail/icons';
import { VisitPanel } from '@/domains/inspection/components/area-detail/VisitPanel';
import {
  type RailVisit,
  VisitRail,
} from '@/domains/inspection/components/area-detail/VisitRail';
import { useInspectionAreaDetail } from '@/domains/inspection/hooks/inspection-queries';
import { formatVisitedAtDate } from '@/domains/inspection/utils/inspection-format';
import {
  buildDeviceInspectionAreaListPath,
  buildDeviceInspectionRegisterPath,
} from '@/lib/routing/route-builders';

type InspectionAreaDetailSectionProps = {
  device: DeviceType;
  areaId: string;
};

/**
 * screen_design.md §5.2 지역 상세. The rail is this screen's signature
 * element (§4.5): switching visits never navigates — it only rewrites
 * `?visit=` (fe_implementation_decisions.md §2) and swaps the panel below,
 * which is exactly what a plain `useSearchParams` + React Query key change
 * gives for free (new `visitId` → new query key → new fetch, old page stays
 * mounted). Using the setter's default push behavior also means the browser
 * back button walks back through visit selections, not just page loads.
 */
export function InspectionAreaDetailSection({
  device,
  areaId,
}: InspectionAreaDetailSectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAreaEditOpen, setIsAreaEditOpen] = useState(false);
  const requestedVisitId = searchParams.get('visit') ?? undefined;

  const detailQuery = useInspectionAreaDetail(areaId, {
    visitId: requestedVisitId,
  });

  const handleSelectVisit = useCallback(
    (visitId: string) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set('visit', visitId);
        return next;
      });
    },
    [setSearchParams]
  );

  const handleVisitDeleted = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('visit');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  if (detailQuery.isPending) {
    return (
      <section className='slcn-inspection-area-detail' data-device={device}>
        <Skeleton className='slcn-inspection-area-detail__skeleton-head' />
        <Skeleton className='slcn-inspection-area-detail__skeleton-rail' />
        <Skeleton className='slcn-inspection-area-detail__skeleton-body' />
      </section>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <section className='slcn-inspection-area-detail' data-device={device}>
        <ErrorState
          headingLevel={1}
          title='지역 정보를 불러오지 못했습니다.'
          description='네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
          onRetry={() => void detailQuery.refetch()}
        />
      </section>
    );
  }

  const { area, visits, hasMoreVisits, visitPageSize, selectedVisit } =
    detailQuery.data;

  const railVisits: RailVisit[] = visits.map((visit) => ({
    visitId: visit.visitId,
    visitedAt: visit.visitedAt,
    revisitIntent: visit.revisitIntent,
    status: visit.status,
    propertyCount: visit.propertyCount,
  }));

  return (
    <section className='slcn-inspection-area-detail' data-device={device}>
      <nav
        className='slcn-inspection-area-detail__crumb'
        aria-label='현재 위치'
      >
        <Link to={buildDeviceInspectionAreaListPath(device)}>임장</Link>
        <span aria-hidden='true'>›</span>
        <span aria-current='page'>{area.name}</span>
      </nav>

      <div className='slcn-inspection-area-detail__head'>
        <div className='slcn-inspection-area-detail__head-text'>
          <h1 className='slcn-inspection-area-detail__title'>{area.name}</h1>
          <p className='slcn-inspection-area-detail__subline'>
            {[
              area.description,
              `임장 ${area.visitCount}회`,
              `누적 매물 ${area.totalPropertyCount}건`,
              area.firstVisitedAt
                ? `첫 임장 ${formatVisitedAtDate(area.firstVisitedAt)}`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className='slcn-inspection-area-detail__head-actions'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => setIsAreaEditOpen(true)}
          >
            지역 정보 수정
          </Button>
          <LinkButton to={buildDeviceInspectionRegisterPath(device)}>
            <PlusIcon /> 이 지역 다시 임장
          </LinkButton>
        </div>
      </div>

      {selectedVisit ? (
        <>
          <VisitRail
            areaId={areaId}
            visits={railVisits}
            totalVisitCount={area.visitCount}
            hasMoreVisits={hasMoreVisits}
            visitPageSize={visitPageSize}
            selectedVisitId={selectedVisit.visitId}
            onSelect={handleSelectVisit}
          />

          <VisitPanel
            device={device}
            areaId={areaId}
            visit={selectedVisit}
            isOnlyVisit={area.visitCount <= 1}
            onDeleted={handleVisitDeleted}
          />
        </>
      ) : (
        // An area with no visits yet. The server sends selectedVisit: null for
        // it, which is a normal state — the area was created ahead of its first
        // visit, or its only visit was deleted.
        <div className='slcn-inspection-area-detail__no-visit'>
          <p className='slcn-inspection-area-detail__no-visit-title'>
            아직 이 지역을 임장한 기록이 없습니다.
          </p>
          <p className='slcn-inspection-area-detail__no-visit-body'>
            첫 임장을 기록하면 회차별로 쌓입니다.
          </p>
          <LinkButton to={buildDeviceInspectionRegisterPath(device)}>
            <PlusIcon /> 이 지역 임장 기록하기
          </LinkButton>
        </div>
      )}

      <AreaEditModal
        isOpen={isAreaEditOpen}
        area={area}
        onClose={() => setIsAreaEditOpen(false)}
      />
    </section>
  );
}
