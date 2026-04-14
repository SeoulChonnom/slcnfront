import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { TripListItem } from '../types';
import { useTripAssetUrl } from '../hooks/useTripAssetUrl';

type TripCardProps = {
  trip: TripListItem;
  onOpenQuiz: (trip: TripListItem) => void;
};

export function TripCard({ trip, onOpenQuiz }: TripCardProps) {
  const logoAsset = useTripAssetUrl(trip.logoPath);

  return (
    <Card className="slcn-trip-card" tone="default">
      <div className="slcn-trip-card__media">
        {logoAsset.objectUrl ? (
          <img
            src={logoAsset.objectUrl}
            alt={`${trip.name} 로고`}
            className="slcn-trip-card__image"
          />
        ) : (
          <Skeleton className="slcn-trip-card__skeleton" />
        )}
      </div>
      <div className="slcn-trip-card__body">
        <p className="slcn-trip-card__date display-hand">{trip.displayDate}</p>
        <h3 className="slcn-trip-card__title display-hand">{trip.name}</h3>
        <p className="slcn-trip-card__caption">{trip.quizTitle}</p>
      </div>
      <div className="slcn-trip-card__actions">
        <Button fullWidth onClick={() => onOpenQuiz(trip)}>
          퀴즈 풀고 지도 보기
        </Button>
      </div>
    </Card>
  );
}
