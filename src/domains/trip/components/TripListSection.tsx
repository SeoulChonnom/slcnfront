import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import { LinkButton } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { PageSectionHeader } from '../../../components/ui/PageSectionHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  buildDeviceTripDetailPath,
  buildDeviceTripRegisterPath,
} from '../../../lib/routing/route-builders';
import { useAuthStore } from '../../auth/store/auth-store';
import { useTripAssetUrls } from '../hooks/useTripAssetUrls';
import { useTripList } from '../hooks/useTripList';
import { useTripQuiz } from '../hooks/useTripQuiz';
import { TripCard } from './TripCard';
import { TripQuizModal } from './TripQuizModal';

const tripCardSkeletonKeys = [
  'trip-card-skeleton-1',
  'trip-card-skeleton-2',
  'trip-card-skeleton-3',
];

type TripListSectionProps = {
  device: DeviceType;
};

export function TripListSection({ device }: TripListSectionProps) {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useTripList();
  const quiz = useTripQuiz();
  const [query, setQuery] = useState('');
  const logoObjectUrls = useTripAssetUrls(
    data?.map((trip) => trip.logoPath) ?? []
  );
  const isAdmin = useAuthStore((state) =>
    state.userInfo?.roleList.includes('admin')
  );
  const filteredTrips = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return data;
    }

    return data.filter((trip) =>
      [trip.name, trip.displayDate, trip.type]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [data, query]);
  const showSectionHeader = device === 'main';

  return (
    <section className='slcn-trip-list-section'>
      {showSectionHeader ? (
        <PageSectionHeader
          title='서울 촌놈 나들이 기록'
          description='서울 촌놈 나들이는 계속 될 예정....🥳'
          action={
            isAdmin ? (
              <LinkButton to={buildDeviceTripRegisterPath(device)}>
                새 나들이 기록하기
              </LinkButton>
            ) : null
          }
        />
      ) : null}

      <Card className='slcn-trip-list-section__search' tone='pink' blob>
        <div className='slcn-trip-list-section__search-copy'>
          <p className='slcn-trip-list-section__eyebrow'>
            서울 촌놈 나들이 기록 📷
          </p>
          <h2 className='slcn-trip-list-section__title display-hand'>
            서울 촌놈 나들이 기록
          </h2>
          <p className='slcn-trip-list-section__description'>
            서울 촌놈 나들이는 계속 될 예정....🥳
          </p>
        </div>
        <div className='slcn-trip-list-section__search-row'>
          <input
            type='search'
            className='slcn-trip-list-section__search-input'
            placeholder='날짜나 나들이 이름'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {isAdmin ? (
            <LinkButton to={buildDeviceTripRegisterPath(device)}>
              새 나들이 기록하기
            </LinkButton>
          ) : null}
        </div>
      </Card>

      {isPending ? (
        <div
          className='slcn-trip-list-section__grid'
          role='status'
          aria-label='loading'
        >
          {tripCardSkeletonKeys.map((skeletonKey) => (
            <Skeleton key={skeletonKey} className='slcn-trip-card__skeleton' />
          ))}
        </div>
      ) : null}

      {!isPending && isError ? (
        <ErrorState
          title='나들이 기록을 불러오지 못했어요.'
          description='잠시 후 다시 시도해주세요.'
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError && data?.length === 0 ? (
        <EmptyState
          title='아직 등록된 나들이가 없어요.'
          description='새 나들이 기록하기로 첫 번째 추억을 남겨보세요.'
          actionLabel={isAdmin ? '기록하러 가기' : undefined}
          actionTo={isAdmin ? buildDeviceTripRegisterPath(device) : undefined}
        />
      ) : null}

      {!isPending && !isError && data && filteredTrips.length === 0 ? (
        <EmptyState
          title='검색 결과가 없어요.'
          description='다른 날짜나 키워드로 다시 찾아보세요.'
        />
      ) : null}

      {!isPending && !isError && filteredTrips.length > 0 ? (
        <div className='slcn-trip-list-section__grid'>
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id || trip.date}
              trip={trip}
              logoObjectUrl={logoObjectUrls[trip.logoPath] ?? null}
              onOpenQuiz={(nextTrip) => {
                void quiz.openQuiz(nextTrip);
              }}
            />
          ))}
        </div>
      ) : null}

      {!isPending && !isError ? (
        <p className='slcn-trip-list-section__description'>
          서울 촌놈 나들이는 계속 될 예정....🥳
        </p>
      ) : null}

      <TripQuizModal
        tripName={quiz.activeTrip?.name}
        isOpen={quiz.isOpen}
        quiz={quiz.quiz}
        feedback={quiz.feedback}
        isLoading={quiz.isLoadingQuiz}
        isSubmitting={quiz.isSubmittingAnswer}
        errorMessage={quiz.errorMessage}
        onClose={quiz.closeQuiz}
        onAnswer={(optionId) => {
          void quiz.submitAnswer(optionId);
        }}
        onRetry={() => {
          void quiz.retryQuiz();
        }}
        onConfirmSuccess={() => {
          if (!quiz.activeTrip || !quiz.feedback?.isCorrect) {
            return;
          }

          navigate(buildDeviceTripDetailPath(device, quiz.activeTrip.id));
          quiz.closeQuiz();
        }}
      />
    </section>
  );
}
