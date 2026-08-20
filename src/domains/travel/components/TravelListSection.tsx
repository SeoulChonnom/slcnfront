import type { DeviceType } from '../../../app/router/route-constants';
import { LinkButton } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { buildDeviceTravelRegisterPath } from '../../../lib/routing/route-builders';
import { useTravelAssetUrls } from '../hooks/useTravelAssetUrls';
import { useTravelList } from '../hooks/useTravelList';
import { TravelCard } from './TravelCard';

const travelCardSkeletonKeys = [
  'travel-card-skeleton-1',
  'travel-card-skeleton-2',
];

type TravelListSectionProps = {
  device: DeviceType;
};

export function TravelListSection({ device }: TravelListSectionProps) {
  const { data, isPending, isError, refetch } = useTravelList();
  const coverObjectUrls = useTravelAssetUrls(
    data?.map((travel) => travel.coverPhotoId) ?? []
  );

  return (
    <section className='slcn-travel-list-section'>
      <div className='slcn-travel-list-section__header'>
        <h1 className='slcn-travel-list-section__title'>여행 기록</h1>
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

      {!isPending && !isError && data && data.length > 0 ? (
        <div className='slcn-travel-list-section__grid'>
          {data.map((travel, index) => (
            <TravelCard
              key={travel.id}
              travel={travel}
              device={device}
              isRepresentative={index === 0 || travel.coverPhotoId !== null}
              coverObjectUrl={
                travel.coverPhotoId
                  ? (coverObjectUrls[travel.coverPhotoId] ?? null)
                  : null
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
