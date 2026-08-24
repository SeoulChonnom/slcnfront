import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/domains/trip/api/trip-api';
import { tripQueryKeys } from '@/lib/api/query-keys';

export function useTripDetail(id: string | undefined) {
  return useQuery({
    queryKey: tripQueryKeys.detail(id ?? ''),
    queryFn: () => tripApi.getTripDetail(id ?? ''),
    enabled: Boolean(id),
  });
}
