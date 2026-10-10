import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { VisitRouteSection } from '@/domains/geo/components/VisitRouteSection';
import { AddPropertyForm } from '@/domains/inspection/components/AddPropertyForm';
import { DraftBadge } from '@/domains/inspection/components/DraftBadge';
import { InterestStars } from '@/domains/inspection/components/InterestStars';
import { buildPropertyDraftReason } from '@/domains/inspection/components/register/build-draft-reason';
import {
  useInspectionVisit,
  useReorderInspectionVisitProperties,
} from '@/domains/inspection/hooks/inspection-queries';
import { formatPropertyName } from '@/domains/inspection/utils/inspection-format';
import { getVisitPhase } from '@/domains/inspection/utils/visit-phase';
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
  const reorderMutation = useReorderInspectionVisitProperties(visitId);

  const detail = visitQuery.data;
  const showPropertyDrafts = detail
    ? getVisitPhase(detail) === 'REVISING'
    : false;
  const areaId = detail?.area.areaId;
  // G3: the API array order is the visit order — never re-sorted here.
  const properties = useMemo(() => detail?.properties ?? [], [detail]);
  const routeProperties = useMemo(
    () =>
      properties.map((property) => ({
        propertyId: property.propertyId,
        title: `${property.complexName} · ${formatPropertyName(property.name)}`,
        location: property.location,
      })),
    [properties]
  );

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

  // G4: swap two neighbours and send only those two rows (api.md §6 accepts
  // partial requests). They trade their existing sortOrder values; if the
  // values tie the server's tiebreak would decide, so send the whole list.
  function handleMove(index: number, direction: -1 | 1) {
    const other = index + direction;
    const current = properties[index];
    const neighbour = properties[other];

    if (!current || !neighbour) {
      return;
    }

    if (current.sortOrder === neighbour.sortOrder) {
      const next = [...properties];
      next[index] = neighbour;
      next[other] = current;
      reorderMutation.mutate(
        next.map((property, position) => ({
          id: property.propertyId,
          sortOrder: position,
        }))
      );

      return;
    }

    reorderMutation.mutate([
      { id: current.propertyId, sortOrder: neighbour.sortOrder },
      { id: neighbour.propertyId, sortOrder: current.sortOrder },
    ]);
  }

  return (
    <div className='slcn-inspection-register-step'>
      <h2 className='slcn-inspection-register-step__title'>확인 매물</h2>
      <p className='slcn-inspection-register-step__lead'>
        매물 없이도 계획을 저장할 수 있어요. 나중에 다시 들어와 이어서 쓸 수
        있어요.
      </p>
      <p className='slcn-inspection-register-step__hint'>
        매물마다 그 매물을 만든 시점에 활성화된 질문 구성으로 문답이 고정됩니다.
        나중에 질문이 바뀌어도 이미 만든 매물에는 반영되지 않아요.
      </p>

      {visitQuery.isLoading ? (
        <Skeleton className='slcn-inspection-register-properties-skeleton' />
      ) : null}

      {properties.length > 0 ? (
        <VisitRouteSection properties={routeProperties} />
      ) : null}

      {reorderMutation.isError ? (
        <p className='slcn-inspection-register-step__hint' role='alert'>
          순서를 바꾸지 못했어요. 원래 순서로 되돌렸어요. 잠시 뒤 다시 시도해
          주세요.
        </p>
      ) : null}

      {properties.length > 0 ? (
        <ul className='slcn-inspection-register-property-list'>
          {properties.map((property, index) => {
            const reason =
              property.status === 'DRAFT' && showPropertyDrafts
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
                    {property.complexName} · {formatPropertyName(property.name)}
                  </span>
                  {property.status === 'DRAFT' && showPropertyDrafts ? (
                    <span className='slcn-inspection-register-property-row__reason'>
                      <DraftBadge reason={reason || undefined} />
                    </span>
                  ) : null}
                </div>
                <div className='slcn-inspection-register-property-row__interest'>
                  <InterestStars level={property.interestLevel} />
                </div>
                <div className='slcn-inspection-register-property-row__actions'>
                  <span className='slcn-inspection-register-property-row__move'>
                    <button
                      type='button'
                      aria-label='위로 이동'
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                    >
                      ▲
                    </button>
                    <button
                      type='button'
                      aria-label='아래로 이동'
                      disabled={index === properties.length - 1}
                      onClick={() => handleMove(index, 1)}
                    >
                      ▼
                    </button>
                  </span>
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

      <AddPropertyForm device={device} areaId={areaId} visitId={visitId} />
    </div>
  );
}
