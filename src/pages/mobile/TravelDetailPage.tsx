import { useParams } from 'react-router-dom';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { TravelDetailSection } from '../../domains/travel/components/TravelDetailSection';
import { useTravelDetail } from '../../domains/travel/hooks/useTravelDetail';

export function TravelDetailPage() {
  const params = useParams<{ id: string }>();
  const travelDetailQuery = useTravelDetail(params.id);

  if (travelDetailQuery.isPending) {
    return <Skeleton className='slcn-travel-detail-section__skeleton' />;
  }

  if (travelDetailQuery.isError || !travelDetailQuery.data) {
    return (
      <ErrorState
        title='여행 상세를 불러오지 못했어요.'
        description='잠시 후 다시 시도해주세요.'
        onRetry={() => {
          void travelDetailQuery.refetch();
        }}
      />
    );
  }

  return (
    <TravelDetailSection device='mobile' travel={travelDetailQuery.data} />
  );
}
