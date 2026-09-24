import { Link } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import {
  formatDraftReason,
  formatFirstVisitedAt,
  formatVisitedAtWeekday,
  pickTopPropertyView,
} from '@/domains/inspection/components/area-list/format-area-row';
import { DraftBadge } from '@/domains/inspection/components/DraftBadge';
import { InterestStars } from '@/domains/inspection/components/InterestStars';
import { RevisitIntentMark } from '@/domains/inspection/components/RevisitIntentMark';
import { TagChips } from '@/domains/inspection/components/TagChips';
import type { InspectionArea } from '@/domains/inspection/types';
import {
  formatVisitedAtDate,
  formatVisitedAtTime,
} from '@/domains/inspection/utils/inspection-format';
import { buildAssetImageUrl } from '@/lib/api/asset-url';
import { buildDeviceInspectionAreaDetailPath } from '@/lib/routing/route-builders';

const MAX_THUMBNAILS = 2;

function AreaVisitDots({ area }: { area: InspectionArea }) {
  const count = area.visitCount;

  return (
    <div className='slcn-inspection-area-row__visits'>
      <span className='slcn-inspection-area-row__visits-count'>
        {count}
        <small>회</small>
      </span>
      {count > 0 ? (
        <span
          className='slcn-inspection-area-row__visits-dots'
          aria-hidden='true'
        >
          {Array.from({ length: count }, (_, index) => (
            <i key={`visit-dot-${index}`} data-latest={index === 0} />
          ))}
        </span>
      ) : null}
      {area.lastVisitedAt ? (
        <span className='slcn-inspection-area-row__visits-last'>
          최근 {formatVisitedAtDate(area.lastVisitedAt).slice(5)}
        </span>
      ) : null}
    </div>
  );
}

function AreaThumbnails({ area }: { area: InspectionArea }) {
  if (area.totalImageCount === 0) return null;

  const shown = area.thumbnails.slice(0, MAX_THUMBNAILS);
  const overflow = area.totalImageCount - shown.length;

  return (
    <div className='slcn-inspection-area-row__thumbs'>
      {shown.map((thumb) => (
        <img
          key={thumb.id}
          className='slcn-inspection-area-row__thumb'
          src={buildAssetImageUrl(thumb.fileAssetId, 'home-thumb')}
          alt={thumb.caption ?? ''}
          loading='lazy'
        />
      ))}
      {overflow > 0 ? (
        <span
          className='slcn-inspection-area-row__thumb slcn-inspection-area-row__thumb--more'
          aria-hidden='true'
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

function AreaTopProperty({ area }: { area: InspectionArea }) {
  const top = pickTopPropertyView(area);

  return (
    <div className='slcn-inspection-area-row__top'>
      <span className='slcn-inspection-area-row__top-label'>
        최고 관심 매물
      </span>
      {top ? (
        <>
          <span className='slcn-inspection-area-row__top-complex'>
            {top.complexName}
          </span>
          <span className='slcn-inspection-area-row__top-name'>{top.name}</span>
          <InterestStars
            level={top.interestLevel}
            className='slcn-inspection-area-row__top-rating'
          />
        </>
      ) : (
        <span className='slcn-inspection-area-row__top-name slcn-inspection-area-row__top-name--empty'>
          아직 없음
        </span>
      )}
      <AreaThumbnails area={area} />
    </div>
  );
}

function formatLastVisitMetaline(area: InspectionArea): string | null {
  if (!area.lastVisitedAt) return null;

  const date = formatVisitedAtDate(area.lastVisitedAt);
  const weekday = formatVisitedAtWeekday(area.lastVisitedAt);
  const time = formatVisitedAtTime(area.lastVisitedAt);
  return [date, weekday, time].filter(Boolean).join(' ');
}

function AreaSecondMetaline({ area }: { area: InspectionArea }) {
  const isDraft = area.latestVisit?.status === 'DRAFT';

  if (isDraft) {
    return (
      <span className='slcn-inspection-area-row__metaline'>
        누적 매물 <strong>{area.totalPropertyCount}</strong>건 ·{' '}
        {formatDraftReason(area)}
      </span>
    );
  }

  if (area.totalPropertyCount === 0) {
    return (
      <span className='slcn-inspection-area-row__metaline'>
        본 매물 없음 · 지역만 확인
      </span>
    );
  }

  const firstVisitedAt = formatFirstVisitedAt(area);

  return (
    <span className='slcn-inspection-area-row__metaline'>
      누적 매물 <strong>{area.totalPropertyCount}</strong>건
      {firstVisitedAt ? <> · 첫 임장 {firstVisitedAt}</> : null}
    </span>
  );
}

type AreaListRowProps = {
  area: InspectionArea;
  device: DeviceType;
};

export function AreaListRow({ area, device }: AreaListRowProps) {
  const isDraftArea = area.latestVisit?.status === 'DRAFT';
  const lastVisitMetaline = formatLastVisitMetaline(area);

  return (
    <Link
      to={buildDeviceInspectionAreaDetailPath(device, area.areaId)}
      className='slcn-inspection-hairline-row slcn-inspection-area-row'
    >
      <AreaVisitDots area={area} />

      <div className='slcn-inspection-area-row__main'>
        <h2 className='slcn-inspection-area-row__name'>
          {area.name}
          {isDraftArea ? (
            <DraftBadge className='slcn-inspection-area-row__draft-badge' />
          ) : null}
        </h2>
        {area.description ? (
          <p className='slcn-inspection-area-row__desc'>{area.description}</p>
        ) : null}
        {area.latestVisit?.oneLineReview ? (
          <p className='slcn-inspection-area-row__quote'>
            &ldquo;{area.latestVisit.oneLineReview}&rdquo;
          </p>
        ) : (
          <p className='slcn-inspection-area-row__quote slcn-inspection-area-row__quote--empty'>
            한줄평을 아직 쓰지 않았습니다.
          </p>
        )}
        <TagChips
          tags={area.latestVisit?.tags ?? []}
          className='slcn-inspection-area-row__tags'
        />
      </div>

      <div className='slcn-inspection-area-row__meta'>
        <RevisitIntentMark intent={area.latestVisit?.revisitIntent ?? null} />
        {lastVisitMetaline ? (
          <span className='slcn-inspection-area-row__metaline'>
            최근 임장 {lastVisitMetaline}
          </span>
        ) : (
          <span className='slcn-inspection-area-row__metaline'>
            임장 기록이 아직 없습니다
          </span>
        )}
        <AreaSecondMetaline area={area} />
      </div>

      <AreaTopProperty area={area} />
    </Link>
  );
}
