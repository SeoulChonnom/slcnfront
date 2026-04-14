import { describe, expect, it } from 'vitest';
import { getShoesCatalog } from '../../data/shoes-data';
import {
  findBrandBySlug,
  findShoeBySlug,
  getShoeDetailBySlug,
  isReservedShoeBrandSlug,
} from '../shoes-slug';

describe('shoes-slug', () => {
  it('matches valid brand and shoe slugs', () => {
    const catalog = getShoesCatalog();
    const brand = findBrandBySlug(catalog, 'nike');
    const shoe = findShoeBySlug(brand, 'v2k');
    const detail = getShoeDetailBySlug(catalog, 'nike', 'v2k');

    expect(brand?.name).toBe('나이키');
    expect(shoe?.name).toBe('V2K 런');
    expect(detail?.shoe.shoesId).toBe('v2k');
  });

  it('rejects reserved brand segments and invalid slugs', () => {
    const catalog = getShoesCatalog();

    expect(isReservedShoeBrandSlug('calendar')).toBe(true);
    expect(findBrandBySlug(catalog, 'calendar')).toBeNull();
    expect(getShoeDetailBySlug(catalog, 'nike', 'missing')).toBeNull();
  });
});
