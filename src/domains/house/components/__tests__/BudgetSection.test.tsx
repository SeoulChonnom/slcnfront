import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBudgetInput } from '@/domains/house/hooks/useBudgetInput';
import { budgetPolicy } from '@/domains/house/utils/__tests__/budget-policy.fixture';
import { renderWithMinimalProviders } from '@/test/helpers/render-with-minimal-providers';
import { server } from '@/test/helpers/server';
import { BudgetSection } from '../BudgetSection';

// Resolve fetch after MSW installs its interceptor instead of at module import.
vi.mock('@/lib/api/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/api-client')>();
  return {
    ...actual,
    apiClient: actual.createApiClient({ fetchFn: (...args) => fetch(...args) }),
  };
});

beforeEach(() => {
  useBudgetInput.getState().clear();
  sessionStorage.clear();
  server.use(
    http.get('*/house/budget-policy', () => HttpResponse.json(budgetPolicy))
  );
});

describe('BudgetSection', () => {
  it('즉시 계산하고 입력 오류 또는 초기화 때 지도 필터를 해제한다', async () => {
    const onRangeChange = vi.fn();
    const { user } = renderWithMinimalProviders(
      <BudgetSection onRangeChange={onRangeChange} />
    );
    await user.type(await screen.findByLabelText('보유현금'), '20000');
    await user.type(screen.getByLabelText('부부합산 연소득'), '10000');
    await user.type(screen.getByLabelText('예상 대출금리'), '5.0');
    await user.click(screen.getByLabelText('생애최초 주택 구매'));
    expect(onRangeChange).toHaveBeenLastCalledWith({
      minPrice: 45872,
      maxPrice: 57340,
    });
    expect(
      screen.getByRole('region', { name: '탐색 범위' }).textContent
    ).toContain('4.59억 ~ 5.73억');
    await user.clear(screen.getByLabelText('예상 대출금리'));
    await user.type(screen.getByLabelText('예상 대출금리'), '0.05');
    expect(onRangeChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole('region', { name: '탐색 범위' })).toBeNull();
    const result = document.querySelector('.budget-result');
    expect(result?.textContent).toContain(
      '예상 대출금리는 0.1%에서 20% 사이로 입력해 주세요'
    );
    expect(result?.textContent).not.toContain('소수 첫째 자리');
    await user.click(screen.getByRole('button', { name: '입력값 지우기' }));
    expect((screen.getByLabelText('보유현금') as HTMLInputElement).value).toBe(
      ''
    );
    expect(
      screen.getByText(
        '보유현금, 연소득, 예상 금리를 입력하면 예산을 계산해 드려요'
      )
    ).toBeTruthy();
  });

  it('정책 요청 실패를 영역 안에 표시하고 다시 시도로 복구한다', async () => {
    server.use(
      http.get('*/house/budget-policy', () =>
        HttpResponse.json(
          { code: 'HOUSE_BUDGET_POLICY_NOT_FOUND' },
          { status: 503 }
        )
      )
    );
    const { user } = renderWithMinimalProviders(
      <BudgetSection onRangeChange={vi.fn()} />
    );
    expect((await screen.findByRole('alert')).textContent).toContain(
      '예산 계산 규칙을 불러오지 못했어요'
    );
    server.use(
      http.get('*/house/budget-policy', () => HttpResponse.json(budgetPolicy))
    );
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByLabelText('보유현금')).toBeTruthy();
  });

  it('정책을 기다리는 동안 세션 입력을 보존하며 입력은 서버로 전송하지 않는다', async () => {
    const requests: string[] = [];
    useBudgetInput.getState().setField('cashManwon', '20000');
    useBudgetInput.getState().setField('annualIncomeManwon', '10000');
    useBudgetInput.getState().setField('interestRatePct', '5.');
    useBudgetInput.getState().setField('reserveManwon', '3000');
    server.use(
      http.get('*/house/budget-policy', ({ request }) => {
        requests.push(request.url);
        return HttpResponse.json(budgetPolicy);
      })
    );
    renderWithMinimalProviders(<BudgetSection onRangeChange={vi.fn()} />);
    const form = await screen.findByRole('form', { name: '예산 입력' });
    expect(
      (within(form).getByLabelText('안전여유금') as HTMLInputElement).value
    ).toBe('3000');
    expect(
      (within(form).getByLabelText('예상 대출금리') as HTMLInputElement).value
    ).toBe('5.');
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(new URL(requests[0]).search).toBe('');
  });
});
