import { useQuery } from '@tanstack/react-query';
import { travelQueryKeys } from '../../../lib/api/query-keys';
import { travelApi } from '../api/travel-api';

export function useTravelList() {
  return useQuery({
    queryKey: travelQueryKeys.list(),
    queryFn: () => travelApi.getTravelList(),
  });
}
