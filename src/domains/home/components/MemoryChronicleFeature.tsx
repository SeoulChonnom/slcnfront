import { Link } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import type { TravelListItem } from '@/domains/travel/types';
import { buildDeviceTravelDetailPath } from '@/lib/routing/route-builders';

type MemoryChronicleFeatureProps = {
  travel: TravelListItem;
  device: DeviceType;
  coverObjectUrl?: string | null;
};

export function MemoryChronicleFeature({
  travel,
  device,
  coverObjectUrl = null,
}: MemoryChronicleFeatureProps) {
  return (
    <article className='slcn-home__recent-memory'>
      <Link
        to={buildDeviceTravelDetailPath(device, travel.travelId)}
        className='slcn-home__recent-link'
        aria-label={`${travel.title} 여행 상세 보기`}
      >
        <div className='slcn-home__recent-media'>
          {coverObjectUrl ? (
            <img
              src={coverObjectUrl}
              alt={`${travel.title} 여행 사진`}
              className='slcn-home__recent-image'
              decoding='async'
              fetchPriority='high'
            />
          ) : (
            <div
              className='slcn-home__recent-no-cover'
              role='img'
              aria-label='표지 사진 없음'
            >
              <span>사진 없이 남긴 여행</span>
              <strong>{travel.title}</strong>
            </div>
          )}
        </div>
        <div className='slcn-home__recent-copy'>
          <p className='slcn-home__recent-meta'>
            <time dateTime={travel.startDate}>{travel.dateRangeLabel}</time>
            <span aria-hidden='true'> · </span>
            <span>{travel.region}</span>
            <span aria-hidden='true'> · </span>
            <span>{travel.nightsDaysLabel}</span>
          </p>
          <h2 className='slcn-home__recent-title'>{travel.title}</h2>
          {travel.oneLineReview ? (
            <p className='slcn-home__recent-review'>{travel.oneLineReview}</p>
          ) : null}
          <span className='slcn-home__recent-action'>여행 기록 열기</span>
        </div>
      </Link>
    </article>
  );
}
