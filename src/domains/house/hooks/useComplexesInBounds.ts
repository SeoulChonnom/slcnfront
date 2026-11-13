import { skipToken, useQuery } from '@tanstack/react-query';
import { houseApi } from '@/domains/house/api/house-api';
import type { ComplexesParams } from '@/domains/house/types';
import { houseQueryKeys } from '@/lib/api/query-keys';

export function useComplexesInBounds(params: ComplexesParams | null) {
  return useQuery({
    queryKey: houseQueryKeys.complexes(params),
    queryFn: params
      ? ({ signal }) => houseApi.getComplexes(params, signal)
      : skipToken,
    staleTime: 5 * 60 * 1000,
  });
}
