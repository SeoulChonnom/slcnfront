import { useEffect, useRef } from 'react';
import type {
  GeoPoint,
  RouteSegment,
  RouteStop,
} from '@/domains/geo/utils/route-geometry';

type RouteMapProps = {
  /** From `useKakaoMaps()` once its status is `ready`. */
  maps: typeof kakao.maps;
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
  const mapRef = useRef<kakao.maps.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const first = origin ?? stops[0];
    if (!container || !first) {
      return;
    }

    if (!mapRef.current) {
      mapRef.current = new maps.Map(container, {
        center: new maps.LatLng(first.latitude, first.longitude),
        level: 4,
      });
    }
    const map = mapRef.current;
    const created: { setMap: (target: kakao.maps.Map | null) => void }[] = [];
    const bounds = new maps.LatLngBounds();
    const toLatLng = (point: GeoPoint) =>
      new maps.LatLng(point.latitude, point.longitude);

    function add(object: { setMap: (target: kakao.maps.Map | null) => void }) {
      object.setMap(map);
      created.push(object);
    }

    for (const segment of segments) {
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

    for (const stop of stops) {
      const position = toLatLng(stop);
      bounds.extend(position);
      add(
        new maps.CustomOverlay({
          position,
          content: markerElement(stop.label, 'slcn-route-map__marker'),
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

    map.relayout();
    if (stops.length + (origin ? 1 : 0) > 1) {
      map.setBounds(bounds, 48, 48, 48, 48);
    }

    return () => {
      for (const object of created) {
        object.setMap(null);
      }
    };
  }, [maps, stops, segments, origin]);

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
