import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import {
  useCreateInspectionProperty,
  useInspectionComplexNames,
} from '@/domains/inspection/hooks/inspection-queries';
import { buildDeviceInspectionPropertyEditPath } from '@/lib/routing/route-builders';

type AddPropertyFormProps = {
  device: DeviceType;
  /** Undefined while the owning visit is still loading. */
  areaId: string | undefined;
  visitId: string;
  /** Appended to the edit path so that screen knows where to return. */
  editSearch?: string;
  triggerClassName?: string;
};

/**
 * A property can only be created with its complexName + name (the CDO
 * requires both), so "매물 추가" collects just those two inline, creates the
 * property, and hands off to ③-1 매물 편집 for everything else.
 */
export function AddPropertyForm({
  device,
  areaId,
  visitId,
  editSearch = '',
  triggerClassName,
}: AddPropertyFormProps) {
  const navigate = useNavigate();
  const createPropertyMutation = useCreateInspectionProperty(visitId);
  const [isAdding, setIsAdding] = useState(false);
  // Only fetch suggestions once the form is actually open.
  const complexNamesQuery = useInspectionComplexNames(
    isAdding ? visitId : undefined,
    'AREA'
  );
  const datalistId = useId();

  const [newComplexName, setNewComplexName] = useState('');
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAddProperty() {
    if (!newComplexName.trim() || !newName.trim()) {
      setAddError('단지명과 매물명을 모두 입력해 주세요.');

      return;
    }

    setAddError(null);

    try {
      const created = await createPropertyMutation.mutateAsync({
        complexName: newComplexName.trim(),
        name: newName.trim(),
      });

      if (areaId) {
        navigate(
          `${buildDeviceInspectionPropertyEditPath(
            device,
            areaId,
            visitId,
            created.propertyId
          )}${editSearch}`
        );
      }
    } catch {
      setAddError('매물을 추가하지 못했어요. 잠시 뒤 다시 시도해 주세요.');
    }
  }

  if (!isAdding) {
    return (
      <Button
        variant='ghost'
        className={triggerClassName}
        onClick={() => setIsAdding(true)}
      >
        + 매물 추가
      </Button>
    );
  }

  return (
    <div className='slcn-inspection-register-add-property'>
      <TextField
        label='단지/건물명'
        required
        list={datalistId}
        value={newComplexName}
        onChange={(event) => setNewComplexName(event.target.value)}
        hint='같은 이름이어야 회차 간 매물이 연결됩니다.'
      />
      <datalist id={datalistId}>
        {(complexNamesQuery.data ?? []).map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <TextField
        label='매물명'
        required
        value={newName}
        onChange={(event) => setNewName(event.target.value)}
      />
      {addError ? (
        <p className='slcn-inspection-register-step__error' role='alert'>
          {addError}
        </p>
      ) : null}
      <div className='slcn-inspection-register-add-property__actions'>
        <Button
          variant='ghost'
          onClick={() => {
            setIsAdding(false);
            setAddError(null);
          }}
        >
          취소
        </Button>
        <Button
          loading={createPropertyMutation.isPending}
          onClick={() => void handleAddProperty()}
        >
          추가하고 계속 쓰기
        </Button>
      </div>
    </div>
  );
}
