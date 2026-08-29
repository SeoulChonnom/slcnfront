import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import type { ScheduleEvent } from '@/domains/calendar/types';
import { MemoryChronicleFeature } from '@/domains/home/components/MemoryChronicleFeature';
import { TravelArchiveRow } from '@/domains/home/components/TravelArchiveRow';
import { useHomeTimeline } from '@/domains/home/hooks/useHomeTimeline';
import { filterTravelRecords } from '@/domains/home/retrieval';
import type { HomeSourceState } from '@/domains/home/types';
import { formatScheduleTime } from '@/domains/home/utils/home-dates';
import { buildOptionalAssetImageUrl } from '@/lib/api/asset-url';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceShoesCatalogPath,
  buildDeviceTravelRegisterPath,
  buildDeviceTripListPath,
} from '@/lib/routing/route-builders';
import { cn } from '@/lib/utils/cn';

type HomeHubPageProps = {
  device: DeviceType;
};

const DDAY_START = new Date('2024-11-10T00:00:00+09:00');

function getDdayCount() {
  return Math.floor((Date.now() - DDAY_START.getTime()) / 86_400_000) + 1;
}

function SourceFailure({
  children,
  source,
}: {
  children: string;
  source: HomeSourceState<unknown>;
}) {
  return (
    <p className='slcn-home__source-error' role='alert'>
      <span>{children}</span>{' '}
      <button type='button' onClick={source.retry}>
        다시 시도
      </button>
    </p>
  );
}

function ScheduleLink({
  device,
  schedule,
}: {
  device: DeviceType;
  schedule: ScheduleEvent;
}) {
  const time = formatScheduleTime(schedule.start, schedule.allDay);

  return (
    <Link
      to={buildDeviceCalendarMonthPath(device)}
      className='slcn-home__schedule-link'
      aria-label={`${schedule.title} 일정 보기`}
    >
      <time className='slcn-home__schedule-time' dateTime={schedule.start}>
        {time ?? '일정'}
      </time>
      <span className='slcn-home__schedule-copy'>
        <strong>{schedule.title}</strong>
        {schedule.location ? <span>{schedule.location}</span> : null}
      </span>
    </Link>
  );
}

export function HomeHubPage({ device }: HomeHubPageProps) {
  const model = useHomeTimeline();
  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const ddayDays = getDdayCount();
  const travelSource = model.sources.travels;
  const scheduleSource = model.sources.schedules;
  const dayOutSource = model.sources.dayOuts;
  const newestTravel = model.travels[0] ?? null;
  const filteredTravels = useMemo(
    () => filterTravelRecords(model.travels, { year: selectedYear, query }),
    [model.travels, query, selectedYear]
  );
  const archiveTravels = useMemo(
    () => filteredTravels.filter((travel) => travel.id !== newestTravel?.id),
    [filteredTravels, newestTravel]
  );
  const featureCoverUrl = buildOptionalAssetImageUrl(
    newestTravel?.coverPhotoId,
    'home-feature'
  );
  const isFullError = model.isError;
  const isTravelLoading = travelSource.status === 'loading';
  const hasArchiveFilter = Boolean(query.trim() || selectedYear);

  return (
    <section className={cn('slcn-home', `slcn-home--${device}`)}>
      <header className='slcn-home__intro'>
        <div>
          <h1 className='slcn-home__title'>지난 여행</h1>
          <p className='slcn-home__dday'>
            만난 지 <strong className='slcn-num'>{ddayDays}</strong>일째
          </p>
        </div>
      </header>

      {isFullError ? (
        <section className='slcn-home__full-error' role='alert'>
          <h2>여행 기록을 불러오지 못했어요.</h2>
          <p>잠시 후 다시 시도해 주세요.</p>
          <button type='button' onClick={model.retry}>
            다시 시도
          </button>
        </section>
      ) : null}

      {!isFullError && isTravelLoading ? (
        <div
          className='slcn-home__loading'
          role='status'
          aria-label='여행 기록을 불러오는 중'
        >
          <span aria-hidden='true' />
          <span aria-hidden='true' />
          <span aria-hidden='true' />
        </div>
      ) : null}

      {!isFullError && !isTravelLoading && travelSource.isError ? (
        <SourceFailure source={travelSource}>
          여행 기록을 불러오지 못했어요.
        </SourceFailure>
      ) : null}

      {!isFullError && !isTravelLoading && !travelSource.isError ? (
        <>
          {newestTravel ? (
            <MemoryChronicleFeature
              travel={newestTravel}
              device={device}
              coverUrl={featureCoverUrl}
            />
          ) : (
            <section className='slcn-home__empty-travels'>
              <h2>아직 남긴 여행이 없어요.</h2>
              <p>같이 다녀온 여행을 기록해 두면 다시 꺼내 볼 수 있어요.</p>
              <Link to={buildDeviceTravelRegisterPath(device)}>
                첫 여행 기록하기
              </Link>
            </section>
          )}

          <div className='slcn-home__retrieval'>
            <div className='slcn-home__retrieval-heading'>
              <h2>여행 기록 찾기</h2>
              <label className='slcn-home__search' id='home-travel-search'>
                <span>여행 기록 검색</span>
                <input
                  type='search'
                  value={query}
                  aria-label='여행 기록 검색'
                  placeholder='제목 · 지역 · 한 줄 기록'
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <button
                    type='button'
                    className='slcn-home__search-clear'
                    aria-label='검색 초기화'
                    onClick={() => setQuery('')}
                  >
                    초기화
                  </button>
                ) : null}
              </label>
            </div>

            <nav className='slcn-home__years' aria-label='여행 연도'>
              <button
                type='button'
                aria-pressed={selectedYear === null}
                className={cn(
                  'slcn-home__year',
                  selectedYear === null && 'slcn-home__year--active'
                )}
                onClick={() => setSelectedYear(null)}
              >
                전체
              </button>
              {model.years.map((year) => (
                <button
                  key={year}
                  type='button'
                  aria-pressed={selectedYear === year}
                  className={cn(
                    'slcn-home__year',
                    selectedYear === year && 'slcn-home__year--active'
                  )}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}년
                </button>
              ))}
            </nav>

            {archiveTravels.length > 0 ? (
              <ol className='slcn-home-archive' aria-label='여행 기록'>
                {archiveTravels.map((travel) => (
                  <TravelArchiveRow
                    key={travel.id}
                    travel={travel}
                    device={device}
                    coverUrl={buildOptionalAssetImageUrl(
                      travel.coverPhotoId,
                      'home-thumb'
                    )}
                  />
                ))}
              </ol>
            ) : hasArchiveFilter ? (
              <div className='slcn-home__zero-result'>
                {filteredTravels.length > 0 ? (
                  <p>가장 최근 여행이 검색 결과예요.</p>
                ) : (
                  <p>검색 결과가 없어요</p>
                )}
                {filteredTravels.length === 0 ? (
                  <button
                    type='button'
                    onClick={() => {
                      setQuery('');
                      setSelectedYear(null);
                    }}
                  >
                    검색 초기화
                  </button>
                ) : null}
              </div>
            ) : newestTravel ? (
              <div className='slcn-home__zero-result'>
                <p>더 오래된 여행은 아직 없어요.</p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {!isFullError ? (
        <div className='slcn-home__secondary'>
          <section
            className='slcn-home__schedule'
            aria-labelledby='home-next-schedule'
          >
            <div className='slcn-home__secondary-heading'>
              <h2 id='home-next-schedule'>다음 일정</h2>
              <Link to={buildDeviceCalendarMonthPath(device)}>달력 보기</Link>
            </div>
            {scheduleSource.status === 'loading' ? (
              <p className='slcn-home__secondary-empty' role='status'>
                일정을 불러오는 중
              </p>
            ) : scheduleSource.isError ? (
              <SourceFailure source={scheduleSource}>
                일정 정보를 불러오지 못했어요.
              </SourceFailure>
            ) : model.nearestSchedules.length > 0 ? (
              <ol className='slcn-home__schedule-list'>
                {model.nearestSchedules.map((schedule) => (
                  <li key={schedule.id}>
                    <ScheduleLink device={device} schedule={schedule} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className='slcn-home__secondary-empty'>
                아직 예정된 일정이 없어요.{' '}
                <Link to={buildDeviceCalendarMonthPath(device)}>
                  달력에서 계획하기
                </Link>
              </p>
            )}
          </section>

          <section
            className='slcn-home__day-outs'
            aria-labelledby='home-day-outs'
          >
            <div className='slcn-home__secondary-heading'>
              <h2 id='home-day-outs'>나들이</h2>
              <Link to={buildDeviceTripListPath(device)}>
                나들이 기록으로 가기
              </Link>
            </div>
            {dayOutSource.status === 'loading' ? (
              <p className='slcn-home__secondary-empty' role='status'>
                나들이 기록을 불러오는 중
              </p>
            ) : dayOutSource.isError ? (
              <SourceFailure source={dayOutSource}>
                나들이 기록을 불러오지 못했어요.
              </SourceFailure>
            ) : (
              <p className='slcn-home__secondary-empty'>
                {dayOutSource.data.length > 0
                  ? `남긴 나들이 ${dayOutSource.data.length}개`
                  : '아직 남긴 나들이가 없어요.'}
              </p>
            )}
          </section>
        </div>
      ) : null}

      <nav className='slcn-home__more' aria-label='더보기'>
        <span className='slcn-home__more-label'>더보기</span>
        <div className='slcn-home__more-links'>
          <Link to={buildDeviceShoesCatalogPath(device)}>신발 기록</Link>
          <a href='http://naver.me/52RjLNuT' target='_blank' rel='noreferrer'>
            Choi&apos;s Film Art
          </a>
        </div>
      </nav>
    </section>
  );
}
