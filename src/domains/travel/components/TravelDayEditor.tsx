import type { ChangeEvent } from 'react';
import type { DayFormRow } from '../hooks/useTravelRegisterForm';
import { CATEGORY_LABELS, type PlaceCategory } from '../types';

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
  onDayCoverPhoto: (dayLocalId: string, file: File | null) => void;
};

function formatDisplayDate(isoDate: string): string {
  return isoDate.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1.$2.$3');
}

const PLACE_CATEGORIES = Object.entries(CATEGORY_LABELS) as [
  PlaceCategory,
  string,
][];

export function TravelDayEditor({
  day,
  onAddPlace,
  onRemovePlace,
  onUpdatePlace,
  onDayCoverPhoto,
}: TravelDayEditorProps) {
  function handleCoverPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onDayCoverPhoto(day.localId, file);
  }

  return (
    <div className='slcn-travel-day-editor'>
      <div className='slcn-travel-day-editor__header'>
        <span className='slcn-travel-day-editor__day-pill'>
          Day {day.dayNumber}
        </span>
        <span className='slcn-travel-day-editor__date'>
          {formatDisplayDate(day.date)}
        </span>
      </div>

      <div className='slcn-travel-day-editor__places'>
        {day.places.map((place, idx) => (
          <div
            key={place.localId}
            className='slcn-travel-day-editor__place-row'
          >
            <div className='slcn-travel-day-editor__place-num'>{idx + 1}</div>
            <div className='slcn-travel-day-editor__place-fields'>
              <div className='slcn-field'>
                <div className='slcn-field__control'>
                  <input
                    type='text'
                    className='slcn-field__input'
                    placeholder='장소명을 입력하세요'
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
                <div className='slcn-field__control'>
                  <input
                    type='text'
                    className='slcn-field__input'
                    placeholder='메모 (선택사항)'
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
        ))}
      </div>

      <div className='slcn-travel-day-editor__day-photo'>
        <label className='slcn-travel-day-editor__day-photo-label'>
          <span
            className='slcn-travel-day-editor__day-photo-icon'
            aria-hidden='true'
          >
            <svg
              aria-hidden='true'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
              <circle cx='8.5' cy='8.5' r='1.5' />
              <polyline points='21 15 16 10 5 21' />
            </svg>
          </span>
          {day.coverPhotoFile
            ? day.coverPhotoFile.name
            : '이 날의 대표 사진 추가'}
          <input
            type='file'
            accept='.jpg,.jpeg,.png'
            className='slcn-travel-day-editor__day-photo-input'
            onChange={handleCoverPhotoChange}
          />
        </label>
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
