export type ShoeBrand = string;

export type ShoeItem = {
  brand: ShoeBrand;
  shoesName: string;
  displayName: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  productUrl?: string;
};

export type ShoesCatalog = Record<ShoeBrand, ShoeItem[]>;
