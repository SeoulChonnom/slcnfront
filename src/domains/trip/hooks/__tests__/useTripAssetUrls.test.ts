import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tripFilesApi } from '../../api/trip-files-api';
import { useTripAssetUrls } from '../useTripAssetUrls';

vi.mock('../../api/trip-files-api', () => ({
  tripFilesApi: {
    downloadTripFile: vi.fn(async (path: string) => {
      return new File([path], `${path.replaceAll('/', '_')}.png`, {
        type: 'image/png',
      });
    }),
  },
}));

describe('useTripAssetUrls', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(
      (blob) => `blob:${(blob as File).name}`
    );
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('batches unique asset fetches and cleans up object urls', async () => {
    const downloadTripFile = vi.mocked(tripFilesApi.downloadTripFile);

    const { result, unmount } = renderHook(() =>
      useTripAssetUrls(['/logo.png', '/map1.png', '/logo.png'])
    );

    await waitFor(() => {
      expect(result.current['/logo.png']).toBe('blob:_logo.png.png');
      expect(result.current['/map1.png']).toBe('blob:_map1.png.png');
    });

    expect(downloadTripFile).toHaveBeenCalledTimes(2);
    expect(downloadTripFile).toHaveBeenNthCalledWith(1, '/logo.png');
    expect(downloadTripFile).toHaveBeenNthCalledWith(2, '/map1.png');

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:_logo.png.png');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:_map1.png.png');
  });

  it('keeps successful assets when one download fails', async () => {
    const downloadTripFile = vi.mocked(tripFilesApi.downloadTripFile);

    downloadTripFile.mockImplementation(async (path: string) => {
      if (path === '/broken.png') {
        throw new Error('download failed');
      }

      return new File([path], `${path.replaceAll('/', '_')}.png`, {
        type: 'image/png',
      });
    });

    const { result } = renderHook(() =>
      useTripAssetUrls(['/logo.png', '/broken.png'])
    );

    await waitFor(() => {
      expect(result.current['/logo.png']).toBe('blob:_logo.png.png');
    });

    expect(result.current['/broken.png']).toBeUndefined();
  });

  it('replaces prior object urls when the path set changes', async () => {
    const { result, rerender } = renderHook(
      ({ paths }) => useTripAssetUrls(paths),
      {
        initialProps: {
          paths: ['/logo.png'],
        },
      }
    );

    await waitFor(() => {
      expect(result.current['/logo.png']).toBe('blob:_logo.png.png');
    });

    rerender({
      paths: ['/map1.png'],
    });

    await waitFor(() => {
      expect(result.current['/map1.png']).toBe('blob:_map1.png.png');
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:_logo.png.png');
  });
});
