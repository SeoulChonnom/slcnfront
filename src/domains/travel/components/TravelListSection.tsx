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
        <div className='slcn-travel-list-section__header-text'>
          <p className='slcn-travel-list-section__eyebrow'>JOURNEY</p>
          <h1 className='slcn-travel-list-section__title'>여행 기록</h1>
          <p className='slcn-travel-list-section__subtitle'>
            1박 이상 머문 여행을 날짜별로 차곡차곡 남겨요.
          </p>
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
          title='여행 기록을 불러오지 못했어요.'
          description='잠시 후 다시 시도해주세요.'
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError && data?.length === 0 ? (
        <EmptyState
          title='아직 등록된 여행이 없어요.'
          description='새 여행 기록하기로 첫 번째 여행을 남겨보세요.'
          actionLabel='기록하러 가기'
          actionTo={buildDeviceTravelRegisterPath(device)}
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
