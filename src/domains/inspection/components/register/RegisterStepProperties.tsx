import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { DraftBadge } from '@/domains/inspection/components/DraftBadge';
import { InterestStars } from '@/domains/inspection/components/InterestStars';
import { buildPropertyDraftReason } from '@/domains/inspection/components/register/build-draft-reason';
import {
  useCreateInspectionProperty,
  useInspectionComplexNames,
  useInspectionVisit,
  useReorderInspectionVisitProperties,
} from '@/domains/inspection/hooks/inspection-queries';
import { buildDeviceInspectionPropertyEditPath } from '@/lib/routing/route-builders';

type RegisterStepPropertiesProps = {
  device: DeviceType;
  visitId: string;
};

export function RegisterStepProperties({
  device,
  visitId,
}: RegisterStepPropertiesProps) {
  const navigate = useNavigate();
  const visitQuery = useInspectionVisit(visitId);
  const createPropertyMutation = useCreateInspectionProperty(visitId);
  const reorderMutation = useReorderInspectionVisitProperties(visitId);
  const complexNamesQuery = useInspectionComplexNames(visitId, 'AREA');

  const [isAdding, setIsAdding] = useState(false);
  const [newComplexName, setNewComplexName] = useState('');
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const detail = visitQuery.data;
  const areaId = detail?.area.areaId;
  const properties = detail
    ? [...detail.properties].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

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
          buildDeviceInspectionPropertyEditPath(
            device,
            areaId,
            visitId,
            created.propertyId
          )
        );
      }
    } catch {
      setAddError('매물을 추가하지 못했어요. 잠시 뒤 다시 시도해 주세요.');
    }
  }

  function handleDragEnd(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) {
      return;
    }

    const next = [...properties];
    const [moved] = next.splice(fromIndex, 1);

    if (!moved) {
      return;
    }

    next.splice(toIndex, 0, moved);
    reorderMutation.mutate(
      next.map((property, index) => ({
        id: property.propertyId,
        sortOrder: index,
      }))
    );
  }

  return (
    <div className='slcn-inspection-register-step'>
      <h2 className='slcn-inspection-register-step__title'>확인 매물</h2>
      <p className='slcn-inspection-register-step__lead'>
        매물 없이도 완료할 수 있어요. 나중에 다시 들어와 이어서 쓸 수 있어요.
      </p>
      <p className='slcn-inspection-register-step__hint'>
        매물마다 그 매물을 만든 시점에 활성화된 질문 구성으로 문답이 고정됩니다.
        나중에 질문이 바뀌어도 이미 만든 매물에는 반영되지 않아요.
      </p>

      {visitQuery.isLoading ? (
        <Skeleton className='slcn-inspection-register-properties-skeleton' />
      ) : null}

      {properties.length > 0 ? (
        <ul className='slcn-inspection-register-property-list'>
          {properties.map((property, index) => {
            const reason =
              property.status === 'DRAFT'
                ? buildPropertyDraftReason(property.incompleteSummary)
                : null;

            return (
              <li
                key={property.propertyId}
                className='slcn-inspection-register-property-row'
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData('text/plain', String(index))
                }
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const fromIndex = Number(
                    event.dataTransfer.getData('text/plain')
                  );
                  handleDragEnd(fromIndex, index);
                }}
              >
                <span
                  className='slcn-inspection-register-property-row__handle'
                  aria-hidden='true'
                >
                  ⠿
                </span>
                <div className='slcn-inspection-register-property-row__main'>
                  <span className='slcn-inspection-register-property-row__name'>
                    {property.complexName} · {property.name}
                  </span>
                  {property.status === 'DRAFT' ? (
                    <span className='slcn-inspection-register-property-row__reason'>
                      <DraftBadge reason={reason || undefined} />
                    </span>
                  ) : null}
                </div>
                <div className='slcn-inspection-register-property-row__interest'>
                  <InterestStars level={property.interestLevel} />
                </div>
                <div className='slcn-inspection-register-property-row__actions'>
                  {areaId ? (
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() =>
                        navigate(
                          buildDeviceInspectionPropertyEditPath(
                            device,
                            areaId,
                            visitId,
                            property.propertyId
                          )
                        )
                      }
                    >
                      {property.status === 'DRAFT' ? '이어서 쓰기' : '수정'}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : !visitQuery.isLoading ? (
        <p className='slcn-inspection-register-step__hint'>
          아직 추가한 매물이 없어요.
        </p>
      ) : null}

      {!isAdding ? (
        <Button variant='ghost' onClick={() => setIsAdding(true)}>
          + 매물 추가
        </Button>
      ) : (
        <div className='slcn-inspection-register-add-property'>
          <TextField
            label='단지/건물명'
            required
            list='register-complex-name-options'
            value={newComplexName}
            onChange={(event) => setNewComplexName(event.target.value)}
            hint='같은 이름이어야 회차 간 매물이 연결됩니다.'
          />
          <datalist id='register-complex-name-options'>
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
      )}
    </div>
  );
}
