import { useParams } from 'react-router-dom';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { TripDetailSection } from '../../domains/trip/components/TripDetailSection';
import { useTripDetail } from '../../domains/trip/hooks/useTripDetail';

export function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const tripDetailQuery = useTripDetail(params.id);

  if (tripDetailQuery.isPending) {
    return <Skeleton className='slcn-trip-detail-section__map-skeleton' />;
  }

  if (tripDetailQuery.isError || !tripDetailQuery.data) {
    return (
      <ErrorState
        title='나들이 상세를 불러오지 못했어요.'
        description='상세 경로 또는 파일 경로를 다시 확인해주세요.'
        onRetry={() => {
          void tripDetailQuery.refetch();
        }}
      />
    );
  }

  return <TripDetailSection tripDetail={tripDetailQuery.data} />;
}
