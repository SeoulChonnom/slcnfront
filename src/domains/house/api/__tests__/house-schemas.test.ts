import { describe, expect, it } from 'vitest';
import {
  budgetPolicySchema,
  compareSchema,
} from '@/domains/house/api/house-schemas';
import { budgetPolicy } from '@/domains/house/utils/__tests__/budget-policy.fixture';

describe('budget policy response validation', () => {
  it('accepts the documented policy', () => {
    expect(budgetPolicySchema.safeParse(budgetPolicy).success).toBe(true);
  });
  it.each([
    [],
    [{ maxPriceManwon: 150000, capManwon: 60000 }],
    [
      { maxPriceManwon: null, capManwon: 20000 },
      { maxPriceManwon: null, capManwon: 20000 },
    ],
    [
      { maxPriceManwon: 250000, capManwon: 40000 },
      { maxPriceManwon: 150000, capManwon: 60000 },
      { maxPriceManwon: null, capManwon: 20000 },
    ],
    [
      { maxPriceManwon: 150000, capManwon: 60000 },
      { maxPriceManwon: 150000, capManwon: 40000 },
      { maxPriceManwon: null, capManwon: 20000 },
    ],
  ])(
    'rejects price caps without strict order and a single final null: %j',
    (...priceCaps) => {
      expect(
        budgetPolicySchema.safeParse({ ...budgetPolicy, priceCaps }).success
      ).toBe(false);
    }
  );
  it('rejects unordered brokerage tiers and non-final null limits', () => {
    const tiers = budgetPolicy.costRates.brokerage.tiers;
    for (const invalid of [
      [...tiers].reverse(),
      tiers.slice(0, -1),
      [tiers.at(-1), ...tiers],
    ]) {
      expect(
        budgetPolicySchema.safeParse({
          ...budgetPolicy,
          costRates: {
            ...budgetPolicy.costRates,
            brokerage: { ...budgetPolicy.costRates.brokerage, tiers: invalid },
          },
        }).success
      ).toBe(false);
    }
  });
});

describe('comparison nullable contract', () => {
  const column = {
    complexId: 'c1',
    name: '서울아파트',
    districtName: '종로구',
    umdName: '사직동',
    buildYear: null,
    area: 'B59',
    recentPrice: null,
    households: null,
    ageYears: null,
    areaInfo: { avgExclusiveArea: null, bucket: 'B59' },
    far: null,
    schools: [],
    redevelopments: null,
    change1y: null,
    change3y: null,
  };
  it('preserves unknown redevelopment data, known empty lists and missing changes', () => {
    expect(
      compareSchema.parse({ columns: [column], missingIds: [] }).columns[0]
    ).toMatchObject({ redevelopments: null, change1y: null });
    expect(
      compareSchema.parse({
        columns: [{ ...column, redevelopments: [] }],
        missingIds: [],
      }).columns[0].redevelopments
    ).toEqual([]);
  });
  it('accepts partial change prices when samples are insufficient', () => {
    expect(
      compareSchema.safeParse({
        columns: [
          {
            ...column,
            change1y: {
              fromManwon: 50000,
              toManwon: null,
              pct: null,
              changeManwon: null,
              sampleFrom: 1,
              sampleTo: 0,
              sampleStatus: 'INSUFFICIENT',
            },
          },
        ],
        missingIds: [],
      }).success
    ).toBe(true);
  });
});
