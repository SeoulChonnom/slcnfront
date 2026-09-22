import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button, LinkButton } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { InterestStars } from '@/domains/inspection/components/InterestStars';
import { InfoIcon } from '@/domains/inspection/components/property-detail/icons';
import { formatInterestSummary } from '@/domains/inspection/components/property-detail/interest-summary';
import { PropertyAnswerList } from '@/domains/inspection/components/property-detail/PropertyAnswerList';
import { PropertyBreadcrumb } from '@/domains/inspection/components/property-detail/PropertyBreadcrumb';
import { PropertyLineageStrip } from '@/domains/inspection/components/property-detail/PropertyLineageStrip';
import { PropertyPhotoGallery } from '@/domains/inspection/components/property-detail/PropertyPhotoGallery';
import { TagChips } from '@/domains/inspection/components/TagChips';
import {
  useDeleteInspectionProperty,
  useInspectionProperty,
} from '@/domains/inspection/hooks/inspection-queries';
import { formatVisitedAtDate } from '@/domains/inspection/utils/inspection-format';
import {
  buildDeviceInspectionAreaDetailPath,
  buildDeviceInspectionPropertyDetailPath,
  buildDeviceInspectionPropertyEditPath,
} from '@/lib/routing/route-builders';

type InspectionPropertyDetailSectionProps = {
  device: DeviceType;
};

/** Splits a `\n`-separated pros/cons string into list items, dropping blanks. */
function toListItems(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function InspectionPropertyDetailSection({
  device,
}: InspectionPropertyDetailSectionProps) {
  const { areaId, propertyId } = useParams<{
    areaId: string;
    propertyId: string;
  }>();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data, isPending, isError, refetch } =
    useInspectionProperty(propertyId);
  const deleteMutation = useDeleteInspectionProperty(data?.visitId ?? '');

  if (isPending) {
    return (
      <section className='slcn-inspection-property-detail' data-device={device}>
        <div className='slcn-inspection-property-detail__skeleton'>
          <Skeleton className='slcn-inspection-property-detail__skeleton-line' />
          <Skeleton className='slcn-inspection-property-detail__skeleton-title' />
          <Skeleton className='slcn-inspection-property-detail__skeleton-line' />
          <div className='slcn-inspection-gallery'>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton
                key={index}
                className='slcn-inspection-property-detail__skeleton-tile'
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError || !data || !areaId || !propertyId) {
    return (
      <section className='slcn-inspection-property-detail' data-device={device}>
        <ErrorState
          title='매물 정보를 불러오지 못했어요.'
          description='잠시 후 다시 시도해 주세요.'
          onRetry={() => refetch()}
        />
      </section>
    );
  }

  const propertyLabel = `${data.complexName} ${data.name}`.trim();
  const areaVisitDetailPath = `${buildDeviceInspectionAreaDetailPath(device, areaId)}?visit=${encodeURIComponent(data.visitId)}`;
  const pros = toListItems(data.pros);
  const cons = toListItems(data.cons);
  const requiredCount = data.answers.filter((answer) => answer.required).length;
  const optionalCount = data.answers.length - requiredCount;
  const interestSummary = formatInterestSummary(data.interestLevel);

  return (
    <section className='slcn-inspection-property-detail' data-device={device}>
      <PropertyBreadcrumb
        device={device}
        areaId={areaId}
        areaName={data.areaName}
        visitId={data.visitId}
        visitedAt={data.visitedAt}
        propertyLabel={propertyLabel}
      />

      <header className='slcn-inspection-property-detail__head'>
        <div className='slcn-inspection-property-detail__head-text'>
          <p className='slcn-inspection-property-detail__complex'>
            {data.complexName}
          </p>
          <h1 className='slcn-inspection-property-detail__title'>
            {data.name}
          </h1>
          <div className='slcn-inspection-property-detail__rating'>
            <InterestStars level={data.interestLevel} />
            {interestSummary ? (
              <span className='slcn-inspection-property-detail__rating-summary'>
                {interestSummary}
              </span>
            ) : null}
          </div>
        </div>
        <div className='slcn-inspection-property-detail__head-actions'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setIsDeleteOpen(true)}
          >
            삭제
          </Button>
          <LinkButton
            variant='secondary'
            size='sm'
            to={buildDeviceInspectionPropertyEditPath(
              device,
              areaId,
              data.visitId,
              propertyId
            )}
          >
            매물 수정
          </LinkButton>
        </div>
      </header>

      <PropertyLineageStrip
        device={device}
        areaId={areaId}
        areaName={data.areaName}
        complexName={data.complexName}
        name={data.name}
        currentPropertyId={propertyId}
      />

      {data.oneLineReview ? (
        <p className='slcn-inspection-property-detail__quote'>
          “{data.oneLineReview}”
        </p>
      ) : null}

      {data.tags.length > 0 ? (
        <TagChips tags={data.tags} max={data.tags.length} />
      ) : null}

      {data.memo ? (
        <p className='slcn-inspection-property-detail__prose'>{data.memo}</p>
      ) : null}

      {pros.length > 0 || cons.length > 0 ? (
        <dl className='slcn-inspection-proscons'>
          {pros.length > 0 ? (
            <div>
              <dt data-kind='pro'>+ 장점</dt>
              <dd>
                <ul>
                  {pros.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
          {cons.length > 0 ? (
            <div>
              <dt data-kind='con'>− 단점</dt>
              <dd>
                <ul>
                  {cons.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {data.photos.length > 0 ? (
        <div className='slcn-inspection-section'>
          <div className='slcn-inspection-section__head'>
            <h2 className='slcn-inspection-section__title'>매물 사진</h2>
            <span className='slcn-inspection-section__count'>
              {data.photos.length}장
            </span>
          </div>
          <PropertyPhotoGallery photos={data.photos} />
        </div>
      ) : null}

      {data.answers.length > 0 ? (
        <div className='slcn-inspection-section'>
          <div className='slcn-inspection-section__head'>
            <h2 className='slcn-inspection-section__title'>문답</h2>
            <span className='slcn-inspection-section__count'>
              필수 {requiredCount}개 · 선택 {optionalCount}개
            </span>
          </div>
          <PropertyAnswerList answers={data.answers} />
          <div className='slcn-inspection-alert'>
            <InfoIcon />
            <span>
              이 매물은 <b>{formatVisitedAtDate(data.visitedAt)}</b> 임장 시점의
              질문 구성으로 저장되어 있습니다. 이후 질문이 바뀌어도 이 기록의
              문답은 그대로 유지됩니다.
            </span>
          </div>
        </div>
      ) : null}

      <nav
        className='slcn-inspection-property-detail__nav'
        aria-label='이전·다음 매물'
      >
        {data.prevProperty ? (
          <Link
            to={buildDeviceInspectionPropertyDetailPath(
              device,
              areaId,
              data.prevProperty.propertyId
            )}
          >
            ← 이전 매물 · {data.prevProperty.name}
          </Link>
        ) : (
          <Link to={areaVisitDetailPath}>← 이 임장의 매물 목록</Link>
        )}
        {data.nextProperty ? (
          <Link
            to={buildDeviceInspectionPropertyDetailPath(
              device,
              areaId,
              data.nextProperty.propertyId
            )}
          >
            다음 매물 · {data.nextProperty.name} →
          </Link>
        ) : null}
      </nav>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title='매물을 삭제할까요?'
        description={`사진 ${data.photos.length}장, 태그 ${data.tags.length}개, 문답 응답 ${data.answers.filter((answer) => answer.answered).length}개가 이 매물과 함께 삭제됩니다. 되돌릴 수 없습니다.`}
        confirmLabel='삭제'
        onCancel={() => setIsDeleteOpen(false)}
        isConfirming={deleteMutation.isPending}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(propertyId);
          navigate(areaVisitDetailPath);
        }}
      />
    </section>
  );
}
