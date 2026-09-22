import { useParams } from 'react-router-dom';
import { InspectionAreaDetailSection } from '@/domains/inspection/components/InspectionAreaDetailSection';

export function InspectionAreaDetailPage() {
  const params = useParams<{ areaId: string }>();

  return (
    <InspectionAreaDetailSection device='main' areaId={params.areaId ?? ''} />
  );
}
