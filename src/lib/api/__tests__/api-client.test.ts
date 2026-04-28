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

  it('passes through FormData bodies without json encoding', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('uploaded-path', {
        status: 200,
      })
    );
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
      getAccessToken: () => 'token-123',
    });

    const formData = new FormData();
    formData.append(
      'file',
      new File(['logo'], 'logo.png', { type: 'image/png' })
    );

    const response = await client.post<string>({
      path: '/api/file',
      query: {
        path: 'logo',
      },
      body: formData,
      responseType: 'text',
    });

    expect(response).toBe('uploaded-path');
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/file?path=logo'
    );

    const init = fetchFn.mock.calls[0]?.[1];

    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('x-auth-token')).toBe('token-123');
    expect(new Headers(init?.headers).get('content-type')).toBeNull();
    expect(init?.body).toBe(formData);
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

  it('passes through successful json payloads without validating their shape', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: 123 }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
    });

    const response = await client.get<{ ok: boolean }>({
      path: '/api/example',
    });

    expect(response).toEqual({ unexpected: 123 });
  });

  it('returns undefined for empty successful responses', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('', {
        status: 200,
      })
    );
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
    });

    const response = await client.get({
      path: '/api/empty',
    });

    expect(response).toBeUndefined();
  });

  it('falls back to the HTTP status text for empty text error responses', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('', {
        status: 502,
        statusText: 'Bad Gateway',
        headers: {
          'Content-Type': 'text/plain',
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
      status: 502,
      message: '502 Bad Gateway',
    } satisfies Partial<AppError>);
  });
});
