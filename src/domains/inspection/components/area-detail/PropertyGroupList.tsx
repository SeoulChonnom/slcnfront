import type { DeviceType } from '@/app/router/route-constants';
import { LinkButton } from '@/components/ui/Button';
import { PlusIcon } from '@/domains/inspection/components/area-detail/icons';
import { PropertyRow } from '@/domains/inspection/components/area-detail/PropertyRow';
import type { ViewedPropertyDetail } from '@/domains/inspection/types';
import { buildDeviceInspectionPropertyEditPath } from '@/lib/routing/route-builders';

type PropertyGroupListProps = {
  device: DeviceType;
  areaId: string;
  visitId: string;
  properties: ViewedPropertyDetail[];
};

type ComplexGroup = {
  complexName: string;
  properties: ViewedPropertyDetail[];
};

/**
 * §1.1 / §1.4: `complexName` is not an entity — it only exists as a display
 * grouping over `ViewedProperty` rows, in server sort order (the property
 * list is already `sortOrder` ascending within a visit), never re-sorted
 * alphabetically. The heading itself is never a link — there is no page for
 * a complex name to go to (screen_design.md §1.1).
 */
function groupByComplexName(
  properties: ViewedPropertyDetail[]
): ComplexGroup[] {
  const groups: ComplexGroup[] = [];

  for (const property of properties) {
    const existing = groups.find(
      (group) => group.complexName === property.complexName
    );
    if (existing) {
      existing.properties.push(property);
    } else {
      groups.push({
        complexName: property.complexName,
        properties: [property],
      });
    }
  }

  return groups;
}

export function PropertyGroupList({
  device,
  areaId,
  visitId,
  properties,
}: PropertyGroupListProps) {
  if (properties.length === 0) {
    // §36 / fe_implementation_decisions.md §4: a zero-property visit is not
    // a defect — it's a completed "neighborhood-only" record.
    return (
      <div className='slcn-inspection-area-detail-empty-properties'>
        <p className='slcn-inspection-area-detail-empty-properties__title'>
          이 날은 매물을 보지 않았습니다
        </p>
        <p className='slcn-inspection-area-detail-empty-properties__body'>
          동네만 확인한 임장입니다. 이 상태로도 완료된 기록입니다.
        </p>
      </div>
    );
  }

  const groups = groupByComplexName(properties);
  const complexCount = groups.length;

  return (
    <div className='slcn-inspection-area-detail-properties'>
      <div className='slcn-inspection-area-detail-properties__head'>
        <h2 className='slcn-inspection-area-detail-properties__title'>
          확인 매물
        </h2>
        <span className='slcn-inspection-area-detail-properties__count'>
          단지 {complexCount}곳 · 매물 {properties.length}건
        </span>
        <LinkButton
          to={buildDeviceInspectionPropertyEditPath(
            device,
            areaId,
            visitId,
            'new'
          )}
          variant='secondary'
          size='sm'
          className='slcn-inspection-area-detail-properties__add'
        >
          <PlusIcon /> 매물 추가
        </LinkButton>
      </div>

      {groups.map((group) => (
        <div
          key={group.complexName}
          className='slcn-inspection-area-detail-complex'
        >
          <div className='slcn-inspection-area-detail-complex__head'>
            <h3 className='slcn-inspection-area-detail-complex__name'>
              {group.complexName}
            </h3>
            <span className='slcn-inspection-area-detail-complex__count'>
              매물 {group.properties.length}건
            </span>
          </div>
          <div className='slcn-inspection-area-detail-complex__rows'>
            {group.properties.map((property) => (
              <PropertyRow
                key={property.propertyId}
                device={device}
                areaId={areaId}
                property={property}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
