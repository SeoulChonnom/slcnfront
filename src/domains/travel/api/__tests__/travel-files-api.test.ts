import { describe, expect, it, vi } from 'vitest';
import { createTravelFilesApi } from '@/domains/travel/api/travel-files-api';
import { createApiClient } from '@/lib/api/api-client';

function makeJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const fileAsset = {
  fileId: 'file-1',
  type: 'travel',
  originalFilename: 'photo.jpg',
  filename: 'photo-abc.jpg',
  path: '/uploads/photo-abc.jpg',
  mimeType: 'image/jpeg',
  size: 1024,
};

describe('travel-files-api', () => {
  it('uploadTravelFile: POSTs to /assets/file?type=travel with a `file` field', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse(fileAsset));
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelFilesApi(client);

    const result = await api.uploadTravelFile(
      new File(['cover'], 'cover.jpg', { type: 'image/jpeg' })
    );

    expect(result).toEqual(fileAsset);
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/assets/file?type=travel'
    );
    const init = fetchFn.mock.calls[0]?.[1];
    expect(init?.method).toBe('POST');
    if (!(init?.body instanceof FormData)) {
      throw new Error('Expected the upload body to be FormData.');
    }
    expect(init.body.get('file')).toBeInstanceOf(File);
    expect(init.body.get('files')).toBeNull();
  });

  it('uploadTravelFiles: POSTs to /assets/files?type=travel with one `files` field per file', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(makeJsonResponse([fileAsset, fileAsset]));
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelFilesApi(client);

    const result = await api.uploadTravelFiles([
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ]);

    expect(result).toEqual([fileAsset, fileAsset]);
    expect(fetchFn.mock.calls[0]?.[0]).toBe(
      'http://localhost:8080/api/assets/files?type=travel'
    );
    const init = fetchFn.mock.calls[0]?.[1];
    expect(init?.method).toBe('POST');
    if (!(init?.body instanceof FormData)) {
      throw new Error('Expected the upload body to be FormData.');
    }
    expect(init.body.getAll('files')).toHaveLength(2);
  });

  it('uploadTravelFiles: short-circuits to [] without a request when given no files', async () => {
    const fetchFn = vi.fn<typeof fetch>();
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080/api',
      getAccessToken: () => 'token-123',
    });
    const api = createTravelFilesApi(client);

    const result = await api.uploadTravelFiles([]);

    expect(result).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
