import { useQuery } from '@tanstack/react-query';
import { tripQueryKeys } from '../../../lib/api/query-keys';
import { tripApi } from '../api/trip-api';

export function useTripDetail(id: string | undefined) {
  return useQuery({
    queryKey: tripQueryKeys.detail(id ?? ''),
    queryFn: () => tripApi.getTripDetail(id ?? ''),
    enabled: Boolean(id),
  });
}
