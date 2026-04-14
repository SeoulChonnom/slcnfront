import { useQuery } from '@tanstack/react-query';
import { tripQueryKeys } from '../../../lib/api/query-keys';
import { tripApi } from '../api/trip-api';

export function useTripDetail(date: string | undefined) {
  return useQuery({
    queryKey: tripQueryKeys.detail(date ?? ''),
    queryFn: () => tripApi.getTripDetail(date ?? ''),
    enabled: Boolean(date),
  });
}
