import type { BudgetPolicy } from '@/domains/house/types';

export const budgetPolicy: BudgetPolicy = {
  policyId: 'policy-test',
  effectiveFrom: '2025-10-16',
  dsrRatio: 0.4,
  stressRatePp: 3,
  termYears: 30,
  defaultReserveManwon: 2000,
  ltv: { FIRST_TIME: 0.7, NON_FIRST: 0.4 },
  priceCaps: [
    { maxPriceManwon: 150000, capManwon: 60000 },
    { maxPriceManwon: 250000, capManwon: 40000 },
    { maxPriceManwon: null, capManwon: 20000 },
  ],
  costRates: {
    acquisitionTax: {
      lowRatePct: 1,
      lowMaxManwon: 60000,
      highRatePct: 3,
      highMinManwon: 90000,
      localEducationRatio: 0.1,
    },
    firstTimeRelief: { capManwon: 200, maxPriceManwon: 120000 },
    brokerage: {
      tiers: [
        { belowManwon: 5000, ratePct: 0.6, capManwon: 25 },
        { belowManwon: 20000, ratePct: 0.5, capManwon: 80 },
        { belowManwon: 90000, ratePct: 0.4, capManwon: null },
        { belowManwon: 120000, ratePct: 0.5, capManwon: null },
        { belowManwon: 150000, ratePct: 0.6, capManwon: null },
        { belowManwon: null, ratePct: 0.7, capManwon: null },
      ],
      vatRatio: 0.1,
    },
    registrationRatePct: 0.2,
  },
  sourceNote: '정책 시드',
};
