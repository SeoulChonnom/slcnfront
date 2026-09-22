import type { DeviceType } from '@/app/router/route-constants';

type InspectionQuestionsSectionProps = {
  device: DeviceType;
};

/**
 * Shell only — filled in by the question-management implementation agent per
 * screen_design.md §5.5. The route itself is guarded by `RequireRole('admin')`
 * (fe_implementation_decisions.md §2); this component can assume it only
 * renders for an admin.
 */
export function InspectionQuestionsSection({
  device,
}: InspectionQuestionsSectionProps) {
  return (
    <section data-device={device}>
      <h1>임장 질문 관리</h1>
    </section>
  );
}
