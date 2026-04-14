import { useQuery } from '@tanstack/react-query';
import { shoesQueryKeys } from '../../../lib/api/query-keys';
import { getShoesCatalog } from '../data/shoes-data';
import { getShoeDetailBySlug } from '../utils/shoes-slug';

export function useShoeDetail(
  brandSlug: string | undefined,
  shoesSlug: string | undefined,
) {
  return useQuery({
    queryKey: shoesQueryKeys.detail(brandSlug ?? '', shoesSlug ?? ''),
    enabled: Boolean(brandSlug && shoesSlug),
    queryFn: async () =>
      getShoeDetailBySlug(getShoesCatalog(), brandSlug, shoesSlug),
  });
}
