import type { DayFormRow } from '@/domains/travel/hooks/useTravelRegisterForm';
import { formatDisplayDate } from '@/domains/travel/mappers/travel-mappers';
import { CATEGORY_LABELS, type PlaceCategory } from '@/domains/travel/types';

type TravelDayEditorProps = {
  day: DayFormRow;
  onAddPlace: (dayLocalId: string) => void;
  onRemovePlace: (dayLocalId: string, placeLocalId: string) => void;
  onUpdatePlace: (
    dayLocalId: string,
    placeLocalId: string,
    field: 'name' | 'category' | 'memo',
    value: string
  ) => void;
};

const PLACE_CATEGORIES = Object.entries(CATEGORY_LABELS) as [
  PlaceCategory,
  string,
][];

export function TravelDayEditor({
  day,
  onAddPlace,
  onRemovePlace,
  onUpdatePlace,
}: TravelDayEditorProps) {
  return (
    <div className='slcn-travel-day-editor'>
      <div className='slcn-travel-day-editor__header'>
        <span className='slcn-travel-day-editor__day-pill'>
          {day.dayNumber}일차
        </span>
        <span className='slcn-travel-day-editor__date'>
          {formatDisplayDate(day.date)}
        </span>
      </div>

      <div className='slcn-travel-day-editor__places'>
        {day.places.map((place, idx) => {
          const nameInputId = `${place.localId}-name`;
          const memoInputId = `${place.localId}-memo`;

          return (
            <div
              key={place.localId}
              className='slcn-travel-day-editor__place-row'
            >
              <div className='slcn-travel-day-editor__place-num'>{idx + 1}</div>
              <div className='slcn-travel-day-editor__place-fields'>
                <div className='slcn-field'>
                  <label htmlFor={nameInputId} className='slcn-visually-hidden'>
                    장소명
                  </label>
                  <div className='slcn-field__control'>
                    <input
                      id={nameInputId}
                      type='text'
                      className='slcn-field__input'
                      placeholder='예) 경복궁'
                      value={place.name}
                      onChange={(e) =>
                        onUpdatePlace(
                          day.localId,
                          place.localId,
                          'name',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className='slcn-travel-day-editor__category-chips'>
                  {PLACE_CATEGORIES.map(([value, label]) => (
                    <button
                      key={value}
                      type='button'
                      className='slcn-travel-day-editor__category-chip'
                      data-selected={place.category === value}
                      onClick={() =>
                        onUpdatePlace(
                          day.localId,
                          place.localId,
                          'category',
                          place.category === value ? '' : value
                        )
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className='slcn-field'>
                  <label htmlFor={memoInputId} className='slcn-visually-hidden'>
                    메모
                  </label>
                  <div className='slcn-field__control'>
                    <input
                      id={memoInputId}
                      type='text'
                      className='slcn-field__input'
                      placeholder='예) 노을이 예뻤어요'
                      value={place.memo}
                      onChange={(e) =>
                        onUpdatePlace(
                          day.localId,
                          place.localId,
                          'memo',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <button
                type='button'
                className='slcn-travel-day-editor__place-remove'
                aria-label='장소 삭제'
                onClick={() => onRemovePlace(day.localId, place.localId)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <button
        type='button'
        className='slcn-travel-day-editor__add-place'
        onClick={() => onAddPlace(day.localId)}
      >
        <span aria-hidden='true'>+</span> 장소 추가
      </button>
    </div>
  );
}
