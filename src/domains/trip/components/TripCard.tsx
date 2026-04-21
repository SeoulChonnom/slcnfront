import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { TripListItem } from '../types';

type TripCardProps = {
  trip: TripListItem;
  logoObjectUrl?: string | null;
  onOpenQuiz: (trip: TripListItem) => void;
};

export function TripCard({ trip, logoObjectUrl, onOpenQuiz }: TripCardProps) {
  const tags = [trip.displayDate, trip.quizResponses[0]?.answer]
    .filter(Boolean)
    .slice(0, 2);

  return (
    <Card className="slcn-trip-card" tone="default">
      <div className="slcn-trip-card__media">
        {logoObjectUrl ? (
          <img
            src={logoObjectUrl}
            alt={`${trip.name} 로고`}
            className="slcn-trip-card__image"
          />
        ) : (
          <Skeleton className="slcn-trip-card__skeleton" />
        )}
      </div>
      <div className="slcn-trip-card__body">
        <div className="slcn-trip-card__meta">
          <p className="slcn-trip-card__date display-hand">
            {trip.displayDate}
          </p>
          <span className="slcn-trip-card__lock">퀴즈</span>
        </div>
        <h3 className="slcn-trip-card__title display-hand">{trip.name}</h3>
        <p className="slcn-trip-card__caption">{trip.quizTitle}</p>
        <div className="slcn-trip-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="slcn-trip-card__tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="slcn-trip-card__actions">
        <Button fullWidth onClick={() => onOpenQuiz(trip)}>
          퀴즈 풀기
        </Button>
      </div>
    </Card>
  );
}
