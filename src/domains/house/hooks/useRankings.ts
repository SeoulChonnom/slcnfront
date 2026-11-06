import { useQuery } from '@tanstack/react-query';
import { houseApi } from '@/domains/house/api/house-api';
import type { AreaBucket, RankingType } from '@/domains/house/types';
import { houseQueryKeys } from '@/lib/api/query-keys';

export function useRankings(type: RankingType, area: AreaBucket) {
  return useQuery({
    queryKey: houseQueryKeys.rankings(type, area),
    queryFn: ({ signal }) => houseApi.getRankings(type, area, signal),
    staleTime: 5 * 60 * 1000,
  });
}
