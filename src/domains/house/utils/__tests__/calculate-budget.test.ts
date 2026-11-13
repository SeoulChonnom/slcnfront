import { describe, expect, it } from 'vitest';
import { budgetCost } from '../budget-cost';
import { type BudgetInput, calculateBudget } from '../calculate-budget';
import { budgetPolicy } from './budget-policy.fixture';

const input: BudgetInput = {
  cashManwon: '20000',
  annualIncomeManwon: '10000',
  interestRatePct: '5.0',
  existingMonthlyPaymentManwon: '0',
  reserveManwon: '2000',
  firstTimeBuyer: true,
};

describe('calculateBudget 명세의 12가지 정확값', () => {
  it.each([
    [
      1,
      {},
      {
        dsrLimit: 45427,
        ltvLimit: 40138,
        cap: 60000,
        appliedLoan: 40138,
        bindingConstraint: 'LTV',
        costs: 798,
        budget: 57340,
        minPrice: 45872,
        maxPrice: 57340,
      },
    ],
    [
      2,
      { firstTimeBuyer: false },
      {
        ltvLimit: 11661,
        appliedLoan: 11661,
        bindingConstraint: 'LTV',
        costs: 507,
        budget: 29154,
      },
    ],
    [
      3,
      { annualIncomeManwon: '0' },
      {
        dsrLimit: 0,
        appliedLoan: 0,
        bindingConstraint: 'DSR',
        costs: 142,
        budget: 17858,
      },
    ],
    [
      4,
      { existingMonthlyPaymentManwon: '400' },
      { dsrLimit: 0, budget: 17858 },
    ],
    [
      5,
      { cashManwon: '25000', annualIncomeManwon: '20000' },
      {
        appliedLoan: 49869,
        bindingConstraint: 'LTV',
        costs: 1627,
        budget: 71242,
        minPrice: 56993,
        maxPrice: 71242,
      },
    ],
    [
      6,
      { cashManwon: '50000', annualIncomeManwon: '30000' },
      {
        appliedLoan: 60000,
        bindingConstraint: 'CAP',
        costs: 4012,
        budget: 103988,
      },
    ],
    [
      7,
      { cashManwon: '105000', annualIncomeManwon: '30000' },
      { appliedLoan: 60000, costs: 6405, surplus: 6595, budget: 150000 },
    ],
    [
      8,
      { cashManwon: '125000', annualIncomeManwon: '30000' },
      {
        appliedLoan: 40000,
        bindingConstraint: 'CAP',
        costs: 6676,
        budget: 156324,
      },
    ],
    [
      9,
      { cashManwon: '300000' },
      {
        appliedLoan: 20000,
        bindingConstraint: 'CAP',
        costs: 13023,
        budget: 304977,
      },
    ],
    [
      10,
      { annualIncomeManwon: '5000' },
      {
        dsrLimit: 22713,
        appliedLoan: 22713,
        bindingConstraint: 'DSR',
        costs: 499,
        budget: 40214,
      },
    ],
  ] as const)('케이스 %s', (_number, changed, expected) => {
    const result = calculateBudget({ ...input, ...changed }, budgetPolicy);
    expect(result).toMatchObject({ status: 'SUCCESS', ...expected });
    if (result.status === 'SUCCESS')
      expect(
        result.cash +
          result.appliedLoan -
          result.costs -
          result.reserve -
          result.surplus
      ).toBe(result.budget);
  });
  it('케이스 11: 현금이 여유금 이하이면 예산이 없다', () => {
    expect(
      calculateBudget({ ...input, cashManwon: '2000' }, budgetPolicy)
    ).toEqual({ status: 'NO_BUDGET' });
  });
  it('케이스 12: 금리 범위 오류를 소수 오류보다 우선 표시한다', () => {
    expect(
      calculateBudget({ ...input, interestRatePct: '0.05' }, budgetPolicy)
    ).toEqual({
      status: 'INVALID',
      errors: {
        interestRatePct: '예상 대출금리는 0.1%에서 20% 사이로 입력해 주세요',
      },
    });
    expect(
      calculateBudget({ ...input, interestRatePct: '5.25' }, budgetPolicy)
    ).toEqual({
      status: 'INVALID',
      errors: {
        interestRatePct: '예상 대출금리는 소수 첫째 자리까지 입력해 주세요',
      },
    });
  });
});

describe('예산 입력과 정책', () => {
  it('필수값 미입력과 입력 오류를 구분하고 오류가 우선한다', () => {
    expect(calculateBudget({ ...input, cashManwon: '' }, budgetPolicy)).toEqual(
      { status: 'INCOMPLETE' }
    );
    expect(
      calculateBudget(
        { ...input, cashManwon: '', interestRatePct: '0.05' },
        budgetPolicy
      ).status
    ).toBe('INVALID');
  });
  it('빈 여유금은 정책 기본값, 빈 기존대출은 0으로 계산한다', () => {
    expect(
      calculateBudget(
        { ...input, reserveManwon: '', existingMonthlyPaymentManwon: '' },
        budgetPolicy
      )
    ).toEqual(calculateBudget(input, budgetPolicy));
    expect(
      calculateBudget(
        { ...input, reserveManwon: '' },
        { ...budgetPolicy, defaultReserveManwon: 3000 }
      )
    ).toEqual(
      calculateBudget({ ...input, reserveManwon: '3000' }, budgetPolicy)
    );
  });
  it('입력 중인 금리 5.는 계산 가능하며 문자열을 변경하지 않는다', () => {
    const draft = { ...input, interestRatePct: '5.' };
    expect(calculateBudget(draft, budgetPolicy)).toEqual(
      calculateBudget(input, budgetPolicy)
    );
    expect(draft.interestRatePct).toBe('5.');
  });
  it.each(['-1', '1.5', '1e4', 'Infinity', '10000001'])(
    '유효하지 않은 현금 %s를 거부한다',
    (cashManwon) => {
      expect(
        calculateBudget({ ...input, cashManwon }, budgetPolicy).status
      ).toBe('INVALID');
    }
  );
  it('중개보수 구간은 미만이며 15억에서는 0.7%를 적용한다', () => {
    expect(budgetCost(150000, true, budgetPolicy).brokerage).toBe(1155);
  });
  it('누진 취득세 비율을 만분율로 반올림한다', () => {
    expect(budgetCost(70000, false, budgetPolicy).acquisition).toBe(1169);
    expect(budgetCost(80000, false, budgetPolicy).acquisition).toBe(1864);
  });
});
