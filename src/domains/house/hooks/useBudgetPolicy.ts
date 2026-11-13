import { useQuery } from '@tanstack/react-query';
import { houseApi } from '@/domains/house/api/house-api';
import { houseQueryKeys } from '@/lib/api/query-keys';

export function useBudgetPolicy() {
  return useQuery({
    queryKey: houseQueryKeys.policy(),
    queryFn: ({ signal }) => houseApi.getBudgetPolicy(signal),
    staleTime: 60 * 60 * 1000,
  });
}
