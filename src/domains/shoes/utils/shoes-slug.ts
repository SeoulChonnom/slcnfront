import { RESERVED_SHOE_BRAND_SEGMENTS } from '../../../app/router/route-constants';
import type { ShoeBrand, ShoeItem } from '../types';

export function isReservedShoeBrandSlug(brandSlug: string) {
  return RESERVED_SHOE_BRAND_SEGMENTS.includes(brandSlug);
}

export function findBrandBySlug(
  brands: ShoeBrand[],
  brandSlug: string | undefined,
) {
  if (!brandSlug || isReservedShoeBrandSlug(brandSlug)) {
    return null;
  }

  return brands.find((brand) => brand.brandId === brandSlug) ?? null;
}

export function findShoeBySlug(
  brand: ShoeBrand | null,
  shoesSlug: string | undefined,
) {
  if (!brand || !shoesSlug) {
    return null;
  }

  return brand.shoes.find((shoe) => shoe.shoesId === shoesSlug) ?? null;
}

export function getShoeDetailBySlug(
  brands: ShoeBrand[],
  brandSlug: string | undefined,
  shoesSlug: string | undefined,
) {
  const brand = findBrandBySlug(brands, brandSlug);
  const shoe = findShoeBySlug(brand, shoesSlug);

  if (!brand || !shoe) {
    return null;
  }

  return {
    brand,
    shoe,
  };
}

export function getShoeReviewKey(shoe: ShoeItem, index: number) {
  return `${shoe.shoesId}-review-${index}`;
}
