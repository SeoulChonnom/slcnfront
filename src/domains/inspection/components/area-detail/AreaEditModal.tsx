import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextareaField, TextField } from '@/components/ui/TextField';
import { useUpdateInspectionArea } from '@/domains/inspection/hooks/inspection-queries';
import type { InspectionArea } from '@/domains/inspection/types';

type AreaEditModalProps = {
  isOpen: boolean;
  area: InspectionArea;
  onClose: () => void;
};

/**
 * There is no dedicated area-edit route (fe_implementation_decisions.md §2's
 * confirmed 7 routes stop at area detail) — screen_design.md §5.2 only asks
 * for a "[지역 정보 수정]" affordance, so this stays an in-place modal built
 * from the already-existing `useUpdateInspectionArea` mutation rather than a
 * new page.
 */
export function AreaEditModal({ isOpen, area, onClose }: AreaEditModalProps) {
  const [name, setName] = useState(area.name);
  const [description, setDescription] = useState(area.description ?? '');
  const nameId = useId();
  const descriptionId = useId();
  const updateArea = useUpdateInspectionArea(area.areaId);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !updateArea.isPending;

  const handleSubmit = async () => {
    if (!canSave) {
      return;
    }

    await updateArea.mutateAsync({
      name: trimmedName,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='지역 정보 수정'
      titleVariant='heading'
      align='left'
      className='slcn-inspection-area-edit-modal'
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <TextField
          id={nameId}
          label='지역명'
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
        <TextareaField
          id={descriptionId}
          label='지역 설명'
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {updateArea.isError ? (
          <p className='slcn-inspection-area-edit-modal__error' role='alert'>
            지역 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : null}
        <div className='slcn-inspection-area-edit-modal__actions'>
          <Button type='button' variant='secondary' onClick={onClose}>
            취소
          </Button>
          <Button
            type='submit'
            loading={updateArea.isPending}
            disabled={!canSave}
          >
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
}
