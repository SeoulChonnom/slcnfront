import { skipToken, useQuery } from '@tanstack/react-query';
import { houseApi } from '@/domains/house/api/house-api';
import type { AreaBucket } from '@/domains/house/types';
import { houseQueryKeys } from '@/lib/api/query-keys';

export function useComplexDetail(id: string | null, area: AreaBucket) {
  return useQuery({
    queryKey: houseQueryKeys.detail(id, area),
    queryFn: id
      ? ({ signal }) => houseApi.getComplexDetail(id, area, signal)
      : skipToken,
    staleTime: 5 * 60 * 1000,
  });
}
