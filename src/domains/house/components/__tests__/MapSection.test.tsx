import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/test/helpers/server';

vi.mock('@/lib/env/env', () => ({
  getAppEnv: () => ({ apiUrl: 'https://house.test/api', isTest: true }),
}));

describe('map detail', () => {
  it('closes a stale selected complex after 404 and announces why', async () => {
    const { MapSection } = await import(
      '@/domains/house/components/MapSection'
    );
    server.use(
      http.get('https://house.test/api/house/complexes/summary', () =>
        HttpResponse.json({
          groupBy: 'DISTRICT',
          items: [
            {
              code: '11305',
              name: '강북구',
              lawdCd: '11305',
              districtName: '강북구',
              count: 1,
              centerLat: 37.63,
              centerLng: 127.02,
            },
          ],
        })
      ),
      http.get('https://house.test/api/house/complexes', () =>
        HttpResponse.json({
          total: 1,
          truncated: false,
          items: [
            {
              complexId: 'gone',
              name: '삭제된 단지',
              lawdCd: '11305',
              districtName: '강북구',
              umdName: '미아동',
              latitude: 37.6,
              longitude: 127.02,
              buildYear: null,
              households: null,
              recentPrice: null,
            },
          ],
        })
      ),
      http.get('https://house.test/api/house/complexes/gone', () =>
        HttpResponse.json(
          {
            title: '없는 단지',
            status: 404,
            code: 'HOUSE_COMPLEX_NOT_FOUND',
            errors: [],
          },
          { status: 404 }
        )
      )
    );
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { container } = render(
      <QueryClientProvider client={client}>
        <MapSection
          areaBucket='B59'
          statsComputedDate='2026-11-03'
          mapPosition={{ lat: 37.5665, lng: 126.978, level: 8 }}
          onMapPositionChange={vi.fn()}
          onAddCompare={vi.fn()}
          compareItems={[]}
        />
      </QueryClientProvider>
    );
    fireEvent.click(await screen.findByRole('button', { name: /^강북구/ }));
    fireEvent.click(
      await screen.findByRole('button', {
        name: /삭제된 단지.*강북구/,
      })
    );
    expect(
      await screen.findByText('이 단지의 정보를 찾을 수 없어 카드를 닫았어요.')
    ).toBeTruthy();
    await waitFor(() =>
      expect(container.querySelector('.house-info-card')).toBeNull()
    );
    expect(screen.getByText(/최근 6개월 거래 없음/)).toBeTruthy();
  });
});
