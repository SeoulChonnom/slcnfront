import { getShoesCatalog } from '@/domains/shoes/data/shoes-data';
import { getShoeDetailBySlug } from '@/domains/shoes/utils/shoes-slug';

export function useShoeDetail(
  brandSlug: string | undefined,
  shoesSlug: string | undefined
) {
  return getShoeDetailBySlug(getShoesCatalog(), brandSlug, shoesSlug);
}
