import type { z } from 'zod';
import type {
  budgetPolicySchema,
  compareColumnSchema,
  complexDetailSchema,
  complexSummaryItemSchema,
  houseComplexSchema,
  houseRankingItemSchema,
} from '@/domains/house/api/house-schemas';

export type AreaBucket = 'B59' | 'B84';
export type RankingType = 'LEADER' | 'RISE' | 'FALL' | 'VOLUME';
export type CompareItem = { complexId: string; area: AreaBucket };
export type MapPosition = { lat: number; lng: number; level: number };
export type MapBounds = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
};
export type PriceRange = { minPrice?: number; maxPrice?: number };
export type ComplexesParams = PriceRange & { area: AreaBucket } & (
    | MapBounds
    | { lawdCd: string }
  );
export type SummaryParams = PriceRange & { area: AreaBucket } & (
    | { groupBy: 'DISTRICT' }
    | (MapBounds & { groupBy: 'DONG' })
  );
export type BudgetPolicy = z.infer<typeof budgetPolicySchema>;
export type HouseComplex = z.infer<typeof houseComplexSchema>;
export type ComplexSummaryItem = z.infer<typeof complexSummaryItemSchema>;
export type ComplexDetail = z.infer<typeof complexDetailSchema>;
export type CompareColumn = z.infer<typeof compareColumnSchema>;
export type HouseRankingItem = z.infer<typeof houseRankingItemSchema>;
