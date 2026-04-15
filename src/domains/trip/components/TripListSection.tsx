import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/auth-store';
import {
  buildDeviceTripDetailPath,
  buildDeviceTripRegisterPath,
} from '../../../lib/routing/route-builders';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LinkButton } from '../../../components/ui/Button';
import { PageSectionHeader } from '../../../components/ui/PageSectionHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { DeviceType } from '../../../app/router/route-constants';
import { useTripList } from '../hooks/useTripList';
import { useTripQuiz } from '../hooks/useTripQuiz';
import { TripCard } from './TripCard';
import { TripQuizModal } from './TripQuizModal';

type TripListSectionProps = {
  device: DeviceType;
};

export function TripListSection({ device }: TripListSectionProps) {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useTripList();
  const quiz = useTripQuiz();
  const isAdmin = useAuthStore((state) =>
    state.userInfo?.roleList.includes('admin'),
  );

  return (
    <section className="slcn-trip-list-section">
      <PageSectionHeader
        title="서울 촌놈 나들이 기록"
        description="기록을 선택해서 나들이 기록을 확인해보세요"
        action={
          isAdmin ? (
            <LinkButton to={buildDeviceTripRegisterPath(device)}>
              새 나들이 기록하기
            </LinkButton>
          ) : null
        }
      />

      {isPending ? (
        <div className="slcn-trip-list-section__grid" aria-label="loading">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="slcn-trip-card__skeleton" />
          ))}
        </div>
      ) : null}

      {!isPending && isError ? (
        <ErrorState
          title="나들이 기록을 불러오지 못했어요."
          description="잠시 후 다시 시도해주세요."
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError && data?.length === 0 ? (
        <EmptyState
          title="아직 등록된 나들이가 없어요."
          description="새 나들이 기록하기로 첫 번째 추억을 추가해주세요."
          actionLabel={isAdmin ? '기록하러 가기' : undefined}
          actionTo={isAdmin ? buildDeviceTripRegisterPath(device) : undefined}
        />
      ) : null}

      {!isPending && !isError && data && data.length > 0 ? (
        <div className="slcn-trip-list-section__grid">
          {data.map((trip) => (
            <TripCard
              key={trip.id || trip.date}
              trip={trip}
              onOpenQuiz={quiz.openQuiz}
            />
          ))}
        </div>
      ) : null}

      <TripQuizModal
        trip={quiz.activeTrip}
        isOpen={quiz.isOpen}
        feedback={quiz.feedback}
        onClose={quiz.closeQuiz}
        onAnswer={(answerIndex) => {
          quiz.submitAnswer(answerIndex);
        }}
        onConfirmSuccess={() => {
          if (!quiz.activeTrip) {
            return;
          }

          navigate(buildDeviceTripDetailPath(device, quiz.activeTrip.date));
          quiz.closeQuiz();
        }}
      />
    </section>
  );
}
