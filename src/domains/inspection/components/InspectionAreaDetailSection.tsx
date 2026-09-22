import type { DeviceType } from '@/app/router/route-constants';

type InspectionAreaDetailSectionProps = {
  device: DeviceType;
};

/**
 * Shell only — filled in by the area-detail implementation agent per
 * screen_design.md §5.2/§4.5 (visit rail + `?visit=` sync).
 */
export function InspectionAreaDetailSection({
  device,
}: InspectionAreaDetailSectionProps) {
  return (
    <section data-device={device}>
      <h1>임장 지역 상세</h1>
    </section>
  );
}
