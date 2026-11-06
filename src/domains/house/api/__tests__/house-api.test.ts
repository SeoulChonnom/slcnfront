import { describe, expect, it, vi } from 'vitest';
import { createHouseApi } from '@/domains/house/api/house-api';
import {
  houseMetaSchema,
  rankingsSchema,
} from '@/domains/house/api/house-schemas';
import { createApiClient } from '@/lib/api/api-client';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('house API contract', () => {
  it('uses authenticated API-relative paths, ordered area pairs, and AbortSignal', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ missingIds: ['missing'], columns: [] }));
    const api = createHouseApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'https://example.com/api',
        getAccessToken: () => 'test-token',
      })
    );
    const controller = new AbortController();
    const response = await api.getCompare(
      [
        { complexId: 'c1', area: 'B84' },
        { complexId: 'c1', area: 'B59' },
      ],
      controller.signal
    );
    const [path, request] = fetchFn.mock.calls[0];
    const url = new URL(String(path));
    expect(url.pathname).toBe('/api/house/compare');
    expect(url.searchParams.get('items')).toBe('c1:B84,c1:B59');
    expect(new Headers(request?.headers).get('X-AUTH-TOKEN')).toBe(
      'test-token'
    );
    expect(request?.signal).toBe(controller.signal);
    expect(response.missingIds).toEqual(['missing']);
  });
  it('preserves literal wildcard search characters and trims only the ends', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ items: [] }));
    const api = createHouseApi(
      createApiClient({ fetchFn, getBaseUrl: () => 'https://example.com/api' })
    );
    await api.searchComplexes('  %_ 서울  ');
    const url = new URL(String(fetchFn.mock.calls[0][0]));
    expect(url.searchParams.get('keyword')).toBe('%_ 서울');
    expect(url.searchParams.get('size')).toBe('10');
  });
  it('rejects omitted nullable fields as INVALID_RESPONSE', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(json({ dataAsOf: null }));
    const api = createHouseApi(
      createApiClient({ fetchFn, getBaseUrl: () => 'https://example.com/api' })
    );
    await expect(api.getMeta()).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    });
  });
  it('keeps backend apiCode for section-specific error handling', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      json(
        {
          title: '정책이 없어요',
          status: 503,
          code: 'HOUSE_BUDGET_POLICY_NOT_FOUND',
          errors: [],
        },
        503
      )
    );
    const api = createHouseApi(
      createApiClient({ fetchFn, getBaseUrl: () => 'https://example.com/api' })
    );
    await expect(api.getBudgetPolicy()).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      apiCode: 'HOUSE_BUDGET_POLICY_NOT_FOUND',
      status: 503,
    });
  });
  it('accepts uncomputed metadata and a no-trade leader row with null fields', () => {
    expect(
      houseMetaSchema.parse({ dataAsOf: null, statsComputedDate: null })
    ).toEqual({ dataAsOf: null, statsComputedDate: null });
    expect(
      rankingsSchema.safeParse({
        type: 'LEADER',
        area: 'B59',
        period: null,
        items: [
          {
            rank: 1,
            lawdCd: '11110',
            districtName: '종로구',
            sample: 0,
            badge: 'NO_TRADE',
            complexId: null,
            name: null,
            latitude: null,
            longitude: null,
            buildYear: null,
            avgExclusiveArea: null,
            households: null,
            value: null,
            changeManwon: null,
          },
        ],
      }).success
    ).toBe(true);
  });
});
