import { useEffect, useRef, useState } from 'react';
import type {
  GeoPoint,
  RouteSegment,
  RouteStop,
} from '@/domains/geo/utils/route-geometry';
import type { KakaoMap, KakaoMaps, KakaoOverlay } from '@/lib/kakao/kakao-maps';

type RouteMapProps = {
  /** From `useKakaoMaps()` once its status is `ready`. */
  maps: KakaoMaps;
  stops: RouteStop[];
  segments: RouteSegment[];
  /** FC6: current position. Drawn distinctly with a dashed straight leg to stop 1. */
  origin?: GeoPoint | null;
};

const LINE_COLOR = '#a34f6d';

function markerElement(text: string, className: string) {
  const element = document.createElement('div');
  element.className = className;
  element.textContent = text;
  // Decorative: the list next to the map carries the same information.
  element.setAttribute('aria-hidden', 'true');

  return element;
}

/**
 * Kakao map with numbered markers and straight lines. Kakao's logo and
 * copyright stay visible; the data attribution sits under the map (02 doc).
 */
export function RouteMap({ maps, stops, segments, origin }: RouteMapProps) {
  const containerRef = useRef<HTMLElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const first = origin ?? stops[0];
    if (!container || !first) {
      return;
    }

    const created: KakaoOverlay[] = [];
    let observer: ResizeObserver | undefined;
    try {
      if (!mapRef.current) {
        mapRef.current = new maps.Map(container, {
          center: new maps.LatLng(first.latitude, first.longitude),
          level: 4,
        });
      }
      const map = mapRef.current;
      const bounds = new maps.LatLngBounds();
      const toLatLng = (point: GeoPoint) =>
        new maps.LatLng(point.latitude, point.longitude);

      function add(object: KakaoOverlay) {
        object.setMap(map);
        created.push(object);
      }

      for (const segment of segments) {
        segment.path?.forEach((point) => {
          bounds.extend(toLatLng(point));
        });
        add(
          new maps.Polyline({
            path: (segment.path ?? [segment.from, segment.to]).map(toLatLng),
            strokeWeight: 4,
            strokeColor: LINE_COLOR,
            strokeOpacity: 0.85,
            strokeStyle: 'solid',
          })
        );
      }

      // Revisited coordinates remain separate route stops and line segments.
      // Only their visual overlays share a label, so a later marker cannot
      // cover the earlier visit's numbers at exactly the same position.
      const markersByPosition = new Map<
        string,
        { stop: RouteStop; labels: string[] }
      >();
      for (const stop of stops) {
        const key = `${stop.latitude},${stop.longitude}`;
        const marker = markersByPosition.get(key);
        if (marker) marker.labels.push(stop.label);
        else markersByPosition.set(key, { stop, labels: [stop.label] });
      }
      for (const { stop, labels } of markersByPosition.values()) {
        const position = toLatLng(stop);
        bounds.extend(position);
        add(
          new maps.CustomOverlay({
            position,
            content: markerElement(
              labels.join(' / '),
              'slcn-route-map__marker'
            ),
            yAnchor: 1,
            zIndex: 2,
          })
        );
      }

      if (origin) {
        const position = toLatLng(origin);
        bounds.extend(position);
        add(
          new maps.CustomOverlay({
            position,
            content: markerElement(
              '출발',
              'slcn-route-map__marker slcn-route-map__marker--origin'
            ),
            yAnchor: 1,
            zIndex: 3,
          })
        );
        if (stops[0]) {
          add(
            new maps.Polyline({
              path: [position, toLatLng(stops[0])],
              strokeWeight: 3,
              strokeColor: LINE_COLOR,
              strokeOpacity: 0.7,
              strokeStyle: 'shortdash',
            })
          );
        }
      }

      const fit = () => {
        map.relayout();
        if (stops.length + (origin ? 1 : 0) > 1) {
          map.setBounds(bounds, 48, 48, 48, 48);
        } else {
          map.setCenter(toLatLng(first));
        }
      };
      fit();
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(fit);
        observer.observe(container);
      }
    } catch {
      setFailed(true);
      for (const object of created) object.setMap(null);
      mapRef.current = null;
    }

    return () => {
      observer?.disconnect();
      for (const object of created) {
        object.setMap(null);
      }
    };
  }, [maps, stops, segments, origin]);

  if (failed) {
    return (
      <p className='slcn-visit-route__notice' role='status'>
        지도를 표시하지 못했어요. 방문 순서는 목록에서 확인해 주세요.
      </p>
    );
  }

  return (
    <figure className='slcn-route-map'>
      <section
        ref={containerRef}
        className='slcn-route-map__canvas'
        aria-label='방문 순서 지도'
      />
      <figcaption className='slcn-route-map__attribution'>
        주소·좌표: 행정안전부
      </figcaption>
    </figure>
  );
}
