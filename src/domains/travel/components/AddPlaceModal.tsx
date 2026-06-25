import { type FormEvent, useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import {
  CATEGORY_LABELS,
  type PlaceCategory,
  type TravelPlaceCdo,
} from '../types';
import { CategoryIcon } from './CategoryIcon';

type AddPlaceModalProps = {
  isOpen: boolean;
  dayNumber: number;
  travelDayId: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (args: { travelDayId: string; payload: TravelPlaceCdo }) => void;
};

const CATEGORY_ORDER: PlaceCategory[] = [
  'TOURIST_SPOT',
  'RESTAURANT',
  'CAFE',
  'ACCOMMODATION',
  'SHOPPING',
  'TRANSPORT',
  'ACTIVITY',
  'ETC',
];

export function AddPlaceModal({
  isOpen,
  dayNumber,
  travelDayId,
  isSubmitting = false,
  errorMessage,
  onClose,
  onSubmit,
}: AddPlaceModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('TOURIST_SPOT');
  const [description, setDescription] = useState('');
  const [photoCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('TOURIST_SPOT');
      setDescription('');
    }
  }, [isOpen]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !isSubmitting;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    onSubmit({
      travelDayId,
      payload: {
        travelDayId,
        name: trimmedName,
        category,
        description: description.trim() || undefined,
      },
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='장소 추가'
      align='left'
      titleVariant='heading'
      className='slcn-add-place-modal'
    >
      <p className='slcn-add-place-modal__subtitle'>
        <span className='slcn-add-place-modal__day'>{dayNumber}일차</span>에
        추가돼요.
      </p>

      <form className='slcn-add-place-modal__form' onSubmit={handleSubmit}>
        <div className='slcn-field'>
          <label htmlFor='add-place-name' className='slcn-field__label'>
            <span>장소명</span>
            <span aria-hidden='true'> *</span>
          </label>
          <div className='slcn-field__control'>
            <input
              id='add-place-name'
              className='slcn-field__input'
              placeholder='예) 불국사'
              value={name}
              onChange={(event) => setName(event.target.value)}
              // biome-ignore lint/a11y/noAutofocus: place name is the primary field of this modal
              autoFocus
              required
            />
          </div>
        </div>

        <fieldset className='slcn-add-place-modal__categories'>
          <legend className='slcn-field__label'>카테고리</legend>
          <div className='slcn-add-place-modal__category-grid'>
            {CATEGORY_ORDER.map((value) => {
              const active = value === category;

              return (
                <button
                  key={value}
                  type='button'
                  className='slcn-category-chip'
                  data-active={active}
                  aria-pressed={active}
                  onClick={() => setCategory(value)}
                >
                  <CategoryIcon
                    category={value}
                    className='slcn-category-chip__icon'
                  />
                  <span>{CATEGORY_LABELS[value]}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className='slcn-field'>
          <label htmlFor='add-place-desc' className='slcn-field__label'>
            <span>설명</span>
          </label>
          <textarea
            id='add-place-desc'
            className='slcn-field__textarea'
            placeholder='이 장소에서의 기억을 적어주세요'
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />
        </div>

        <div className='slcn-add-place-modal__photos'>
          <p className='slcn-field__label'>사진 · {photoCount}장 추가됨</p>
          <button
            type='button'
            className='slcn-add-place-modal__photo-add'
            disabled
            aria-disabled='true'
          >
            <span aria-hidden='true'>+</span>
            <span>추가</span>
          </button>
        </div>

        {errorMessage ? (
          <p className='slcn-add-place-modal__error' role='alert'>
            {errorMessage}
          </p>
        ) : null}

        <div className='slcn-add-place-modal__footer'>
          <Button
            type='button'
            variant='secondary'
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type='submit'
            fullWidth
            loading={isSubmitting}
            disabled={!canSubmit}
          >
            장소 저장
          </Button>
        </div>
      </form>
    </Modal>
  );
}
