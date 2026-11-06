import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetAuthStore, useAuthStore } from '@/domains/auth/store/auth-store';
import { createHouseApi } from '@/domains/house/api/house-api';
import { createApiClient } from '@/lib/api/api-client';
import { server } from '@/test/helpers/server';
import { houseFixtures } from '@/test/house/fixtures';
import { installHouseHandlers } from '@/test/house/handlers';

describe('house HTTP contract integration', () => {
  let houseApi: ReturnType<typeof createHouseApi>;
  beforeEach(() => {
    houseApi = createHouseApi(createApiClient());
    resetAuthStore();
    useAuthStore.getState().setSession({
      accessToken: 'house-test-token',
      userInfo: { userName: 'string', name: '테스트', roleList: ['user'] },
    });
  });

  it('sends authenticated district queries without viewport coordinates', async () => {
    const requests = installHouseHandlers();
    const response = await houseApi.getSummary({
      groupBy: 'DISTRICT',
      area: 'B59',
      minPrice: 45872,
      maxPrice: 57340,
    });
    expect(response.items[0]?.code).toBe('11305');
    expect(requests).toHaveLength(1);
    expect(requests[0]?.headers.get('x-auth-token')).toBe('house-test-token');
    expect(
      Object.fromEntries(new URL(requests[0]?.url ?? '').searchParams)
    ).toEqual({
      groupBy: 'DISTRICT',
      area: 'B59',
      minPrice: '45872',
      maxPrice: '57340',
    });
  });

  it('preserves nullable comparison fields and unknown redevelopment labels from HTTP', async () => {
    server.use(
      http.get('*/api/house/compare', () =>
        HttpResponse.json({
          missingIds: [],
          columns: [
            {
              ...houseFixtures.column,
              recentPrice: null,
              households: null,
              buildYear: null,
              ageYears: null,
              areaInfo: { avgExclusiveArea: null, bucket: 'B59' },
              far: null,
              schools: [],
              redevelopments: [
                {
                  name: '신규사업',
                  projectType: '미정 유형',
                  stage: '새 단계',
                  distanceM: 150,
                  sourceUrl: null,
                },
              ],
              change1y: null,
              change3y: null,
            },
          ],
        })
      )
    );
    const result = await houseApi.getCompare([
      { complexId: 'HOUSE_COMPLEX-mia', area: 'B59' },
    ]);
    expect(result.columns[0]?.recentPrice).toBeNull();
    expect(result.columns[0]?.redevelopments?.[0]?.stage).toBe('새 단계');
  });

  it('preserves the server error code for an unavailable policy', async () => {
    server.use(
      http.get('*/api/house/budget-policy', () =>
        HttpResponse.json(
          { code: 'HOUSE_BUDGET_POLICY_NOT_FOUND', title: '정책이 없습니다.' },
          { status: 503 }
        )
      )
    );
    await expect(houseApi.getBudgetPolicy()).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      apiCode: 'HOUSE_BUDGET_POLICY_NOT_FOUND',
      status: 503,
    });
  });
});
