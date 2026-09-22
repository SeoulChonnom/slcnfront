import type { DeviceType } from '@/app/router/route-constants';

type InspectionPropertyEditSectionProps = {
  device: DeviceType;
};

/**
 * Shell only — filled in by the property-edit implementation agent per
 * screen_design.md §5.4 (interest level, answers, completion validation).
 */
export function InspectionPropertyEditSection({
  device,
}: InspectionPropertyEditSectionProps) {
  return (
    <section data-device={device}>
      <h1>매물 수정</h1>
    </section>
  );
}
