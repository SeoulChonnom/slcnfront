import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRouter } from '@/app/router/AppRouter';
import { resetAuthStore, useAuthStore } from '@/domains/auth/store/auth-store';
import { useBudgetInput } from '@/domains/house/hooks/useBudgetInput';
import { HouseFinderPage } from '@/pages/shared/HouseFinderPage';
import { renderWithMinimalProviders } from '@/test/helpers/render';
import { server } from '@/test/helpers/server';
import { houseFixtures } from '@/test/house/fixtures';
import { installHouseHandlers } from '@/test/house/handlers';

// The singleton otherwise captures fetch before MSW's beforeAll interceptor.
// All requests still pass through the real API client and response schemas.
vi.mock('@/lib/api/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/api-client')>();
  return {
    ...actual,
    apiClient: actual.createApiClient({ fetchFn: (...args) => fetch(...args) }),
  };
});

vi.mock('@/lib/env/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/env/env')>();
  return {
    ...actual,
    getAppEnv: () => ({ ...actual.getAppEnv(), kakaoMapJsKey: undefined }),
  };
});

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid='house-location'>
      {location.pathname}
      {location.search}
    </output>
  );
}

function renderHouse(route = '/main/house', router = false) {
  return renderWithMinimalProviders(
    <>
      <LocationProbe />
      {router ? <AppRouter /> : <HouseFinderPage device='main' />}
    </>,
    { route }
  );
}

describe('house user flows with contract responses', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetAuthStore();
    useBudgetInput.getState().clear();
    useAuthStore.getState().setSession({
      accessToken: 'house-test-token',
      userInfo: { userName: 'string', name: '테스트', roleList: ['user'] },
    });
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    resetAuthStore();
    useBudgetInput.getState().clear();
  });

  it.each(['main', 'mobile'])(
    'preserves a shared comparison through %s login',
    async (device) => {
      installHouseHandlers();
      useAuthStore.getState().markRestoreFailed();
      const destination = `/${device}/house?area=84&cmp=HOUSE_COMPLEX-mia:59,HOUSE_COMPLEX-mia:84&rank=RISE`;
      const { user } = renderHouse(destination, true);
      await screen.findByRole('button', { name: '로그인' });
      expect(screen.getByTestId('house-location').textContent).toBe(
        `/${device}/login?redirect=${encodeURIComponent(destination)}`
      );
      await user.type(
        screen.getByPlaceholderText('아이디를 입력해 주세요'),
        'string'
      );
      await user.type(
        screen.getByPlaceholderText('비밀번호를 입력해 주세요'),
        'string'
      );
      await user.click(screen.getByRole('button', { name: '로그인' }));
      await screen.findByRole('heading', { name: '매물 비교' });
      await waitFor(() =>
        expect(screen.getByTestId('house-location').textContent).toBe(
          destination
        )
      );
      const table = await within(
        screen.getByRole('region', { name: '매물 비교' })
      ).findByRole('table');
      expect(
        within(table).getAllByRole('columnheader', { name: /미아한빛/ })
      ).toHaveLength(2);
    }
  );

  it('removes every area of a missing complex while preserving remaining comparison order', async () => {
    installHouseHandlers();
    server.use(
      http.get('*/api/house/compare', ({ request }) => {
        const hasMissing = new URL(request.url).searchParams
          .get('items')
          ?.includes('gone:');
        return HttpResponse.json({
          columns: [houseFixtures.column],
          missingIds: hasMissing ? ['gone'] : [],
        });
      })
    );
    renderHouse('/main/house?cmp=gone:59,HOUSE_COMPLEX-mia:59,gone:84');
    await screen.findByText('찾을 수 없는 단지 1개를 비교에서 뺐어요');
    await waitFor(() => {
      const url = new URL(
        screen.getByTestId('house-location').textContent ?? '',
        'https://test.local'
      );
      expect(url.searchParams.get('cmp')).toBe('HOUSE_COMPLEX-mia:59');
    });
  });

  it('keeps exploration usable when only the budget policy is unavailable', async () => {
    installHouseHandlers();
    server.use(
      http.get('*/api/house/budget-policy', () =>
        HttpResponse.json(
          { code: 'HOUSE_BUDGET_POLICY_NOT_FOUND', title: '정책이 없습니다.' },
          { status: 503 }
        )
      )
    );
    const { user } = renderHouse();
    await screen.findByText(/예산 계산 규칙을 불러오지 못했어요/);
    await user.click(await screen.findByRole('button', { name: /강북구/ }));
    const find = screen.getByRole('region', { name: '집 찾기' });
    expect(
      await within(find).findByRole('button', { name: /^미아한빛 강북구/ })
    ).toBeTruthy();
  });

  it('distinguishes statistics preparation from empty search results', async () => {
    installHouseHandlers();
    server.use(
      http.get('*/api/house/meta', () =>
        HttpResponse.json({ dataAsOf: null, statsComputedDate: null })
      )
    );
    renderHouse();
    expect(await screen.findByText('데이터 준비 중')).toBeTruthy();
    await waitFor(() =>
      expect(
        screen.getAllByText('통계 준비 중이에요').length
      ).toBeGreaterThanOrEqual(2)
    );
    expect(screen.queryByText('조건에 맞는 단지가 없어요')).toBeNull();
  });

  it('keeps raw finances in session storage and only sends derived map filters', async () => {
    const requests = installHouseHandlers();
    const { user } = renderHouse();
    await user.type(await screen.findByLabelText('보유현금'), '20000');
    await user.type(screen.getByLabelText('부부합산 연소득'), '10000');
    await user.type(screen.getByLabelText('예상 대출금리'), '5.0');
    await user.click(screen.getByLabelText('생애최초 주택 구매'));
    await waitFor(() => {
      const filtered = requests
        .map((request) => new URL(request.url))
        .find((url) => url.searchParams.get('maxPrice') === '57340');
      expect(filtered?.searchParams.get('minPrice')).toBe('45872');
    });
    expect(screen.getByTestId('house-location').textContent).toBe(
      '/main/house'
    );
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue();
    await user.click(screen.getByRole('button', { name: '링크 복사' }));
    const shared = new URL(writeText.mock.calls[0]?.[0] ?? '');
    expect([...shared.searchParams.keys()].sort()).toEqual([
      'area',
      'lat',
      'level',
      'lng',
      'rank',
    ]);
    const stored = JSON.parse(
      sessionStorage.getItem('house-budget-input') ?? '{}'
    );
    expect(stored.state.input.cashManwon).toBe('20000');
    expect(stored.state.input.annualIncomeManwon).toBe('10000');
    for (const request of requests) {
      expect(request.method).toBe('GET');
      expect(request.body).toBeNull();
      expect(
        [...new URL(request.url).searchParams.keys()].every((key) =>
          [
            'area',
            'groupBy',
            'minPrice',
            'maxPrice',
            'type',
            'lawdCd',
          ].includes(key)
        )
      ).toBe(true);
    }
    await user.click(screen.getByRole('button', { name: '입력값 지우기' }));
    expect((screen.getByLabelText('보유현금') as HTMLInputElement).value).toBe(
      ''
    );
    writeText.mockRestore();
  });
});
