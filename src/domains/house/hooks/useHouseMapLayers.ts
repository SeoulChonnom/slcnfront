import { useEffect, useRef } from 'react';
import type { ComplexSummaryItem, HouseComplex } from '@/domains/house/types';
import { formatEok } from '@/domains/house/utils/format-eok';
import type {
  KakaoCluster,
  KakaoMap,
  KakaoMaps,
  KakaoMarker,
  KakaoOverlay,
} from '@/lib/kakao/kakao-maps';

export function useHouseMapLayers({
  instance,
  summaries,
  complexes,
  selectedId,
  statsReady,
  onSummary,
  onComplex,
}: {
  instance: { map: KakaoMap; maps: KakaoMaps } | undefined;
  summaries: ComplexSummaryItem[] | undefined;
  complexes: HouseComplex[] | undefined;
  selectedId: string | null;
  statsReady: boolean;
  onSummary: (item: ComplexSummaryItem) => void;
  onComplex: (item: HouseComplex) => void;
}) {
  const handlers = useRef({ onSummary, onComplex });
  handlers.current = { onSummary, onComplex };

  useEffect(() => {
    if (!instance) return;
    const { maps, map } = instance;
    const overlays: KakaoOverlay[] = [];
    for (const item of summaries ?? []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `house-map-marker house-map-marker--summary${item.count === 0 ? ' is-empty' : ''}`;
      button.textContent = statsReady
        ? `${item.name} · ${item.count}`
        : item.name;
      button.onclick = () => handlers.current.onSummary(item);
      overlays.push(
        new maps.CustomOverlay({
          map,
          content: button,
          position: new maps.LatLng(item.centerLat, item.centerLng),
          clickable: true,
        })
      );
    }

    const clusterer = complexes?.length
      ? new maps.MarkerClusterer({
          map,
          averageCenter: true,
          gridSize: 50,
          minLevel: 1,
          minClusterSize: 2,
        })
      : undefined;
    const markerOverlays = new Map<KakaoMarker, KakaoOverlay>();
    for (const item of complexes ?? []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `house-map-marker${item.complexId === selectedId ? ' is-selected' : ''}${item.recentPrice ? '' : ' is-no-trade'}`;
      button.textContent = item.recentPrice
        ? formatEok(item.recentPrice.priceManwon, 'map')
        : '';
      button.setAttribute(
        'aria-label',
        `${item.name} ${item.districtName} ${item.umdName} ${item.recentPrice ? formatEok(item.recentPrice.priceManwon) : '최근 6개월 거래 없음'}`
      );
      button.setAttribute(
        'aria-pressed',
        String(item.complexId === selectedId)
      );
      button.onclick = () => handlers.current.onComplex(item);
      const position = new maps.LatLng(item.latitude, item.longitude);
      const overlay = new maps.CustomOverlay({
        map,
        position,
        content: button,
        clickable: true,
        zIndex: item.complexId === selectedId ? 2 : 1,
      });
      overlays.push(overlay);
      // Native invisible markers drive clustering; the visible labels remain CustomOverlays.
      markerOverlays.set(new maps.Marker({ position, opacity: 0 }), overlay);
    }
    const onClustered = (clusters: KakaoCluster[]) => {
      for (const cluster of clusters) {
        for (const marker of cluster.getMarkers()) {
          markerOverlays
            .get(marker)
            ?.setMap(cluster.getSize() === 1 ? map : null);
        }
      }
    };
    if (clusterer) {
      maps.event.addListener(clusterer, 'clustered', onClustered);
      clusterer.addMarkers([...markerOverlays.keys()]);
    }
    return () => {
      if (clusterer) {
        maps.event.removeListener(clusterer, 'clustered', onClustered);
        clusterer.clear();
      }
      for (const overlay of overlays) overlay.setMap(null);
    };
  }, [instance, summaries, complexes, selectedId, statsReady]);
}
