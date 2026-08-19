import { Link } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import { buildDeviceTravelDetailPath } from '../../../lib/routing/route-builders';
import type { TravelListItem } from '../types';

type TravelCardProps = {
  travel: TravelListItem;
  device: DeviceType;
  isRepresentative?: boolean;
  coverObjectUrl?: string | null;
};

export function TravelCard({
  travel,
  device,
  isRepresentative = false,
  coverObjectUrl = null,
}: TravelCardProps) {
  return (
    <Link
      to={buildDeviceTravelDetailPath(device, travel.id)}
      className='slcn-travel-card'
      aria-label={`${travel.title} 여행 보기`}
    >
      {/* Image area */}
      <div className='slcn-travel-card__image-wrap slcn-stripe'>
        {coverObjectUrl ? (
          <img
            src={coverObjectUrl}
            alt={travel.title}
            className='slcn-travel-cover-img'
          />
        ) : (
          <svg
            className='slcn-travel-card__image-placeholder-icon'
            width='34'
            height='34'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#D8A9BC'
            strokeWidth='1.5'
            aria-hidden='true'
          >
            <rect x='3' y='5' width='18' height='14' rx='2' />
            <circle cx='8.5' cy='10.5' r='1.5' />
            <path d='M21 15l-5-5L5 19' />
          </svg>
        )}

        {/* Top-left: N박 M일 pill */}
        <span className='slcn-travel-card__nights-pill'>
          {travel.nightsDaysLabel}
        </span>

        {/* Top-right: 대표 pill */}
        {isRepresentative ? (
          <span className='slcn-travel-card__rep-pill'>대표</span>
        ) : null}
      </div>

      {/* Content area */}
      <div className='slcn-travel-card__body'>
        {/* Region chip + date range row */}
        <div className='slcn-travel-card__meta-row'>
          <span className='slcn-travel-card__region-chip'>{travel.region}</span>
          <span className='slcn-travel-card__date-range'>
            {travel.dateRangeLabel}
          </span>
        </div>

        {/* Title */}
        <h2 className='slcn-travel-card__title'>{travel.title}</h2>

        {/* One-line review / description */}
        {travel.oneLineReview ? (
          <p className='slcn-travel-card__desc'>{travel.oneLineReview}</p>
        ) : null}

        {/* Tag chips */}
        {travel.tags.length > 0 ? (
          <div className='slcn-travel-card__tags'>
            {travel.tags.map((tag) => (
              <span key={tag.name} className='slcn-travel-card__tag-chip'>
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
