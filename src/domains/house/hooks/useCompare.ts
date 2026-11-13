import { skipToken, useQuery } from '@tanstack/react-query';
import { houseApi } from '@/domains/house/api/house-api';
import type { CompareItem } from '@/domains/house/types';
import { houseQueryKeys } from '@/lib/api/query-keys';

export function useCompare(items: CompareItem[]) {
  return useQuery({
    queryKey: houseQueryKeys.compare(items),
    queryFn: items.length
      ? ({ signal }) => houseApi.getCompare(items, signal)
      : skipToken,
    staleTime: 5 * 60 * 1000,
  });
}
