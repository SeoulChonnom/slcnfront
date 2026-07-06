import type { TravelDay } from '../types';
import { TravelPlaceItem } from './TravelPlaceItem';

type TravelDayListProps = {
  days: TravelDay[];
  onAddPlace: (day: TravelDay) => void;
};

export function TravelDayList({ days, onAddPlace }: TravelDayListProps) {
  if (days.length === 0) {
    return (
      <p className='slcn-travel-detail__empty'>아직 날짜별 기록이 없어요.</p>
    );
  }

  return (
    <div className='slcn-travel-day-list'>
      {days.map((day) => (
        <article key={day.id} className='slcn-travel-day'>
          <header className='slcn-travel-day__head'>
            <span className='slcn-travel-day__pill'>Day {day.dayNumber}</span>
            <span className='slcn-travel-day__date'>{day.displayDate}</span>
            {day.title ? (
              <span className='slcn-travel-day__title'>{day.title}</span>
            ) : null}
          </header>

          {day.memo ? (
            <p className='slcn-travel-day__memo'>{day.memo}</p>
          ) : null}

          {day.places.length > 0 ? (
            <ul className='slcn-travel-day__places'>
              {day.places.map((place) => (
                <TravelPlaceItem key={place.id} place={place} />
              ))}
            </ul>
          ) : (
            <p className='slcn-travel-day__no-place'>
              이 날의 장소를 추가해보세요.
            </p>
          )}

          <button
            type='button'
            className='slcn-travel-day__add'
            onClick={() => onAddPlace(day)}
          >
            <span aria-hidden='true'>+</span> 장소 추가
          </button>
        </article>
      ))}
    </div>
  );
}
