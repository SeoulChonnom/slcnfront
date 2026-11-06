import type { BudgetPolicy } from '@/domains/house/types';
import { budgetCost } from './budget-cost';

export type BudgetInput = {
  cashManwon: string;
  annualIncomeManwon: string;
  interestRatePct: string;
  existingMonthlyPaymentManwon: string;
  reserveManwon: string;
  firstTimeBuyer: boolean;
};

export const emptyBudgetInput: BudgetInput = {
  cashManwon: '',
  annualIncomeManwon: '',
  interestRatePct: '',
  existingMonthlyPaymentManwon: '0',
  reserveManwon: '',
  firstTimeBuyer: false,
};

type InputErrors = Partial<Record<keyof BudgetInput, string>>;

export type BudgetSuccess = {
  status: 'SUCCESS';
  budget: number;
  dsrLimit: number;
  ltvLimit: number;
  cap: number;
  appliedLoan: number;
  bindingConstraint: 'DSR' | 'LTV' | 'CAP';
  costs: number;
  costBreakdown: ReturnType<typeof budgetCost>;
  surplus: number;
  minPrice: number;
  maxPrice: number;
  cash: number;
  reserve: number;
  rate: number;
  ltv: number;
  capPrice: number | null;
};

type BudgetResult =
  | BudgetSuccess
  | { status: 'INCOMPLETE' }
  | { status: 'INVALID'; errors: InputErrors }
  | { status: 'NO_BUDGET' };

export function calculateBudget(
  input: BudgetInput,
  policy: BudgetPolicy
): BudgetResult {
  const errors: InputErrors = {};
  const integerFields = [
    ['cashManwon', '보유현금', 10000000],
    ['annualIncomeManwon', '부부합산 연소득', 1000000],
    ['existingMonthlyPaymentManwon', '기존대출 월 상환', 100000],
    ['reserveManwon', '안전여유금', Number.MAX_SAFE_INTEGER],
  ] as const;
  for (const [key, label, max] of integerFields) {
    const value = input[key].trim();
    if (
      value !== '' &&
      (!/^\d+$/.test(value) ||
        !Number.isSafeInteger(Number(value)) ||
        Number(value) > max)
    ) {
      errors[key] = `${label}은(는) 0 이상의 숫자로 입력해 주세요`;
    }
  }
  const rateText = input.interestRatePct.trim();
  const rate = Number(rateText);
  if (rateText !== '') {
    if (!Number.isFinite(rate) || rate < 0.1 || rate > 20) {
      errors.interestRatePct =
        '예상 대출금리는 0.1%에서 20% 사이로 입력해 주세요';
    } else if (!/^\d+(?:\.\d?)?$/.test(rateText)) {
      errors.interestRatePct =
        '예상 대출금리는 소수 첫째 자리까지 입력해 주세요';
    }
  }
  if (Object.keys(errors).length) return { status: 'INVALID', errors };
  if (
    [input.cashManwon, input.annualIncomeManwon, rateText].some(
      (value) => value.trim() === ''
    )
  )
    return { status: 'INCOMPLETE' };

  const cash = Number(input.cashManwon);
  const reserve =
    input.reserveManwon.trim() === ''
      ? policy.defaultReserveManwon
      : Number(input.reserveManwon);
  if (cash - reserve <= 0) return { status: 'NO_BUDGET' };
  const monthlyRate = (rate + policy.stressRatePp) / 1200;
  const months = policy.termYears * 12;
  const repayment =
    Math.max(
      0,
      Number(input.annualIncomeManwon) * policy.dsrRatio -
        Number(input.existingMonthlyPaymentManwon) * 12
    ) / 12;
  const growth = (1 + monthlyRate) ** months;
  const dsr =
    monthlyRate === 0
      ? repayment * months
      : (repayment * (growth - 1)) / (monthlyRate * growth);
  const ltv = input.firstTimeBuyer
    ? policy.ltv.FIRST_TIME
    : policy.ltv.NON_FIRST;
  let lower = 0;
  let best:
    | {
        price: number;
        cap: number;
        capPrice: number | null;
        atBoundary: boolean;
      }
    | undefined;
  for (const { maxPriceManwon, capManwon } of policy.priceCaps) {
    const balance = (price: number) =>
      cash -
      reserve -
      budgetCost(price, input.firstTimeBuyer, policy).total +
      Math.min(dsr, ltv * price, capManwon) -
      price;
    const upper = maxPriceManwon ?? cash - reserve + capManwon;
    if (upper > lower && balance(lower + 0.000001) >= 0) {
      let price = upper;
      const atBoundary = maxPriceManwon !== null && balance(upper) >= 0;
      if (!atBoundary) {
        let lo = lower;
        let hi = upper;
        while (hi - lo >= 0.001) {
          const middle = (lo + hi) / 2;
          if (balance(middle) >= 0) lo = middle;
          else hi = middle;
        }
        price = lo;
      }
      if (!best || price > best.price)
        best = { price, cap: capManwon, capPrice: maxPriceManwon, atBoundary };
    }
    if (maxPriceManwon !== null) lower = maxPriceManwon;
  }
  if (!best) return { status: 'NO_BUDGET' };
  const loan = Math.min(dsr, ltv * best.price, best.cap);
  const appliedLoan = Math.floor(loan);
  const budget = Math.floor(best.price);
  const costBreakdown = budgetCost(best.price, input.firstTimeBuyer, policy);
  const costs = best.atBoundary
    ? Math.ceil(costBreakdown.total)
    : cash + appliedLoan - reserve - budget;
  return {
    status: 'SUCCESS',
    budget,
    dsrLimit: Math.floor(dsr),
    ltvLimit: Math.floor(ltv * best.price),
    cap: best.cap,
    appliedLoan,
    bindingConstraint:
      dsr <= ltv * best.price && dsr <= best.cap
        ? 'DSR'
        : ltv * best.price <= best.cap
          ? 'LTV'
          : 'CAP',
    costs,
    costBreakdown,
    surplus: best.atBoundary
      ? cash + appliedLoan - reserve - costs - budget
      : 0,
    minPrice: Math.floor(0.8 * budget),
    maxPrice: budget,
    cash,
    reserve,
    rate,
    ltv,
    capPrice: best.capPrice,
  };
}
