import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import type { TravelPhoto, TravelPhotoCdo } from '../types';

type AddPhotoModalProps = {
  isOpen: boolean;
  /** Already-uploaded travel photos to choose from. */
  photos: TravelPhoto[];
  /** Target the chosen photos should be linked to. */
  target?: { travelDayId?: string; travelPlaceId?: string };
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payloads: TravelPhotoCdo[]) => void;
};

const TAB_OPTIONS = [
  { label: '여행 사진에서 선택', value: 'pick' },
  { label: '새로 업로드', value: 'upload' },
];

export function AddPhotoModal({
  isOpen,
  photos,
  target,
  isSubmitting = false,
  errorMessage,
  onClose,
  onSubmit,
}: AddPhotoModalProps) {
  const [tab, setTab] = useState('pick');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTab('pick');
      setSelectedIds([]);
    }
  }, [isOpen]);

  function toggle(photoId: string) {
    setSelectedIds((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId]
    );
  }

  const selectedPhotos = photos.filter((photo) =>
    selectedIds.includes(photo.id)
  );
  const canSubmit = selectedPhotos.length > 0 && !isSubmitting;

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    onSubmit(
      selectedPhotos.map((photo) => ({
        photoFileId: photo.photoFileId,
        travelDayId: target?.travelDayId,
        travelPlaceId: target?.travelPlaceId,
      }))
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='사진 추가'
      align='left'
      titleVariant='heading'
      className='slcn-add-photo-modal'
    >
      <SegmentedControl
        value={tab}
        options={TAB_OPTIONS}
        onChange={setTab}
        className='slcn-add-photo-modal__tabs'
      />

      {tab === 'pick' ? (
        <>
          <p className='slcn-add-photo-modal__helper'>
            이미 올린 사진에서 골라 이 항목에 연결해요. 원본은 그대로 유지돼요.
          </p>

          {photos.length === 0 ? (
            <p className='slcn-add-photo-modal__empty'>
              아직 올린 사진이 없어요.
            </p>
          ) : (
            <ul className='slcn-add-photo-modal__grid'>
              {photos.map((photo) => {
                const selected = selectedIds.includes(photo.id);

                return (
                  <li key={photo.id}>
                    <button
                      type='button'
                      className='slcn-add-photo-modal__thumb slcn-travel-thumb'
                      data-selected={selected}
                      aria-pressed={selected}
                      aria-label={photo.caption ?? '사진 선택'}
                      onClick={() => toggle(photo.id)}
                    >
                      {selected ? (
                        <span
                          className='slcn-add-photo-modal__check'
                          aria-hidden='true'
                        >
                          ✓
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className='slcn-add-photo-modal__banner'>
            <span aria-hidden='true'>ⓘ</span> 선택한 사진 중 하나를{' '}
            <strong>대표 사진</strong>으로 지정할 수 있어요.
          </p>
        </>
      ) : (
        <p className='slcn-add-photo-modal__upload-empty'>
          새로 업로드 기능은 곧 제공될 예정이에요.
        </p>
      )}

      {errorMessage ? (
        <p className='slcn-add-photo-modal__error' role='alert'>
          {errorMessage}
        </p>
      ) : null}

      <div className='slcn-add-photo-modal__footer'>
        <Button
          type='button'
          variant='secondary'
          onClick={onClose}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          type='button'
          fullWidth
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!canSubmit || tab !== 'pick'}
        >
          선택한 사진 추가
        </Button>
      </div>
    </Modal>
  );
}
