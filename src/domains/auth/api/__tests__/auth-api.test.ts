import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../../../../lib/api/errors';
import { createApiClient } from '../../../../lib/api/api-client';
import { createAuthApi, toLoginRequest } from '../auth-api';

describe('auth-api', () => {
  it('maps login form fields to the backend request shape', () => {
    expect(
      toLoginRequest({
        userName: 'slcn-admin',
        password: 'pw1234',
      })
    ).toEqual({
      username: 'slcn-admin',
      password: 'pw1234',
    });
  });

  it('posts login credentials and normalizes the response', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'token-123',
          username: 'slcn-admin',
          name: 'SLCN',
          roleList: ['ADMIN', 'USER'],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const authApi = createAuthApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    const session = await authApi.login({
      userName: 'slcn-admin',
      password: 'pw1234',
    });

    expect(session).toEqual({
      accessToken: 'token-123',
      userInfo: {
        name: 'SLCN',
        userName: 'slcn-admin',
        roleList: ['admin', 'user'],
      },
    });
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/user/login'
    );
    expect(fetchFn.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
    });
  });

  it('posts to the refresh-token reissue endpoint and normalizes the response', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'token-restore',
          username: 'slcn-admin',
          name: 'SLCN',
          roleList: ['ADMIN'],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const authApi = createAuthApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    const session = await authApi.restoreSession();

    expect(session).toEqual({
      accessToken: 'token-restore',
      userInfo: {
        name: 'SLCN',
        userName: 'slcn-admin',
        roleList: ['admin'],
      },
    });
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/user/token'
    );
    expect(fetchFn.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
    });
  });

  it('propagates restoreSession transport errors as AppError', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'restore failed' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    const authApi = createAuthApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(authApi.restoreSession()).rejects.toMatchObject({
      name: 'AppError',
      code: 'HTTP_ERROR',
      status: 401,
      message: 'restore failed',
    } satisfies Partial<AppError>);
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/user/token'
    );
    expect(fetchFn.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
    });
  });

  it('rejects malformed login success payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'token-123',
          username: 'slcn-admin',
          name: 'SLCN',
          roleList: 'ADMIN',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const authApi = createAuthApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(
      authApi.login({
        userName: 'slcn-admin',
        password: 'pw1234',
      })
    ).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Login response payload is invalid.',
    } satisfies Partial<AppError>);
  });

  it('rejects malformed restoreSession success payloads as INVALID_RESPONSE', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'token-restore',
          username: 'slcn-admin',
          roleList: ['ADMIN'],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
    const authApi = createAuthApi(
      createApiClient({
        fetchFn,
        getBaseUrl: () => 'http://localhost:8080/api',
      })
    );

    await expect(authApi.restoreSession()).rejects.toMatchObject({
      name: 'AppError',
      code: 'INVALID_RESPONSE',
      message: 'Restore session response payload is invalid.',
    } satisfies Partial<AppError>);
  });
});
