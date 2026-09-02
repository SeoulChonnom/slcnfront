import { useParams } from 'react-router-dom';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { TravelDetailSection } from '@/domains/travel/components/TravelDetailSection';
import { useTravelDetail } from '@/domains/travel/hooks/useTravelDetail';

export function TravelDetailPage() {
  const params = useParams<{ id: string }>();
  const travelDetailQuery = useTravelDetail(params.id);

  if (travelDetailQuery.isPending) {
    return <Skeleton className='slcn-travel-detail-section__skeleton' />;
  }

  if (travelDetailQuery.isError || !travelDetailQuery.data) {
    return (
      <ErrorState
        headingLevel={1}
        title='여행을 불러오지 못했어요.'
        onRetry={() => {
          void travelDetailQuery.refetch();
        }}
      />
    );
  }

  return <TravelDetailSection device='main' travel={travelDetailQuery.data} />;
}
