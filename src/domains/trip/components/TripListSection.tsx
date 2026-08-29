import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { TripCard } from '@/domains/trip/components/TripCard';
import { TripQuizModal } from '@/domains/trip/components/TripQuizModal';
import { useTripList } from '@/domains/trip/hooks/useTripList';
import { useTripQuiz } from '@/domains/trip/hooks/useTripQuiz';
import { fileAssetKey } from '@/domains/trip/types';
import { buildAssetImageUrl } from '@/lib/api/asset-url';
import {
  buildDeviceTripDetailPath,
  buildDeviceTripRegisterPath,
} from '@/lib/routing/route-builders';

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
      <h1 className='slcn-trip-list-section__title'>서울 촌놈 나들이 기록</h1>

      <div className='slcn-trip-list-section__toolbar'>
        <div className='slcn-trip-list-section__search-wrap'>
          <svg
            className='slcn-trip-list-section__search-icon'
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
            className='slcn-trip-list-section__search-input'
            placeholder='날짜 · 나들이 이름 · 유형으로 검색'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
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
          headingLevel={2}
          title='나들이 기록을 불러오지 못했어요.'
          description='잠시 후 다시 시도해 주세요.'
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError && data?.length === 0 ? (
        <EmptyState
          title='아직 남긴 나들이가 없어요.'
          description='다녀온 기록을 적어 두면 다시 꺼내 볼 수 있어요.'
          actionLabel={isAdmin ? '새 나들이 기록하기' : undefined}
          actionTo={isAdmin ? buildDeviceTripRegisterPath(device) : undefined}
          headingLevel={2}
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
              stroke='color-mix(in srgb, var(--color-border-strong) 84%, var(--color-ink) 16%)'
              strokeWidth='2'
              aria-hidden='true'
            >
              <circle cx='11' cy='11' r='7' />
              <path d='M20 20l-3.2-3.2' />
            </svg>
          </div>
          <h2 className='slcn-trip-list-section__no-result-title'>
            검색 결과가 없어요
          </h2>
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
              logoUrl={buildAssetImageUrl(
                fileAssetKey(trip.logo),
                'home-thumb'
              )}
              onOpenQuiz={(nextTrip) => {
                void quiz.openQuiz(nextTrip);
              }}
            />
          ))}
        </div>
      ) : null}

      <TripQuizModal
        tripName={quiz.activeTrip?.name}
        tripDate={quiz.activeTrip?.displayDate}
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
