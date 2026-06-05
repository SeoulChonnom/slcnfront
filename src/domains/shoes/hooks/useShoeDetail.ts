import { getShoesCatalog } from '../data/shoes-data';
import { getShoeDetailBySlug } from '../utils/shoes-slug';

export function useShoeDetail(
  brandSlug: string | undefined,
  shoesSlug: string | undefined
) {
  return getShoeDetailBySlug(getShoesCatalog(), brandSlug, shoesSlug);
}
