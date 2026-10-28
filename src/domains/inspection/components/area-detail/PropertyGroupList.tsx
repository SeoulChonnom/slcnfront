import type { DeviceType } from '@/app/router/route-constants';
import { AddPropertyForm } from '@/domains/inspection/components/AddPropertyForm';
import { PropertyRow } from '@/domains/inspection/components/area-detail/PropertyRow';
import type { ViewedPropertyDetail } from '@/domains/inspection/types';
import { PROPERTY_EDIT_FROM_AREA_SEARCH } from '@/domains/inspection/utils/property-edit-return';
import type { VisitPhase } from '@/domains/inspection/utils/visit-phase';

type PropertyGroupListProps = {
  device: DeviceType;
  areaId: string;
  visitId: string;
  properties: ViewedPropertyDetail[];
  /** Property draft badges only show while the parent visit is being revised. */
  visitPhase: VisitPhase;
};

type ComplexGroup = {
  complexName: string;
  properties: ViewedPropertyDetail[];
};

/**
 * §1.1 / §1.4 + FD1: `complexName` is not an entity — it only exists as a
 * display grouping over `ViewedProperty` rows, in the API array order (never
 * re-sorted). Only CONSECUTIVE rows with the same name share a group, so
 * A, B, A renders three groups; that keeps the list in step with the route
 * map's numbering (which also merges only consecutive same-address stops).
 * The heading itself is never a link — there is no page for a complex name
 * to go to (screen_design.md §1.1).
 */
function groupByComplexName(
  properties: ViewedPropertyDetail[]
): ComplexGroup[] {
  const groups: ComplexGroup[] = [];

  for (const property of properties) {
    const last = groups.at(-1);
    if (last && last.complexName === property.complexName) {
      last.properties.push(property);
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
  visitPhase,
}: PropertyGroupListProps) {
  const addPropertyForm = (
    <div className='slcn-inspection-area-detail-properties__add'>
      <AddPropertyForm
        device={device}
        areaId={areaId}
        visitId={visitId}
        editSearch={PROPERTY_EDIT_FROM_AREA_SEARCH}
        triggerClassName='slcn-inspection-area-detail-properties__add-trigger'
      />
    </div>
  );

  if (properties.length === 0) {
    // §36 / fe_implementation_decisions.md §4: a zero-property visit is not
    // a defect — it's a completed "neighborhood-only" record.
    return (
      <>
        <div className='slcn-inspection-area-detail-empty-properties'>
          <p className='slcn-inspection-area-detail-empty-properties__title'>
            이 날은 매물을 보지 않았습니다
          </p>
          <p className='slcn-inspection-area-detail-empty-properties__body'>
            동네만 확인한 임장입니다. 이 상태로도 완료된 기록입니다.
          </p>
        </div>
        {addPropertyForm}
      </>
    );
  }

  const groups = groupByComplexName(properties);
  const complexCount = new Set(properties.map((p) => p.complexName)).size;

  return (
    <div className='slcn-inspection-area-detail-properties'>
      <div className='slcn-inspection-area-detail-properties__head'>
        <h2 className='slcn-inspection-area-detail-properties__title'>
          확인 매물
        </h2>
        <span className='slcn-inspection-area-detail-properties__count'>
          단지 {complexCount}곳 · 매물 {properties.length}건
        </span>
      </div>

      {groups.map((group) => (
        <div
          key={group.properties[0].propertyId}
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
                visitPhase={visitPhase}
              />
            ))}
          </div>
        </div>
      ))}

      {addPropertyForm}
    </div>
  );
}
