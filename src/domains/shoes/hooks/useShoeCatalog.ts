import { useQuery } from '@tanstack/react-query';
import { shoesQueryKeys } from '../../../lib/api/query-keys';
import { getShoesCatalog } from '../data/shoes-data';

export function useShoeCatalog() {
  return useQuery({
    queryKey: shoesQueryKeys.catalog(),
    queryFn: async () => getShoesCatalog(),
  });
}
