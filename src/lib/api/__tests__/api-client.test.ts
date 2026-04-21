import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors';
import { createApiClient } from '../api-client';

describe('createApiClient', () => {
  it('handles json requests and injects auth headers', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
      getAccessToken: () => 'token-123',
    });

    const response = await client.post<{ ok: boolean }>({
      path: '/api/example',
      body: { value: 'hello' },
    });

    expect(response).toEqual({ ok: true });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/example'
    );

    const init = fetchFn.mock.calls[0]?.[1];

    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('x-auth-token')).toBe('token-123');
    expect(new Headers(init?.headers).get('content-type')).toBe(
      'application/json'
    );
    expect(init?.body).toBe(JSON.stringify({ value: 'hello' }));
  });

  it('returns blobs when requested', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('file-content', {
        status: 200,
      })
    );
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
    });

    const blob = await client.get<Blob>({
      path: '/api/file',
      responseType: 'blob',
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(await blob.text()).toBe('file-content');
  });

  it('normalizes non-ok responses into AppError', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Bad request payload' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
    });

    await expect(
      client.get({
        path: '/api/error',
      })
    ).rejects.toMatchObject({
      name: 'AppError',
      code: 'HTTP_ERROR',
      status: 400,
      message: 'Bad request payload',
    } satisfies Partial<AppError>);
  });
});
