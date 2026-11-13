import { z } from 'zod';

const nonNegative = z.number().finite().nonnegative();
const count = nonNegative.int();
const areaSchema = z.enum(['B59', 'B84']);
const rankingTypeSchema = z.enum(['LEADER', 'RISE', 'FALL', 'VOLUME']);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function hasOrderedFinalNull(values: (number | null)[]) {
  return (
    values.length > 0 &&
    values.at(-1) === null &&
    values
      .slice(0, -1)
      .every(
        (value, index) =>
          value !== null && (index === 0 || value > (values[index - 1] ?? 0))
      )
  );
}

export const budgetPolicySchema = z.object({
  policyId: z.string(),
  effectiveFrom: dateSchema,
  dsrRatio: nonNegative.max(1),
  stressRatePp: nonNegative,
  termYears: z.number().int().positive(),
  defaultReserveManwon: count,
  ltv: z.object({
    FIRST_TIME: nonNegative.max(1),
    NON_FIRST: nonNegative.max(1),
  }),
  priceCaps: z
    .array(z.object({ maxPriceManwon: count.nullable(), capManwon: count }))
    .refine(
      (items) => hasOrderedFinalNull(items.map((item) => item.maxPriceManwon)),
      '가격 상한은 오름차순이고 마지막 상한만 null이어야 합니다.'
    ),
  costRates: z.object({
    acquisitionTax: z.object({
      lowRatePct: nonNegative,
      lowMaxManwon: count,
      highRatePct: nonNegative,
      highMinManwon: count,
      localEducationRatio: nonNegative,
    }),
    firstTimeRelief: z.object({ capManwon: count, maxPriceManwon: count }),
    brokerage: z.object({
      tiers: z
        .array(
          z.object({
            belowManwon: count.nullable(),
            ratePct: nonNegative,
            capManwon: count.nullable(),
          })
        )
        .refine(
          (items) => hasOrderedFinalNull(items.map((item) => item.belowManwon)),
          '중개보수 구간은 오름차순이고 마지막 상한만 null이어야 합니다.'
        ),
      vatRatio: nonNegative,
    }),
    registrationRatePct: nonNegative,
  }),
  sourceNote: z.string(),
});

export const houseMetaSchema = z.object({
  dataAsOf: dateSchema.nullable(),
  statsComputedDate: dateSchema.nullable(),
});

const recentPriceSchema = z
  .object({
    priceManwon: count,
    windowMonths: z.union([z.literal(3), z.literal(6)]),
    sample: count,
  })
  .nullable();

const complexIdentityShape = {
  complexId: z.string().min(1),
  name: z.string(),
  districtName: z.string(),
  umdName: z.string(),
  buildYear: count.nullable(),
};

export const houseComplexSchema = z.object({
  ...complexIdentityShape,
  lawdCd: z.string(),
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  households: count.nullable(),
  recentPrice: recentPriceSchema,
});

export const complexesSchema = z.object({
  total: count,
  truncated: z.boolean(),
  items: z.array(houseComplexSchema),
});

export const complexSummaryItemSchema = z.object({
  code: z.string(),
  name: z.string(),
  lawdCd: z.string(),
  districtName: z.string(),
  count,
  centerLat: z.number().finite(),
  centerLng: z.number().finite(),
});

export const complexSummarySchema = z.object({
  groupBy: z.enum(['DISTRICT', 'DONG']),
  items: z.array(complexSummaryItemSchema),
});

const complexSearchItemSchema = z.object(complexIdentityShape);
export const complexSearchSchema = z.object({
  items: z.array(complexSearchItemSchema),
});

export const complexDetailSchema = z.object({
  ...complexIdentityShape,
  latitude: z.number().finite().nullable(),
  longitude: z.number().finite().nullable(),
  households: count.nullable(),
  recentPrice: recentPriceSchema,
});

const priceChangeSchema = z
  .object({
    fromManwon: count.nullable(),
    toManwon: count.nullable(),
    pct: z.number().finite().nullable(),
    changeManwon: z.number().int().nullable(),
    sampleFrom: count,
    sampleTo: count,
    sampleStatus: z.enum(['OK', 'LOW', 'INSUFFICIENT']),
  })
  .nullable();

export const compareColumnSchema = z.object({
  ...complexIdentityShape,
  area: areaSchema,
  recentPrice: recentPriceSchema,
  households: count.nullable(),
  ageYears: count.nullable(),
  areaInfo: z.object({
    avgExclusiveArea: nonNegative.nullable(),
    bucket: areaSchema,
  }),
  far: z
    .object({ pct: nonNegative, source: z.enum(['RECAP', 'TITLE']) })
    .nullable(),
  schools: z.array(
    z.object({
      level: z.enum(['E', 'M', 'H']),
      name: z.string(),
      distanceM: count,
    })
  ),
  redevelopments: z
    .array(
      z.object({
        name: z.string(),
        projectType: z.string(),
        stage: z.string(),
        distanceM: count,
        sourceUrl: z.string().nullable(),
      })
    )
    .nullable(),
  change1y: priceChangeSchema,
  change3y: priceChangeSchema,
});

export const compareSchema = z.object({
  missingIds: z.array(z.string()),
  columns: z.array(compareColumnSchema),
});

export const houseRankingItemSchema = z.object({
  rank: count,
  complexId: z.string().nullable(),
  name: z.string().nullable(),
  lawdCd: z.string(),
  districtName: z.string(),
  latitude: z.number().finite().nullable(),
  longitude: z.number().finite().nullable(),
  buildYear: count.nullable(),
  avgExclusiveArea: nonNegative.nullable(),
  households: count.nullable(),
  value: z.number().finite().nullable(),
  changeManwon: z.number().int().nullable(),
  sample: count,
  badge: z.enum(['LOW_SAMPLE', 'NO_TRADE']).nullable(),
});

export const rankingsSchema = z.object({
  type: rankingTypeSchema,
  area: areaSchema,
  period: z.object({ from: dateSchema, to: dateSchema }).nullable(),
  items: z.array(houseRankingItemSchema),
});
