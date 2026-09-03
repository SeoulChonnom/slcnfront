import { useParams } from 'react-router-dom';
import { TravelDetailSection } from '@/domains/travel/components/TravelDetailSection';
import { useTravelDetail } from '@/domains/travel/hooks/useTravelDetail';

export function TravelDetailPage() {
  const params = useParams<{ id: string }>();
  const travelDetailQuery = useTravelDetail(params.id);

  return (
    <TravelDetailSection
      device='mobile'
      travel={travelDetailQuery.data}
      isPending={travelDetailQuery.isPending}
      isError={travelDetailQuery.isError}
      onRetry={() => {
        void travelDetailQuery.refetch();
      }}
    />
  );
}
