import type { DeviceType } from '@/app/router/route-constants';

type InspectionPropertyDetailSectionProps = {
  device: DeviceType;
};

/**
 * Shell only — filled in by the property-detail implementation agent per
 * screen_design.md §5.3 (breadcrumb, cross-visit strip, answer rendering).
 */
export function InspectionPropertyDetailSection({
  device,
}: InspectionPropertyDetailSectionProps) {
  return (
    <section data-device={device}>
      <h1>매물 상세</h1>
    </section>
  );
}
