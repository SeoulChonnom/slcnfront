import type { DeviceType } from '@/app/router/route-constants';

type InspectionAreaListSectionProps = {
  device: DeviceType;
};

/**
 * Shell only — filled in by the area-list implementation agent per
 * screen_design.md §5.1. Renders the section title so the route is not blank
 * while that work lands.
 */
export function InspectionAreaListSection({
  device,
}: InspectionAreaListSectionProps) {
  return (
    <section data-device={device}>
      <h1>임장</h1>
    </section>
  );
}
