import { useParams } from 'react-router-dom';
import { InspectionPropertyEditSection } from '@/domains/inspection/components/InspectionPropertyEditSection';

export function InspectionPropertyEditPage() {
  const params = useParams<{
    areaId: string;
    visitId: string;
    propertyId: string;
  }>();

  return (
    <InspectionPropertyEditSection
      device='mobile'
      areaId={params.areaId ?? ''}
      visitId={params.visitId ?? ''}
      propertyId={params.propertyId ?? ''}
    />
  );
}
