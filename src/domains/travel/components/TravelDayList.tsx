import { TravelPlaceItem } from '@/domains/travel/components/TravelPlaceItem';
import type { TravelDay } from '@/domains/travel/types';

type TravelDayListProps = {
  days: TravelDay[];
  onAddPlace: (day: TravelDay) => void;
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** e.g. "2025-06-01" -> "화" */
function formatWeekdayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00+09:00`);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return WEEKDAY_LABELS[date.getDay()] ?? '';
}

/** e.g. "2025.06.01" -> "06.01" (drops the year, which the rail has no room for) */
function formatRailDate(displayDate: string): string {
  return displayDate.slice(5);
}

export function TravelDayList({ days, onAddPlace }: TravelDayListProps) {
  if (days.length === 0) {
    return (
      <p className='slcn-travel-detail__empty'>
        아직 날짜별 기록이 없어요. 여행 수정에서 날짜별로 남겨 보세요.
      </p>
    );
  }

  return (
    <div className='slcn-travel-day-list'>
      {days.map((day) => (
        <article key={day.id} className='slcn-travel-day'>
          {/* Rail: this list is already chronological, so the day number and
              date carry the wayfinding — no tab bar needed. */}
          <div className='slcn-travel-day__rail'>
            <span className='slcn-travel-day__rail-num'>
              Day {day.dayNumber}
            </span>
            <span className='slcn-travel-day__rail-date'>
              {formatRailDate(day.displayDate)} · {formatWeekdayLabel(day.date)}
            </span>
          </div>

          <div className='slcn-travel-day__body'>
            {day.title ? (
              <h3 className='slcn-travel-day__title'>{day.title}</h3>
            ) : null}

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
                이 날의 장소를 추가해 보세요.
              </p>
            )}

            <button
              type='button'
              className='slcn-travel-day__add'
              onClick={() => onAddPlace(day)}
            >
              <span aria-hidden='true'>+</span> 장소 추가
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
