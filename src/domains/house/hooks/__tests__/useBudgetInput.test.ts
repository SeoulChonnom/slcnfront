import { beforeEach, describe, expect, it } from 'vitest';
import { useBudgetInput } from '../useBudgetInput';

beforeEach(() => {
  useBudgetInput.getState().clear();
  sessionStorage.clear();
});

describe('useBudgetInput session persistence', () => {
  it('입력 문자열만 탭 세션에 저장하고 계산 결과나 정책을 저장하지 않는다', () => {
    useBudgetInput.getState().setField('interestRatePct', '5.');
    useBudgetInput.getState().setField('reserveManwon', '');
    const saved = JSON.parse(
      sessionStorage.getItem('house-budget-input') ?? '{}'
    );
    expect(saved.state.input.interestRatePct).toBe('5.');
    expect(saved.state.input.reserveManwon).toBe('');
    expect(Object.keys(saved.state)).toEqual(['input']);
    expect(localStorage.getItem('house-budget-input')).toBeNull();
  });
  it('입력값 지우기는 필수값을 비우고 기본 상태로 되돌린다', () => {
    useBudgetInput.getState().setField('cashManwon', '20000');
    useBudgetInput.getState().setField('firstTimeBuyer', true);
    useBudgetInput.getState().clear();
    expect(useBudgetInput.getState().input).toEqual({
      cashManwon: '',
      annualIncomeManwon: '',
      interestRatePct: '',
      existingMonthlyPaymentManwon: '0',
      reserveManwon: '',
      firstTimeBuyer: false,
    });
  });
  it('세션 재수화 후 입력 중인 문자열을 그대로 복원한다', async () => {
    useBudgetInput.getState().setField('interestRatePct', '5.');
    const saved = sessionStorage.getItem('house-budget-input');
    useBudgetInput.getState().clear();
    sessionStorage.setItem('house-budget-input', saved ?? '');
    await useBudgetInput.persist.rehydrate();
    expect(useBudgetInput.getState().input.interestRatePct).toBe('5.');
  });
});
