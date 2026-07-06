import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { travelFilesApi } from '../../api/travel-files-api';
import { useTravelAssetUrls } from '../useTravelAssetUrls';

vi.mock('../../api/travel-files-api', () => ({
  travelFilesApi: {
    downloadTravelFile: vi.fn(async (fileId: string) => {
      return new File([fileId], `${fileId}.png`, { type: 'image/png' });
    }),
  },
}));

describe('useTravelAssetUrls', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(
      (blob) => `blob:${(blob as File).name}`
    );
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('batches unique file fetches and cleans up object urls', async () => {
    const downloadTravelFile = vi.mocked(travelFilesApi.downloadTravelFile);

    const { result, unmount } = renderHook(() =>
      useTravelAssetUrls(['photo-1', 'photo-2', 'photo-1'])
    );

    await waitFor(() => {
      expect(result.current['photo-1']).toBe('blob:photo-1.png');
      expect(result.current['photo-2']).toBe('blob:photo-2.png');
    });

    expect(downloadTravelFile).toHaveBeenCalledTimes(2);
    expect(downloadTravelFile).toHaveBeenNthCalledWith(1, 'photo-1');
    expect(downloadTravelFile).toHaveBeenNthCalledWith(2, 'photo-2');

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-1.png');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-2.png');
  });

  it('keeps successful assets when one download fails', async () => {
    const downloadTravelFile = vi.mocked(travelFilesApi.downloadTravelFile);

    downloadTravelFile.mockImplementation(async (fileId: string) => {
      if (fileId === 'broken-1') {
        throw new Error('download failed');
      }
      return new File([fileId], `${fileId}.png`, { type: 'image/png' });
    });

    const { result } = renderHook(() =>
      useTravelAssetUrls(['photo-1', 'broken-1'])
    );

    await waitFor(() => {
      expect(result.current['photo-1']).toBe('blob:photo-1.png');
    });

    expect(result.current['broken-1']).toBeUndefined();
  });

  it('replaces prior object urls when the id set changes', async () => {
    const { result, rerender } = renderHook(
      ({ ids }) => useTravelAssetUrls(ids),
      { initialProps: { ids: ['photo-1'] as Array<string | null | undefined> } }
    );

    await waitFor(() => {
      expect(result.current['photo-1']).toBe('blob:photo-1.png');
    });

    rerender({ ids: ['photo-2'] });

    await waitFor(() => {
      expect(result.current['photo-2']).toBe('blob:photo-2.png');
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo-1.png');
  });

  it('skips null and undefined ids', async () => {
    const downloadTravelFile = vi.mocked(travelFilesApi.downloadTravelFile);

    const { result } = renderHook(() =>
      useTravelAssetUrls([null, undefined, 'photo-1', null])
    );

    await waitFor(() => {
      expect(result.current['photo-1']).toBe('blob:photo-1.png');
    });

    expect(downloadTravelFile).toHaveBeenCalledTimes(1);
    expect(downloadTravelFile).toHaveBeenCalledWith('photo-1');
  });
});
