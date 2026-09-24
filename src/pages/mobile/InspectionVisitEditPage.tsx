import { useParams } from 'react-router-dom';
import { InspectionVisitEditSection } from '@/domains/inspection/components/InspectionVisitEditSection';

export function InspectionVisitEditPage() {
  const params = useParams<{ areaId: string; visitId: string }>();

  return (
    <InspectionVisitEditSection
      device='mobile'
      areaId={params.areaId ?? ''}
      visitId={params.visitId ?? ''}
    />
  );
}
