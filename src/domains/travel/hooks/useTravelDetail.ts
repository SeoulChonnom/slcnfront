import { useQuery } from '@tanstack/react-query';
import { travelQueryKeys } from '../../../lib/api/query-keys';
import { travelApi } from '../api/travel-api';

export function useTravelDetail(id: string | undefined) {
  return useQuery({
    queryKey: travelQueryKeys.detail(id ?? ''),
    queryFn: () => travelApi.getTravelDetail(id ?? ''),
    enabled: Boolean(id),
  });
}
