import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/domains/trip/api/trip-api';
import { tripQueryKeys } from '@/lib/api/query-keys';

export function useTripList() {
  return useQuery({
    queryKey: tripQueryKeys.list(),
    queryFn: () => tripApi.getTripList(),
  });
}
