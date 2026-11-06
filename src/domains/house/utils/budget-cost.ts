import type { BudgetPolicy } from '@/domains/house/types';

export function budgetCost(
  price: number,
  firstTimeBuyer: boolean,
  policy: BudgetPolicy
) {
  const { acquisitionTax, firstTimeRelief, brokerage, registrationRatePct } =
    policy.costRates;
  const taxRate =
    price <= acquisitionTax.lowMaxManwon
      ? acquisitionTax.lowRatePct / 100
      : price > acquisitionTax.highMinManwon
        ? acquisitionTax.highRatePct / 100
        : Math.round(price / 150 - 300) / 10000;
  const grossTax = price * taxRate;
  const relief =
    firstTimeBuyer && price <= firstTimeRelief.maxPriceManwon
      ? Math.min(grossTax, firstTimeRelief.capManwon)
      : 0;
  const acquisition = grossTax - relief;
  const localEducation = grossTax * acquisitionTax.localEducationRatio;
  // The validated policy always ends with an unlimited brokerage tier.
  // biome-ignore lint/style/noNonNullAssertion: the policy schema guarantees a matching tier
  const tier = brokerage.tiers.find(
    (entry) => entry.belowManwon === null || price < entry.belowManwon
  )!;
  const broker =
    Math.min((price * tier.ratePct) / 100, tier.capManwon ?? Infinity) *
    (1 + brokerage.vatRatio);
  const registration = (price * registrationRatePct) / 100;
  return {
    acquisition,
    localEducation,
    brokerage: broker,
    registration,
    total: acquisition + localEducation + broker + registration,
  };
}
