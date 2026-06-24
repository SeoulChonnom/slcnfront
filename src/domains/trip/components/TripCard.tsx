import { Button } from '../../../components/ui/Button';
import type { TripListItem } from '../types';

type TripCardProps = {
  trip: TripListItem;
  logoObjectUrl?: string | null;
  onOpenQuiz: (trip: TripListItem) => void;
};

export function TripCard({ trip, logoObjectUrl, onOpenQuiz }: TripCardProps) {
  return (
    <div className='slcn-trip-card'>
      <div className='slcn-trip-card__thumb slcn-stripe'>
        {logoObjectUrl ? (
          <img
            src={logoObjectUrl}
            alt={`${trip.name} 로고`}
            className='slcn-trip-card__thumb-img'
          />
        ) : (
          <svg
            width='34'
            height='34'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#D8A9BC'
            strokeWidth='1.6'
            aria-hidden='true'
          >
            <path d='M12 21s-7-5.3-7-11a7 7 0 0114 0c0 5.7-7 11-7 11z' />
            <circle cx='12' cy='10' r='2.4' />
          </svg>
        )}
        <span className='slcn-trip-card__lock-badge'>
          <svg
            width='9'
            height='9'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#fff'
            strokeWidth='2.5'
            aria-hidden='true'
          >
            <rect x='5' y='11' width='14' height='9' rx='2' />
            <path d='M8 11V8a4 4 0 018 0v3' />
          </svg>
          퀴즈
        </span>
      </div>
      <div className='slcn-trip-card__body'>
        <div className='slcn-trip-card__meta'>
          <span className='slcn-trip-card__date'>{trip.displayDate}</span>
          {trip.type ? (
            <span className='slcn-trip-card__type-badge'>{trip.type}</span>
          ) : null}
        </div>
        <h3 className='slcn-trip-card__title'>{trip.name}</h3>
        {trip.description ? (
          <p className='slcn-trip-card__desc'>{trip.description}</p>
        ) : null}
        <div className='slcn-trip-card__actions'>
          <Button onClick={() => onOpenQuiz(trip)}>
            <svg
              width='15'
              height='15'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.2'
              aria-hidden='true'
            >
              <rect x='5' y='11' width='14' height='9' rx='2' />
              <path d='M8 11V8a4 4 0 018 0v3' />
            </svg>
            퀴즈 풀기
          </Button>
        </div>
      </div>
    </div>
  );
}
