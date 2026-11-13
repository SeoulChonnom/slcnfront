import { useQuery } from '@tanstack/react-query';
import { houseApi } from '@/domains/house/api/house-api';
import { houseQueryKeys } from '@/lib/api/query-keys';

export function useHouseMeta() {
  return useQuery({
    queryKey: houseQueryKeys.meta(),
    queryFn: ({ signal }) => houseApi.getMeta(signal),
    staleTime: 60 * 60 * 1000,
  });
}
