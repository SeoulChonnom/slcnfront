import { act, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useHouseMapLayers } from '@/domains/house/hooks/useHouseMapLayers';
import { useKakaoMap } from '@/domains/house/hooks/useKakaoMap';
import type { HouseComplex } from '@/domains/house/types';
import { getMapQuery } from '@/domains/house/utils/map-bounds';
import { loadKakaoMaps } from '@/lib/kakao/kakao-loader';
import type {
  KakaoCluster,
  KakaoMap,
  KakaoMaps,
  KakaoMarker,
} from '@/lib/kakao/kakao-maps';

vi.mock('@/lib/kakao/kakao-loader', () => ({ loadKakaoMaps: vi.fn() }));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function latLng(lat: number, lng: number) {
  return { getLat: () => lat, getLng: () => lng };
}

describe('Kakao integration lifecycle with a simulated SDK', () => {
  it('clusters 300 labels and removes every overlay and cluster listener on unmount', () => {
    const overlays: {
      content: HTMLButtonElement;
      setMap: ReturnType<typeof vi.fn>;
    }[] = [];
    const clusterer = { addMarkers: vi.fn(), clear: vi.fn() };
    let clusterListener: ((clusters: KakaoCluster[]) => void) | undefined;
    const removeListener = vi.fn();
    const map = {} as KakaoMap;
    const maps = {
      LatLng: vi.fn(function MockLatLng(lat: number, lng: number) {
        return latLng(lat, lng);
      }),
      CustomOverlay: vi.fn(function MockOverlay(options: {
        content: HTMLButtonElement;
      }) {
        const overlay = { content: options.content, setMap: vi.fn() };
        overlays.push(overlay);
        return overlay;
      }),
      Marker: vi.fn(function MockMarker() {
        return { setMap: vi.fn() };
      }),
      MarkerClusterer: vi.fn(function MockClusterer() {
        return clusterer;
      }),
      event: {
        addListener: (
          _target: unknown,
          _event: string,
          handler: (clusters: KakaoCluster[]) => void
        ) => {
          clusterListener = handler;
        },
        removeListener,
      },
    } as unknown as KakaoMaps;
    const complexes: HouseComplex[] = Array.from(
      { length: 300 },
      (_, index) => ({
        complexId: `c${index}`,
        name: `단지 ${index}`,
        lawdCd: '11305',
        districtName: '강북구',
        umdName: '미아동',
        latitude: 37.6 + index * 0.00001,
        longitude: 127.02,
        buildYear: 2000,
        households: 300,
        recentPrice: { priceManwon: 50000, windowMonths: 3, sample: 5 },
      })
    );
    const onComplex = vi.fn();
    const { unmount } = renderHook(() =>
      useHouseMapLayers({
        instance: { map, maps },
        summaries: undefined,
        complexes,
        selectedId: 'c0',
        statsReady: true,
        onSummary: vi.fn(),
        onComplex,
      })
    );
    expect(overlays).toHaveLength(300);
    expect(clusterer.addMarkers).toHaveBeenCalledTimes(1);
    const markers = clusterer.addMarkers.mock.calls[0][0] as KakaoMarker[];
    expect(markers).toHaveLength(300);
    overlays[0].content.click();
    expect(onComplex).toHaveBeenCalledWith(complexes[0]);
    clusterListener?.([
      { getSize: () => 2, getMarkers: () => markers.slice(0, 2) },
      { getSize: () => 1, getMarkers: () => [markers[2]] },
    ]);
    expect(overlays[0].setMap).toHaveBeenLastCalledWith(null);
    expect(overlays[1].setMap).toHaveBeenLastCalledWith(null);
    expect(overlays[2].setMap).toHaveBeenLastCalledWith(map);
    unmount();
    expect(clusterer.clear).toHaveBeenCalledTimes(1);
    expect(removeListener).toHaveBeenCalledWith(
      clusterer,
      'clustered',
      clusterListener
    );
    for (const overlay of overlays)
      expect(overlay.setMap).toHaveBeenLastCalledWith(null);
  });

  it('debounces oversized SDK bounds, promotes the request layer, and cancels pending work on unmount', async () => {
    vi.useFakeTimers();
    let northEast = latLng(37.7, 127.2011);
    const map = {
      getCenter: () => latLng(37.5665, 126.978),
      getLevel: () => 5,
      setCenter: vi.fn(),
      setLevel: vi.fn(),
      relayout: vi.fn(),
      getBounds: vi.fn(() => ({
        getSouthWest: () => latLng(37.5, 127),
        getNorthEast: () => northEast,
      })),
    };
    let idle: (() => void) | undefined;
    const removeListener = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        disconnect = disconnect;
      }
    );
    const maps = {
      Map: vi.fn(function MockMap() {
        return map;
      }),
      LatLng: vi.fn(function MockLatLng(lat: number, lng: number) {
        return latLng(lat, lng);
      }),
      event: {
        addListener: (
          _target: unknown,
          _event: string,
          handler: () => void
        ) => {
          idle = handler;
        },
        removeListener,
      },
    } as unknown as KakaoMaps;
    vi.mocked(loadKakaoMaps).mockResolvedValue(maps);
    const observed: { current?: ReturnType<typeof useKakaoMap> } = {};
    const onPositionChange = vi.fn();
    function Canvas() {
      const result = useKakaoMap(
        'test-key',
        { lat: 37.5665, lng: 126.978, level: 5 },
        onPositionChange
      );
      observed.current = result;
      return <div ref={result.containerRef} />;
    }
    const { unmount } = render(<Canvas />);
    await act(async () => {
      await Promise.resolve();
    });
    function currentQuery() {
      const view = observed.current?.view;
      if (!view) throw new Error('Expected SDK bounds');
      return getMapQuery(view.level, view.bounds, 'B59');
    }
    expect(currentQuery().layer).toBe('DONG');
    expect(currentQuery().complexes).toBeNull();
    northEast = latLng(37.7, 128.0001);
    act(() => {
      idle?.();
      idle?.();
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });
    expect(currentQuery().layer).toBe('DONG');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(currentQuery()).toMatchObject({
      layer: 'DISTRICT',
      complexes: null,
      summary: { groupBy: 'DISTRICT', area: 'B59' },
    });
    expect(currentQuery().summary).not.toHaveProperty('swLat');
    expect(map.getBounds).toHaveBeenCalledTimes(2);
    act(() => {
      idle?.();
    });
    unmount();
    await vi.advanceTimersByTimeAsync(300);
    expect(map.getBounds).toHaveBeenCalledTimes(2);
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(removeListener).toHaveBeenCalledWith(map, 'idle', idle);
  });
});
