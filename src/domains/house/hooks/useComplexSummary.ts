import { skipToken, useQuery } from '@tanstack/react-query';
import { houseApi } from '@/domains/house/api/house-api';
import type { SummaryParams } from '@/domains/house/types';
import { houseQueryKeys } from '@/lib/api/query-keys';

export function useComplexSummary(params: SummaryParams | null) {
  return useQuery({
    queryKey: houseQueryKeys.summary(params),
    queryFn: params
      ? ({ signal }) => houseApi.getSummary(params, signal)
      : skipToken,
    staleTime: 5 * 60 * 1000,
  });
}
