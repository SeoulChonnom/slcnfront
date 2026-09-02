import { useMemo, useState } from 'react';
import type { DeviceType } from '@/app/router/route-constants';
import { LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { TravelCard } from '@/domains/travel/components/TravelCard';
import { useTravelList } from '@/domains/travel/hooks/useTravelList';
import type { TravelListItem } from '@/domains/travel/types';
import { buildOptionalAssetImageUrl } from '@/lib/api/asset-url';
import { buildDeviceTravelRegisterPath } from '@/lib/routing/route-builders';

const travelCardSkeletonKeys = [
  'travel-card-skeleton-1',
  'travel-card-skeleton-2',
];

type TravelListSectionProps = {
  device: DeviceType;
};

type TravelYearGroup = {
  year: string;
  travels: TravelListItem[];
};

// The API already returns newest-first; group in encounter order instead of
// re-sorting so that order is preserved across the year boundaries.
function groupTravelsByYear(travels: TravelListItem[]): TravelYearGroup[] {
  const groups: TravelYearGroup[] = [];
  const groupByYear = new Map<string, TravelYearGroup>();

  for (const travel of travels) {
    const year = travel.startDate.slice(0, 4);
    let group = groupByYear.get(year);
    if (!group) {
      group = { year, travels: [] };
      groupByYear.set(year, group);
      groups.push(group);
    }
    group.travels.push(travel);
  }

  return groups;
}

export function TravelListSection({ device }: TravelListSectionProps) {
  const { data, isPending, isError, refetch } = useTravelList();
  const [query, setQuery] = useState('');
  const filteredTravels = useMemo(() => {
    if (!data) return [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return data;
    return data.filter((travel) =>
      [
        travel.title,
        travel.region,
        travel.dateRangeLabel,
        ...travel.tags.map((tag) => tag.name),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [data, query]);
  const travelYearGroups = useMemo(
    () => groupTravelsByYear(filteredTravels),
    [filteredTravels]
  );

  return (
    <section className='slcn-travel-list-section'>
      <h1 className='slcn-travel-list-section__title'>여행 기록</h1>

      <div className='slcn-travel-list-section__toolbar'>
        <div className='slcn-travel-list-section__search-wrap'>
          <svg
            className='slcn-travel-list-section__search-icon'
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='color-mix(in srgb, var(--color-border-strong) 75%, var(--color-ink) 25%)'
            strokeWidth='2'
            aria-hidden='true'
          >
            <circle cx='11' cy='11' r='7' />
            <path d='M20 20l-3.2-3.2' />
          </svg>
          <input
            type='search'
            className='slcn-travel-list-section__search-input'
            placeholder='날짜 · 여행 이름 · 지역으로 검색'
            aria-label='여행 검색'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <LinkButton
          to={buildDeviceTravelRegisterPath(device)}
          className='slcn-travel-list-section__register-btn'
        >
          + 새 여행 기록하기
        </LinkButton>
      </div>

      {isPending ? (
        <div
          className='slcn-travel-list-section__grid'
          role='status'
          aria-label='loading'
        >
          {travelCardSkeletonKeys.map((skeletonKey) => (
            <Skeleton
              key={skeletonKey}
              className='slcn-travel-card__skeleton'
            />
          ))}
        </div>
      ) : null}

      {!isPending && isError ? (
        <ErrorState
          headingLevel={2}
          title='여행 기록을 불러오지 못했어요.'
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError && data?.length === 0 ? (
        <EmptyState
          title='아직 남긴 여행이 없어요.'
          description='같이 다녀온 여행을 날짜별로 기록할 수 있어요.'
          actionLabel='새 여행 기록하기'
          actionTo={buildDeviceTravelRegisterPath(device)}
          headingLevel={2}
        />
      ) : null}

      {!isPending &&
      !isError &&
      data &&
      data.length > 0 &&
      filteredTravels.length === 0 ? (
        <EmptyState
          title='검색 결과가 없어요.'
          description='다른 이름이나 지역으로 찾아보세요.'
          headingLevel={2}
        />
      ) : null}

      {!isPending && !isError && filteredTravels.length > 0
        ? travelYearGroups.map((group) => (
            <div
              key={group.year}
              className='slcn-travel-list-section__year-group'
            >
              <h2 className='slcn-travel-list-section__year-heading'>
                {group.year}년
              </h2>
              <div className='slcn-travel-list-section__grid'>
                {group.travels.map((travel) => (
                  <TravelCard
                    key={travel.id}
                    travel={travel}
                    device={device}
                    coverUrl={buildOptionalAssetImageUrl(
                      travel.coverPhotoId,
                      'home-feature'
                    )}
                  />
                ))}
              </div>
            </div>
          ))
        : null}
    </section>
  );
}
