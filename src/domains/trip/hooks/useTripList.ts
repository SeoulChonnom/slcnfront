import { useQuery } from '@tanstack/react-query';
import { tripQueryKeys } from '../../../lib/api/query-keys';
import { tripApi } from '../api/trip-api';

export function useTripList() {
  return useQuery({
    queryKey: tripQueryKeys.list(),
    queryFn: () => tripApi.getTripList(),
  });
}
