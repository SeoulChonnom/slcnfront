import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import { LinkButton } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  buildDeviceTripDetailPath,
  buildDeviceTripRegisterPath,
} from '../../../lib/routing/route-builders';
import { useAuthStore } from '../../auth/store/auth-store';
import { useTripAssetUrls } from '../hooks/useTripAssetUrls';
import { useTripList } from '../hooks/useTripList';
import { useTripQuiz } from '../hooks/useTripQuiz';
import { fileRefKey } from '../types';
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
  const logoObjectUrls = useTripAssetUrls(data?.map((trip) => trip.logo) ?? []);
  const isAdmin = useAuthStore((state) =>
    state.userInfo?.roleList.includes('admin')
  );
  const filteredTrips = useMemo(() => {
    if (!data) return [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return data;
    return data.filter((trip) =>
      [trip.name, trip.displayDate, trip.type]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [data, query]);

  return (
    <section className='slcn-trip-list-section'>
      <div className='slcn-trip-list-section__header'>
        <div>
          <h1 className='slcn-trip-list-section__title'>
            서울 촌놈 나들이 기록
          </h1>
          <p className='slcn-trip-list-section__subtitle'>
            걸었던 날들을 모았어요. 퀴즈를 풀면 상세 지도가 열려요.
          </p>
        </div>
        {isAdmin ? (
          <LinkButton
            to={buildDeviceTripRegisterPath(device)}
            className='slcn-trip-list-section__register-btn'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.2'
              strokeLinecap='round'
              aria-hidden='true'
            >
              <path d='M12 5v14M5 12h14' />
            </svg>
            새 나들이 기록하기
          </LinkButton>
        ) : null}
      </div>

      <div className='slcn-trip-list-section__search-wrap'>
        <svg
          className='slcn-trip-list-section__search-icon'
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#B7A7AD'
          strokeWidth='2'
          aria-hidden='true'
        >
          <circle cx='11' cy='11' r='7' />
          <path d='M20 20l-3.2-3.2' />
        </svg>
        <input
          type='search'
          className='slcn-trip-list-section__search-input'
          placeholder='날짜 · 나들이 이름 · 유형으로 검색'
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

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

      {!isPending &&
      !isError &&
      data &&
      data.length > 0 &&
      filteredTrips.length === 0 ? (
        <div className='slcn-trip-list-section__no-result'>
          <div className='slcn-trip-list-section__no-result-icon'>
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#C9B9BF'
              strokeWidth='2'
            >
              <circle cx='11' cy='11' r='7' />
              <path d='M20 20l-3.2-3.2' />
            </svg>
          </div>
          <h3 className='slcn-trip-list-section__no-result-title'>
            검색 결과가 없어요
          </h3>
          <p className='slcn-trip-list-section__no-result-desc'>
            &ldquo;{query}&rdquo; 와 맞는 나들이를 찾지 못했어요.
          </p>
        </div>
      ) : null}

      {!isPending && !isError && filteredTrips.length > 0 ? (
        <div className='slcn-trip-list-section__grid'>
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id || trip.date}
              trip={trip}
              logoObjectUrl={logoObjectUrls[fileRefKey(trip.logo)] ?? null}
              onOpenQuiz={(nextTrip) => {
                void quiz.openQuiz(nextTrip);
              }}
            />
          ))}
        </div>
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
          if (!quiz.activeTrip || !quiz.feedback?.isCorrect) return;
          navigate(buildDeviceTripDetailPath(device, quiz.activeTrip.id));
          quiz.closeQuiz();
        }}
      />
    </section>
  );
}
