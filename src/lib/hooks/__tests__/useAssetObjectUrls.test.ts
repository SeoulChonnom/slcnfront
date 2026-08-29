import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type AssetObjectUrlsOptions,
  useAssetObjectUrls,
} from '@/lib/hooks/useAssetObjectUrls';

type Asset = { id: string };

const download = vi.fn(
  async (asset: Asset) =>
    new File([asset.id], `${asset.id}.png`, { type: 'image/png' })
);

const options: AssetObjectUrlsOptions<Asset> = {
  getKey: (asset) => asset.id,
  download: (asset) => download(asset),
};

function assets(...ids: string[]): Array<Asset | null> {
  return ids.map((id) => ({ id }));
}

describe('useAssetObjectUrls', () => {
  beforeEach(() => {
    download.mockClear();
    download.mockImplementation(
      async (asset: Asset) =>
        new File([asset.id], `${asset.id}.png`, { type: 'image/png' })
    );
    vi.spyOn(URL, 'createObjectURL').mockImplementation(
      (blob) => `blob:${(blob as File).name}`
    );
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps loaded assets that survive a list change instead of refetching them', async () => {
    const { result, rerender } = renderHook(
      ({ items }) => useAssetObjectUrls(items, options),
      { initialProps: { items: assets('a', 'b', 'c') } }
    );

    await waitFor(() => {
      expect(result.current.objectUrls.a).toBe('blob:a.png');
      expect(result.current.objectUrls.c).toBe('blob:c.png');
    });
    expect(download).toHaveBeenCalledTimes(3);

    // A filtered list: 'a' and 'c' survive, 'b' drops out.
    rerender({ items: assets('a', 'c') });

    // The survivors keep their existing object URL — no second download, and
    // no intermediate frame where the image src is gone. 'b' is retained, not
    // revoked; callers simply stop looking it up.
    expect(download).toHaveBeenCalledTimes(3);
    expect(result.current.objectUrls.a).toBe('blob:a.png');
    expect(result.current.objectUrls.c).toBe('blob:c.png');
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith('blob:a.png');
  });

  it('reuses a retained asset when a filter is widened again', async () => {
    const { result, rerender } = renderHook(
      ({ items }) => useAssetObjectUrls(items, options),
      { initialProps: { items: assets('a', 'b', 'c') } }
    );

    await waitFor(() => {
      expect(result.current.objectUrls.c).toBe('blob:c.png');
    });
    expect(download).toHaveBeenCalledTimes(3);

    rerender({ items: assets('a') });
    await waitFor(() => {
      expect(result.current.objectUrls.a).toBe('blob:a.png');
    });

    // Clearing the filter must not re-download what was just on screen.
    rerender({ items: assets('a', 'b', 'c') });
    await waitFor(() => {
      expect(result.current.objectUrls.c).toBe('blob:c.png');
    });

    expect(download).toHaveBeenCalledTimes(3);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('evicts retained assets past the retention limit', async () => {
    const initial = Array.from({ length: 20 }, (_, i) => `k${i}`);
    const { result, rerender } = renderHook(
      ({ items }) => useAssetObjectUrls(items, options),
      { initialProps: { items: assets(...initial) } }
    );

    await waitFor(() => {
      expect(result.current.objectUrls.k19).toBe('blob:k19.png');
    });

    rerender({ items: assets('k19') });

    // 19 assets dropped out but only 16 may be retained, so the three oldest
    // are revoked.
    await waitFor(() => {
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:k0.png');
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:k2.png');
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith('blob:k3.png');
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith('blob:k19.png');
  });

  it('downloads only the keys added by a list change', async () => {
    const { result, rerender } = renderHook(
      ({ items }) => useAssetObjectUrls(items, options),
      { initialProps: { items: assets('a') } }
    );

    await waitFor(() => {
      expect(result.current.objectUrls.a).toBe('blob:a.png');
    });

    rerender({ items: assets('a', 'b') });

    await waitFor(() => {
      expect(result.current.objectUrls.b).toBe('blob:b.png');
    });

    expect(download).toHaveBeenCalledTimes(2);
    expect(download).toHaveBeenLastCalledWith({ id: 'b' });
  });

  it('retains a download that lands after its key left the list', async () => {
    let releaseB: (() => void) | undefined;
    download.mockImplementation(async (asset: Asset) => {
      if (asset.id === 'b') {
        await new Promise<void>((resolve) => {
          releaseB = resolve;
        });
      }

      return new File([asset.id], `${asset.id}.png`, { type: 'image/png' });
    });

    const { result, rerender } = renderHook(
      ({ items }) => useAssetObjectUrls(items, options),
      { initialProps: { items: assets('a', 'b') } }
    );

    await waitFor(() => {
      expect(releaseB).toBeDefined();
    });

    rerender({ items: assets('a') });
    releaseB?.();

    await waitFor(() => {
      expect(result.current.objectUrls.a).toBe('blob:a.png');
    });

    // Kept rather than discarded: re-adding 'b' must not download it again.
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith('blob:b.png');
    expect(download).toHaveBeenCalledTimes(2);

    rerender({ items: assets('a', 'b') });
    await waitFor(() => {
      expect(result.current.objectUrls.b).toBe('blob:b.png');
    });
    expect(download).toHaveBeenCalledTimes(2);
  });

  it('revokes everything on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useAssetObjectUrls(assets('a', 'b'), options)
    );

    await waitFor(() => {
      expect(result.current.objectUrls.b).toBe('blob:b.png');
    });

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:b.png');
  });
});
