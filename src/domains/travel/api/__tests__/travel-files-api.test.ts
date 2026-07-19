import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../../../lib/api/api-client';
import { createTravelFilesApi } from '../travel-files-api';

describe('travel-files-api', () => {
  it('downloadTravelFile calls GET /assets/files/{fileId} with blob response type', async () => {
    const blob = new Blob(['image data'], { type: 'image/jpeg' });
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(blob, {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
      })
    );

    const client = createApiClient({ fetchFn });
    const travelFilesApi = createTravelFilesApi(client);

    const result = await travelFilesApi.downloadTravelFile('photo-abc');

    expect(fetchFn).toHaveBeenCalledOnce();
    const [url] = fetchFn.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain('/assets/files/photo-abc');
    expect(result).toBeInstanceOf(Blob);
  });

  it('encodes special characters in the fileId', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(new Blob(), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      })
    );

    const client = createApiClient({ fetchFn });
    const travelFilesApi = createTravelFilesApi(client);

    await travelFilesApi.downloadTravelFile('file id/with spaces');

    const [url] = fetchFn.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain('file%20id%2Fwith%20spaces');
  });
});
