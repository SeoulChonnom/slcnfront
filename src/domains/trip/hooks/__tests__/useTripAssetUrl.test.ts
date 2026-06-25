import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tripFilesApi } from '../../api/trip-files-api';
import type { FileAsset } from '../../types';
import { useTripAssetUrl } from '../useTripAssetUrl';

function fileAsset(overrides: Partial<FileAsset> = {}): FileAsset {
  return {
    fileId: 'file-1',
    type: 'map',
    originalFilename: 'map.png',
    filename: 'map.png',
    path: '/files/map.png',
    mimeType: 'image/png',
    size: 1024,
    ...overrides,
  };
}

vi.mock('../../api/trip-files-api', () => ({
  tripFilesApi: {
    downloadTripFile: vi.fn(async (ref: FileAsset) => {
      return new File([ref.filename], `${ref.filename}.png`, {
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
    const ref = fileAsset({ fileId: 'map-1', filename: 'map1.png' });
    const { result, unmount } = renderHook(() => useTripAssetUrl(ref));

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.objectUrl).toBe('blob:map1.png.png');
      expect(result.current.isPending).toBe(false);
    });

    expect(downloadTripFile).toHaveBeenCalledWith(ref);

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:map1.png.png');
  });

  it('stays idle when no ref is provided', () => {
    const downloadTripFile = vi.mocked(tripFilesApi.downloadTripFile);
    const { result } = renderHook(() => useTripAssetUrl(null));

    expect(result.current.objectUrl).toBeNull();
    expect(result.current.isPending).toBe(false);
    expect(downloadTripFile).not.toHaveBeenCalled();
  });
});
