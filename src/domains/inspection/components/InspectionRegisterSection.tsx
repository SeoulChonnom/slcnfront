import type { DeviceType } from '@/app/router/route-constants';

type InspectionRegisterSectionProps = {
  device: DeviceType;
};

/**
 * Shell only — filled in by the register-flow implementation agent per
 * screen_design.md §5.4 and fe_implementation_decisions.md §5 (deferred
 * `visitedAt`-gated auto-save).
 */
export function InspectionRegisterSection({
  device,
}: InspectionRegisterSectionProps) {
  return (
    <section data-device={device}>
      <h1>임장 기록하기</h1>
    </section>
  );
}
