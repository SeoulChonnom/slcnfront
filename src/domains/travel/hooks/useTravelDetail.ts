import { useQuery } from '@tanstack/react-query';
import { travelApi } from '@/domains/travel/api/travel-api';
import { travelQueryKeys } from '@/lib/api/query-keys';

export function useTravelDetail(id: string | undefined) {
  return useQuery({
    queryKey: travelQueryKeys.detail(id ?? ''),
    queryFn: () => travelApi.getTravelDetail(id ?? ''),
    enabled: Boolean(id),
  });
}
