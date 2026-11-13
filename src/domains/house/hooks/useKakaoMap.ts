import { useEffect, useRef, useState } from 'react';
import type { MapBounds, MapPosition } from '@/domains/house/types';
import { loadKakaoMaps } from '@/lib/kakao/kakao-loader';
import type { KakaoMap, KakaoMaps } from '@/lib/kakao/kakao-maps';

export function useKakaoMap(
  appKey: string | null | undefined,
  position: MapPosition,
  onPositionChange: (position: MapPosition) => void
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<{
    map: KakaoMap;
    maps: KakaoMaps;
  }>();
  const [view, setView] = useState<{ bounds: MapBounds; level: number }>();
  const [failed, setFailed] = useState(false);
  const latestPosition = useRef(position);
  const onChange = useRef(onPositionChange);
  latestPosition.current = position;
  onChange.current = onPositionChange;

  useEffect(() => {
    if (!appKey) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    void loadKakaoMaps(appKey)
      .then((maps) => {
        if (disposed || !containerRef.current) return;
        const initial = latestPosition.current;
        const map = new maps.Map(containerRef.current, {
          center: new maps.LatLng(initial.lat, initial.lng),
          level: initial.level,
        });
        let timer: ReturnType<typeof setTimeout> | undefined;
        const readView = () => {
          const bounds = map.getBounds();
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          const center = map.getCenter();
          setView({
            bounds: {
              swLat: sw.getLat(),
              swLng: sw.getLng(),
              neLat: ne.getLat(),
              neLng: ne.getLng(),
            },
            level: map.getLevel(),
          });
          onChange.current({
            lat: center.getLat(),
            lng: center.getLng(),
            level: map.getLevel(),
          });
        };
        const onIdle = () => {
          clearTimeout(timer);
          timer = setTimeout(readView, 300);
        };
        maps.event.addListener(map, 'idle', onIdle);
        const observer = new ResizeObserver(() => {
          map.relayout();
          onIdle();
        });
        observer.observe(containerRef.current);
        setInstance({ map, maps });
        readView();
        cleanup = () => {
          clearTimeout(timer);
          observer.disconnect();
          maps.event.removeListener(map, 'idle', onIdle);
        };
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [appKey]);

  useEffect(() => {
    if (!instance) return;
    const { map, maps } = instance;
    const center = map.getCenter();
    if (map.getLevel() !== position.level) map.setLevel(position.level);
    if (
      Math.abs(center.getLat() - position.lat) > 0.00001 ||
      Math.abs(center.getLng() - position.lng) > 0.00001
    ) {
      map.setCenter(new maps.LatLng(position.lat, position.lng));
    }
  }, [instance, position.lat, position.lng, position.level]);

  return { containerRef, instance, view, failed };
}
