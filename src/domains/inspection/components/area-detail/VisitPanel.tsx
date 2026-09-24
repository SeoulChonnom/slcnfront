import { useState } from 'react';
import type { DeviceType } from '@/app/router/route-constants';
import { Button, LinkButton } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PropertyGroupList } from '@/domains/inspection/components/area-detail/PropertyGroupList';
import { VisitGallery } from '@/domains/inspection/components/area-detail/VisitGallery';
import { VisitProsCons } from '@/domains/inspection/components/area-detail/VisitProsCons';
import { formatVisitDateTimeLine } from '@/domains/inspection/components/area-detail/visit-datetime';
import { DraftBadge } from '@/domains/inspection/components/DraftBadge';
import { RevisitIntentMark } from '@/domains/inspection/components/RevisitIntentMark';
import { TagChips } from '@/domains/inspection/components/TagChips';
import { useDeleteInspectionVisit } from '@/domains/inspection/hooks/inspection-queries';
import type { InspectionVisitDetail } from '@/domains/inspection/types';
import { buildDeviceInspectionVisitEditPath } from '@/lib/routing/route-builders';

type VisitPanelProps = {
  device: DeviceType;
  areaId: string;
  visit: InspectionVisitDetail;
  /** True when this is the area's only remaining visit — shapes the delete copy. */
  isOnlyVisit: boolean;
  onDeleted: () => void;
};

export function VisitPanel({
  device,
  areaId,
  visit,
  isOnlyVisit,
  onDeleted,
}: VisitPanelProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteVisit = useDeleteInspectionVisit();

  const handleConfirmDelete = async () => {
    await deleteVisit.mutateAsync(visit.visitId);
    setIsConfirmingDelete(false);
    onDeleted();
  };

  return (
    <div
      id='inspection-visit-panel'
      role='tabpanel'
      aria-labelledby={`inspection-visit-tab-${visit.visitId}`}
      className='slcn-inspection-area-detail-panel'
    >
      <div className='slcn-inspection-area-detail-panel__head'>
        <RevisitIntentMark intent={visit.revisitIntent} variant='pill' />
        <span className='slcn-inspection-area-detail-panel__datetime'>
          {formatVisitDateTimeLine(visit.visitedAt)}
        </span>
        {visit.status === 'DRAFT' ? <DraftBadge /> : null}
        <span className='slcn-inspection-area-detail-panel__actions'>
          <LinkButton
            to={buildDeviceInspectionVisitEditPath(
              device,
              areaId,
              visit.visitId
            )}
            variant='secondary'
            size='sm'
          >
            이 임장 수정
          </LinkButton>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setIsConfirmingDelete(true)}
          >
            이 임장 삭제
          </Button>
        </span>
      </div>

      {visit.oneLineReview ? (
        <p className='slcn-inspection-area-detail-panel__quote'>
          “{visit.oneLineReview}”
        </p>
      ) : null}

      {visit.tags.length > 0 ? (
        <TagChips
          tags={visit.tags}
          max={visit.tags.length}
          className='slcn-inspection-area-detail-panel__tags'
        />
      ) : null}

      {visit.memo ? (
        <div className='slcn-inspection-area-detail-panel__memo'>
          {visit.memo
            .split('\n')
            .map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={`memo-paragraph-${index}`}>{paragraph}</p>
              ) : null
            )}
        </div>
      ) : null}

      <VisitProsCons pros={visit.pros} cons={visit.cons} />

      <VisitGallery photos={visit.photos} />

      <PropertyGroupList
        device={device}
        areaId={areaId}
        visitId={visit.visitId}
        properties={visit.properties}
      />

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title='이 임장 기록을 삭제할까요?'
        description={
          isOnlyVisit
            ? `이 회차와 함께 매물 ${visit.properties.length}건, 사진 ${visit.photos.length}장, 문답 답변이 모두 사라져요. 이 지역의 마지막 임장 기록이라 지우면 회차가 하나도 남지 않아요. 되돌릴 수 없어요.`
            : `이 회차와 함께 매물 ${visit.properties.length}건, 사진 ${visit.photos.length}장, 문답 답변이 모두 사라져요. 되돌릴 수 없어요.`
        }
        confirmLabel='삭제할게요'
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isConfirming={deleteVisit.isPending}
      />
    </div>
  );
}
