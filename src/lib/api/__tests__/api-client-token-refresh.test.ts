import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@/lib/api/api-client';
import type { AppError } from '@/lib/api/errors';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function unauthorizedResponse() {
  return jsonResponse(
    { title: '인증이 필요합니다.', status: 401, code: 'UNAUTHORIZED' },
    401
  );
}

function sentToken(fetchFn: ReturnType<typeof vi.fn<typeof fetch>>, call = 0) {
  return new Headers(fetchFn.mock.calls[call]?.[1]?.headers).get(
    'x-auth-token'
  );
}

describe('createApiClient access token refresh', () => {
  it('reissues an expired access token and retries the request once', async () => {
    let accessToken = 'expired-token';
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(unauthorizedResponse())
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const refreshAccessToken = vi.fn(async () => {
      accessToken = 'fresh-token';
      return accessToken;
    });
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
      getAccessToken: () => accessToken,
      refreshAccessToken,
    });

    const response = await client.post<{ ok: boolean }>({
      path: '/api/example',
      body: { value: 'hello' },
    });

    expect(response).toEqual({ ok: true });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(sentToken(fetchFn, 0)).toBe('expired-token');
    expect(sentToken(fetchFn, 1)).toBe('fresh-token');
    expect(fetchFn.mock.calls[1]?.[1]?.body).toBe(
      JSON.stringify({ value: 'hello' })
    );
  });

  it('reuses a token another request already renewed instead of reissuing', async () => {
    let accessToken = 'expired-token';
    const fetchFn = vi.fn<typeof fetch>().mockImplementationOnce(async () => {
      accessToken = 'renewed-elsewhere';
      return unauthorizedResponse();
    });
    fetchFn.mockResolvedValueOnce(jsonResponse({ ok: true }));
    const refreshAccessToken = vi.fn(async () => 'should-not-be-used');
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
      getAccessToken: () => accessToken,
      refreshAccessToken,
    });

    await client.get({ path: '/api/example' });

    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(sentToken(fetchFn, 1)).toBe('renewed-elsewhere');
  });

  it('surfaces the original 401 when the session cannot be renewed', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(unauthorizedResponse());
    const refreshAccessToken = vi.fn(async () => null);
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
      getAccessToken: () => 'expired-token',
      refreshAccessToken,
    });

    await expect(client.get({ path: '/api/example' })).rejects.toMatchObject({
      code: 'HTTP_ERROR',
      status: 401,
      apiCode: 'UNAUTHORIZED',
    } satisfies Partial<AppError>);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('does not retry again when the renewed token is also rejected', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(unauthorizedResponse())
      .mockResolvedValueOnce(unauthorizedResponse());
    const refreshAccessToken = vi.fn(async () => 'fresh-token');
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
      getAccessToken: () => 'expired-token',
      refreshAccessToken,
    });

    await expect(client.get({ path: '/api/example' })).rejects.toMatchObject({
      status: 401,
    } satisfies Partial<AppError>);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('leaves anonymous requests and non-401 errors alone', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(unauthorizedResponse())
      .mockResolvedValueOnce(jsonResponse({ title: 'Forbidden' }, 403));
    const refreshAccessToken = vi.fn(async () => 'fresh-token');
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
      getAccessToken: () => 'token-123',
      refreshAccessToken,
    });

    await expect(
      client.post({ path: '/users/login', auth: false })
    ).rejects.toMatchObject({ status: 401 } satisfies Partial<AppError>);
    await expect(client.get({ path: '/api/admin' })).rejects.toMatchObject({
      status: 403,
    } satisfies Partial<AppError>);
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it('does not refresh a late 401 after logout', async () => {
    let accessToken: string | null = 'expired-token';
    const fetchFn = vi.fn<typeof fetch>().mockImplementation(async () => {
      accessToken = null;
      return unauthorizedResponse();
    });
    const refreshAccessToken = vi.fn(async () => 'fresh-token');
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
      getAccessToken: () => accessToken,
      refreshAccessToken,
    });

    await expect(client.get({ path: '/api/example' })).rejects.toMatchObject({
      status: 401,
    });
    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
