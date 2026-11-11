import { Link } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import {
  ChevronIcon,
  DownIcon,
  UpIcon,
} from '@/domains/inspection/components/area-detail/icons';
import { formatVisitMonthLabel } from '@/domains/inspection/components/area-detail/visit-datetime';
import { DraftBadge } from '@/domains/inspection/components/DraftBadge';
import { InterestStars } from '@/domains/inspection/components/InterestStars';
import { TagChips } from '@/domains/inspection/components/TagChips';
import { useInspectionAreaProperties } from '@/domains/inspection/hooks/inspection-queries';
import type { ViewedPropertyDetail } from '@/domains/inspection/types';
import { formatPropertyName } from '@/domains/inspection/utils/inspection-format';
import type { VisitPhase } from '@/domains/inspection/utils/visit-phase';
import { buildDeviceInspectionPropertyDetailPath } from '@/lib/routing/route-builders';

type PropertyRowProps = {
  device: DeviceType;
  areaId: string;
  property: ViewedPropertyDetail;
  /** FD2: the "작성 중" badge is hidden unless the parent visit is `REVISING`. */
  visitPhase: VisitPhase;
};

/**
 * §1.4 / §5.2: "6월보다 2단계" — the one piece of information this app
 * derives purely by grouping, not something the server computes. Finds the
 * nearest earlier visit that recorded the same `complexName`+`name` and
 * compares interest levels. Renders nothing when there is no earlier
 * occurrence, both levels aren't set, or the level didn't change.
 */
function PropertyInterestDelta({
  areaId,
  property,
}: {
  areaId: string;
  property: ViewedPropertyDetail;
}) {
  const linkedQuery = useInspectionAreaProperties(areaId, {
    complexName: property.complexName,
    // 이름이 비면 쿼리가 비활성화되어 연결 비교를 건너뛴다.
    name: property.name ?? '',
  });

  const entries = linkedQuery.data;

  if (!entries || entries.length < 2) {
    return null;
  }

  const currentIndex = entries.findIndex(
    (entry) => entry.visitId === property.visitId
  );

  if (currentIndex === -1) {
    return null;
  }

  const previous = entries
    .slice(currentIndex + 1)
    .find((entry) => entry.visitId !== property.visitId);

  if (
    !previous ||
    previous.interestLevel === null ||
    property.interestLevel === null
  ) {
    return null;
  }

  const delta = property.interestLevel - previous.interestLevel;

  if (delta === 0) {
    return null;
  }

  const monthLabel = formatVisitMonthLabel(previous.visitedAt);
  const Icon = delta > 0 ? UpIcon : DownIcon;

  return (
    <span
      className='slcn-inspection-area-detail-prop__delta'
      data-direction={delta > 0 ? 'up' : 'down'}
    >
      <Icon />
      {monthLabel}보다 {Math.abs(delta)}단계
    </span>
  );
}

function buildDraftReason(
  incompleteSummary: ViewedPropertyDetail['incompleteSummary']
): string | undefined {
  if (incompleteSummary.unansweredRequiredCount > 0) {
    const questionLabels = incompleteSummary.unansweredRequiredQuestions
      .map((question) => question.question)
      .join(', ');
    return `필수 문답 ${incompleteSummary.unansweredRequiredCount}개 남음${
      questionLabels ? ` — ${questionLabels}` : ''
    }`;
  }
  if (incompleteSummary.missingFields.length > 0) {
    return `${incompleteSummary.missingFields
      .map((field) => (field === 'name' ? '동·호수' : field))
      .join(', ')} 미입력`;
  }
  return undefined;
}

export function PropertyRow({
  device,
  areaId,
  property,
  visitPhase,
}: PropertyRowProps) {
  return (
    <Link
      to={buildDeviceInspectionPropertyDetailPath(
        device,
        areaId,
        property.propertyId
      )}
      className='slcn-inspection-area-detail-prop'
    >
      <span className='slcn-inspection-area-detail-prop__body'>
        <span className='slcn-inspection-area-detail-prop__name'>
          {formatPropertyName(property.name)}
        </span>
        {property.oneLineReview ? (
          <span className='slcn-inspection-area-detail-prop__line'>
            “{property.oneLineReview}”
          </span>
        ) : null}
        <span className='slcn-inspection-area-detail-prop__meta'>
          <TagChips tags={property.tags} />
          {property.status === 'DRAFT' && visitPhase === 'REVISING' ? (
            <DraftBadge reason={buildDraftReason(property.incompleteSummary)} />
          ) : null}
        </span>
      </span>
      <span className='slcn-inspection-area-detail-prop__rating'>
        <InterestStars level={property.interestLevel} />
        <PropertyInterestDelta areaId={areaId} property={property} />
      </span>
      <ChevronIcon className='slcn-inspection-area-detail-prop__go' />
    </Link>
  );
}
