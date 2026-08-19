import { Link } from 'react-router-dom';
import type { DeviceType } from '../../app/router/route-constants';
import { HomeTimelineRow } from '../../domains/home/components/HomeTimelineRow';
import { useHomeTimeline } from '../../domains/home/hooks/useHomeTimeline';
import { useTravelAssetUrls } from '../../domains/travel/hooks/useTravelAssetUrls';
import { useTripAssetUrls } from '../../domains/trip/hooks/useTripAssetUrls';
import { fileAssetKey } from '../../domains/trip/types';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceTripRegisterPath,
} from '../../lib/routing/route-builders';
import { cn } from '../../lib/utils/cn';

type HomeHubPageProps = {
  device: DeviceType;
};

const FILM_URL = 'http://naver.me/52RjLNuT';
const DDAY_START = new Date('2024-11-10T00:00:00+09:00');

function getDdayCount() {
  return Math.floor((Date.now() - DDAY_START.getTime()) / 86_400_000) + 1;
}

function OutboundIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M7 17L17 7M9 7h8v8' />
    </svg>
  );
}

export function HomeHubPage({ device }: HomeHubPageProps) {
  const { upcoming, past, isLoading, isError } = useHomeTimeline();
  const ddayDays = getDdayCount();

  const tripLogoUrls = useTripAssetUrls(
    past.flatMap((entry) => (entry.kind === 'trip' ? [entry.trip.logo] : []))
  );
  const travelCoverUrls = useTravelAssetUrls(
    past.flatMap((entry) =>
      entry.kind === 'travel' ? [entry.travel.coverPhotoId] : []
    )
  );

  function imageUrlFor(entry: (typeof past)[number]) {
    if (entry.kind === 'trip') {
      return tripLogoUrls[fileAssetKey(entry.trip.logo)] ?? null;
    }

    if (entry.kind === 'travel' && entry.travel.coverPhotoId) {
      return travelCoverUrls[entry.travel.coverPhotoId] ?? null;
    }

    return null;
  }

  return (
    <section className={cn('slcn-home', `slcn-home--${device}`)}>
      <header className='slcn-home__intro'>
        <h1 className='slcn-home__title'>서울 촌놈 나들이 기록</h1>
        <p className='slcn-home__subtitle'>
          사진과 지도로 남기는 조용한 서울 포토 저널.
        </p>
        <p className='slcn-home__dday'>
          만난 지 <strong className='slcn-num'>{ddayDays}</strong>일째
        </p>
      </header>

      <div className='slcn-home__timeline'>
        {upcoming.length > 0 ? (
          <ol className='slcn-home__group'>
            {upcoming.map((entry) => (
              <HomeTimelineRow key={entry.id} entry={entry} device={device} />
            ))}
          </ol>
        ) : (
          <p className='slcn-home__nudge'>
            이번 달은 아직 약속이 없어요.{' '}
            <Link
              to={buildDeviceCalendarMonthPath(device)}
              className='slcn-home__nudge-action'
            >
              달력에서 계획하기
            </Link>
          </p>
        )}

        <div className='slcn-home__today'>
          <span className='slcn-home__today-label'>오늘</span>
        </div>

        {isLoading ? (
          <ol className='slcn-home__group' aria-label='기록을 불러오는 중'>
            {[0, 1, 2].map((index) => (
              <li key={index} className='slcn-home-row slcn-home-row--skeleton'>
                <span className='slcn-home-row__skeleton-rail' />
                <span className='slcn-home-row__skeleton-line' />
              </li>
            ))}
          </ol>
        ) : null}

        {!isLoading && isError ? (
          <p className='slcn-home__nudge'>
            기록을 불러오지 못했어요. 잠시 뒤에 다시 열어 주세요.
          </p>
        ) : null}

        {!isLoading && !isError && past.length > 0 ? (
          <ol className='slcn-home__group'>
            {past.map((entry) => (
              <HomeTimelineRow
                key={`${entry.kind}-${entry.id}`}
                entry={entry}
                device={device}
                imageUrl={imageUrlFor(entry)}
              />
            ))}
          </ol>
        ) : null}

        {!isLoading && !isError && past.length === 0 ? (
          <p className='slcn-home__nudge'>
            아직 남긴 기록이 없어요.{' '}
            <Link
              to={buildDeviceTripRegisterPath(device)}
              className='slcn-home__nudge-action'
            >
              첫 나들이 기록하기
            </Link>
          </p>
        ) : null}
      </div>

      {device === 'mobile' ? (
        <a
          href={FILM_URL}
          target='_blank'
          rel='noreferrer'
          className='slcn-home__outbound'
        >
          Choi&apos;s Film Art
          <OutboundIcon />
        </a>
      ) : null}
    </section>
  );
}
