import { Link } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import type { TravelListItem } from '@/domains/travel/types';
import { buildDeviceTravelDetailPath } from '@/lib/routing/route-builders';

type TravelArchiveRowProps = {
  travel: TravelListItem;
  device: DeviceType;
  coverObjectUrl?: string | null;
};

export function TravelArchiveRow({
  travel,
  device,
  coverObjectUrl = null,
}: TravelArchiveRowProps) {
  return (
    <li className='slcn-home-archive__row'>
      <Link
        to={buildDeviceTravelDetailPath(device, travel.travelId)}
        className={`slcn-home-archive__link${
          coverObjectUrl ? '' : ' slcn-home-archive__link--no-cover'
        }`}
        aria-label={`${travel.title} 여행 보기`}
      >
        <time
          className='slcn-home-archive__date slcn-num'
          dateTime={travel.startDate}
        >
          {travel.displayStartDate}
        </time>
        <span className='slcn-home-archive__copy'>
          <strong className='slcn-home-archive__title'>{travel.title}</strong>
          <span className='slcn-home-archive__meta'>
            {travel.region} · {travel.nightsDaysLabel}
          </span>
          {travel.oneLineReview ? (
            <span className='slcn-home-archive__review'>
              {travel.oneLineReview}
            </span>
          ) : null}
        </span>
        {coverObjectUrl ? (
          <span className='slcn-home-archive__thumb'>
            <img src={coverObjectUrl} alt='' loading='lazy' decoding='async' />
          </span>
        ) : null}
      </Link>
    </li>
  );
}
