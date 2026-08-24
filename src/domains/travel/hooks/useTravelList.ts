import { useQuery } from '@tanstack/react-query';
import { travelApi } from '@/domains/travel/api/travel-api';
import { travelQueryKeys } from '@/lib/api/query-keys';

export function useTravelList() {
  return useQuery({
    queryKey: travelQueryKeys.list(),
    queryFn: () => travelApi.getTravelList(),
  });
}
