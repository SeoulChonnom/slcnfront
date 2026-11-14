import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@/lib/api/api-client';

describe('explicit request replay policy', () => {
  it('does not replay a paid POST after 401 even if another request renewed the token', async () => {
    let token = 'expired';
    const fetchFn = vi.fn<typeof fetch>().mockImplementation(async () => {
      token = 'renewed-elsewhere';
      return new Response(
        JSON.stringify({ title: '인증이 필요합니다.', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    });
    const client = createApiClient({
      fetchFn,
      getAccessToken: () => token,
      getBaseUrl: () => 'http://localhost:8080',
    });

    await expect(
      client.post({
        path: '/inspection-visits/v1/walking-route',
        retryAfterUnauthorized: false,
      })
    ).rejects.toMatchObject({ status: 401, apiCode: 'UNAUTHORIZED' });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
