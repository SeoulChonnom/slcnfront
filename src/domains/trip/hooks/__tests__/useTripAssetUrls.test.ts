import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tripFilesApi } from '../../api/trip-files-api';
import type { FileRef } from '../../types';
import { useTripAssetUrls } from '../useTripAssetUrls';

vi.mock('../../api/trip-files-api', () => ({
  tripFilesApi: {
    downloadTripFile: vi.fn(async (ref: FileRef) => {
      return new File([ref.filename], `${ref.filename}.png`, {
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
    const logoRef: FileRef = { type: 'logo', filename: 'logo.png' };
    const map1Ref: FileRef = { type: 'map', filename: 'map1.png' };

    const { result, unmount } = renderHook(() =>
      useTripAssetUrls([logoRef, map1Ref, logoRef])
    );

    await waitFor(() => {
      expect(result.current['logo/logo.png']).toBe('blob:logo.png.png');
      expect(result.current['map/map1.png']).toBe('blob:map1.png.png');
    });

    expect(downloadTripFile).toHaveBeenCalledTimes(2);
    expect(downloadTripFile).toHaveBeenNthCalledWith(1, logoRef);
    expect(downloadTripFile).toHaveBeenNthCalledWith(2, map1Ref);

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:logo.png.png');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:map1.png.png');
  });

  it('keeps successful assets when one download fails', async () => {
    const downloadTripFile = vi.mocked(tripFilesApi.downloadTripFile);
    const logoRef: FileRef = { type: 'logo', filename: 'logo.png' };
    const brokenRef: FileRef = { type: 'map', filename: 'broken.png' };

    downloadTripFile.mockImplementation(async (ref: FileRef) => {
      if (ref.filename === 'broken.png') {
        throw new Error('download failed');
      }

      return new File([ref.filename], `${ref.filename}.png`, {
        type: 'image/png',
      });
    });

    const { result } = renderHook(() => useTripAssetUrls([logoRef, brokenRef]));

    await waitFor(() => {
      expect(result.current['logo/logo.png']).toBe('blob:logo.png.png');
    });

    expect(result.current['map/broken.png']).toBeUndefined();
  });

  it('replaces prior object urls when the ref set changes', async () => {
    const logoRef: FileRef = { type: 'logo', filename: 'logo.png' };
    const map1Ref: FileRef = { type: 'map', filename: 'map1.png' };

    const { result, rerender } = renderHook(
      ({ refs }) => useTripAssetUrls(refs),
      {
        initialProps: {
          refs: [logoRef],
        },
      }
    );

    await waitFor(() => {
      expect(result.current['logo/logo.png']).toBe('blob:logo.png.png');
    });

    rerender({
      refs: [map1Ref],
    });

    await waitFor(() => {
      expect(result.current['map/map1.png']).toBe('blob:map1.png.png');
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:logo.png.png');
  });
});
