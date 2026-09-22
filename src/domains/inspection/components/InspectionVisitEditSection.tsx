import type { DeviceType } from '@/app/router/route-constants';

type InspectionVisitEditSectionProps = {
  device: DeviceType;
};

/**
 * Shell only — filled in by the visit-edit implementation agent per
 * screen_design.md §5.4 (basic info/tags/photos edit, status transition).
 */
export function InspectionVisitEditSection({
  device,
}: InspectionVisitEditSectionProps) {
  return (
    <section data-device={device}>
      <h1>임장 기록 수정</h1>
    </section>
  );
}
