import { afterEach, describe, expect, it, vi } from 'vitest';
import type { KakaoMaps } from '@/lib/kakao/kakao-maps';

function initializedMaps() {
  return {
    load: vi.fn((callback: () => void) => callback()),
    Map: class {},
    Polyline: class {},
    MarkerClusterer: class {},
  } as unknown as KakaoMaps;
}

afterEach(() => {
  delete window.kakao;
  document
    .querySelectorAll('script[src*="dapi.kakao.com"]')
    .forEach((script) => {
      script.remove();
    });
  vi.resetModules();
  vi.useRealTimers();
});

describe('loadKakaoMaps', () => {
  it('shares one pending load and waits for the SDK load callback', async () => {
    const { loadKakaoMaps } = await import('@/lib/kakao/kakao-loader');
    const first = loadKakaoMaps('test-key');
    expect(loadKakaoMaps('test-key')).toBe(first);
    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="dapi.kakao.com"]'
    );
    if (!script) throw new Error('SDK script missing');
    expect(new URL(script.src).searchParams.get('autoload')).toBe('false');
    expect(new URL(script.src).searchParams.get('libraries')).toBe('clusterer');
    const maps = initializedMaps();
    window.kakao = { maps };
    script.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBe(maps);
    expect(loadKakaoMaps('test-key')).toBe(first);
    expect(
      document.querySelectorAll('script[src*="dapi.kakao.com"]')
    ).toHaveLength(1);
  });

  it('releases a failed load so a later visit can retry', async () => {
    const { loadKakaoMaps } = await import('@/lib/kakao/kakao-loader');
    const first = loadKakaoMaps('test-key');
    const rejected = expect(first).rejects.toThrow('지도를 불러오지 못했어요.');
    document
      .querySelector('script[src*="dapi.kakao.com"]')
      ?.dispatchEvent(new Event('error'));
    await rejected;
    const retry = loadKakaoMaps('test-key');
    expect(retry).not.toBe(first);
    const maps = initializedMaps();
    window.kakao = { maps };
    document
      .querySelector('script[src*="dapi.kakao.com"]')
      ?.dispatchEvent(new Event('load'));
    await expect(retry).resolves.toBe(maps);
  });

  it('times out an SDK that never initializes', async () => {
    vi.useFakeTimers();
    const { loadKakaoMaps } = await import('@/lib/kakao/kakao-loader');
    const rejected = expect(loadKakaoMaps('test-key')).rejects.toThrow(
      '지도를 불러오지 못했어요.'
    );
    await vi.advanceTimersByTimeAsync(15_000);
    await rejected;
    expect(document.querySelector('script[src*="dapi.kakao.com"]')).toBeNull();
  });

  it.each(['geo-first', 'house-first'] as const)(
    'shares the SDK, pending load and required libraries with %s',
    async (order) => {
      const geo = await import('@/domains/geo/map/kakao-loader');
      const house = await import('@/lib/kakao/kakao-loader');
      const [first, second] =
        order === 'geo-first' ? [geo, house] : [house, geo];
      const firstVisit = first.loadKakaoMaps('test-key');
      expect(second.loadKakaoMaps('test-key')).toBe(firstVisit);
      const scripts = document.querySelectorAll<HTMLScriptElement>(
        'script[src*="dapi.kakao.com"]'
      );
      expect(scripts).toHaveLength(1);
      expect(new URL(scripts[0].src).searchParams.get('libraries')).toBe(
        'clusterer'
      );
      const maps = initializedMaps();
      window.kakao = { maps };
      scripts[0].dispatchEvent(new Event('load'));
      const loaded = await firstVisit;
      expect(await second.loadKakaoMaps('test-key')).toBe(loaded);
      expect(new loaded.Polyline({ path: [] })).toBeInstanceOf(maps.Polyline);
      const map = new loaded.Map(document.createElement('div'), {
        center: {} as InstanceType<KakaoMaps['LatLng']>,
      });
      expect(
        new loaded.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 1,
          gridSize: 50,
          minClusterSize: 2,
        })
      ).toBeInstanceOf(maps.MarkerClusterer);
      expect(maps.load).toHaveBeenCalledTimes(1);
      expect(
        document.querySelectorAll('script[src*="dapi.kakao.com"]')
      ).toHaveLength(1);
    }
  );

  it('reuses an initialized SDK without injecting another script', async () => {
    const maps = initializedMaps();
    window.kakao = { maps };
    const geo = await import('@/domains/geo/map/kakao-loader');
    const house = await import('@/lib/kakao/kakao-loader');
    expect(await geo.loadKakaoMaps('test-key')).toBe(maps);
    expect(await house.loadKakaoMaps('test-key')).toBe(maps);
    expect(maps.load).toHaveBeenCalledTimes(1);
    expect(document.querySelector('script[src*="dapi.kakao.com"]')).toBeNull();
  });

  it('does not expose a legacy SDK without clusterer as ready', async () => {
    const legacyMaps = initializedMaps();
    Reflect.deleteProperty(legacyMaps, 'MarkerClusterer');
    window.kakao = { maps: legacyMaps };
    const { loadKakaoMaps } = await import('@/lib/kakao/kakao-loader');
    await expect(loadKakaoMaps('test-key')).rejects.toThrow(
      '지도를 불러오지 못했어요.'
    );
    const readyMaps = initializedMaps();
    window.kakao = { maps: readyMaps };
    await expect(loadKakaoMaps('test-key')).resolves.toBe(readyMaps);
  });
});
