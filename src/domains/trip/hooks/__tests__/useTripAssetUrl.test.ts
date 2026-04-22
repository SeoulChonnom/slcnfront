import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tripFilesApi } from '../../api/trip-files-api';
import { useTripAssetUrl } from '../useTripAssetUrl';

vi.mock('../../api/trip-files-api', () => ({
  tripFilesApi: {
    downloadTripFile: vi.fn(async (path: string) => {
      return new File([path], `${path.replaceAll('/', '_')}.png`, {
        type: 'image/png',
      });
    }),
  },
}));

describe('useTripAssetUrl', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(
      (blob) => `blob:${(blob as File).name}`
    );
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads a single asset and cleans up its object url', async () => {
    const downloadTripFile = vi.mocked(tripFilesApi.downloadTripFile);
    const { result, unmount } = renderHook(() => useTripAssetUrl('/map1.png'));

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.objectUrl).toBe('blob:_map1.png.png');
      expect(result.current.isPending).toBe(false);
    });

    expect(downloadTripFile).toHaveBeenCalledWith('/map1.png');

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:_map1.png.png');
  });

  it('stays idle when no path is provided', () => {
    const downloadTripFile = vi.mocked(tripFilesApi.downloadTripFile);
    const { result } = renderHook(() => useTripAssetUrl(null));

    expect(result.current.objectUrl).toBeNull();
    expect(result.current.isPending).toBe(false);
    expect(downloadTripFile).not.toHaveBeenCalled();
  });
});
