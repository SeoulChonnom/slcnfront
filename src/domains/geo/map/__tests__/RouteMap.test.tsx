import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RouteMap } from '@/domains/geo/map/RouteMap';
import { buildSegments, buildStops } from '@/domains/geo/utils/route-geometry';

function fakeMaps() {
  const overlays: HTMLElement[] = [];
  const polylines: { strokeStyle?: string }[] = [];
  const setBounds = vi.fn();
  const maps = {
    Map: class {
      setBounds = setBounds;
      relayout = vi.fn();
    },
    LatLng: class {},
    LatLngBounds: class {
      extend = vi.fn();
    },
    CustomOverlay: class {
      constructor(options: { content: HTMLElement }) {
        overlays.push(options.content);
      }
      setMap = vi.fn();
    },
    Polyline: class {
      constructor(options: { strokeStyle?: string }) {
        polylines.push(options);
      }
      setMap = vi.fn();
    },
  };

  return {
    maps: maps as unknown as typeof kakao.maps,
    overlays,
    polylines,
    setBounds,
  };
}

describe('RouteMap', () => {
  it('draws numbered markers, straight lines and the origin leg, with attribution', () => {
    const { maps, overlays, polylines, setBounds } = fakeMaps();
    const stops = buildStops([
      {
        propertyId: 'a',
        location: { bdMgtSn: 'X', latitude: 37.5, longitude: 127 },
      },
      {
        propertyId: 'b',
        location: { bdMgtSn: 'Y', latitude: 37.51, longitude: 127 },
      },
      {
        propertyId: 'c',
        location: { bdMgtSn: 'Y', latitude: 37.51, longitude: 127 },
      },
    ]);
    render(
      <RouteMap
        maps={maps}
        stops={stops}
        segments={buildSegments(stops)}
        origin={{ latitude: 37.49, longitude: 127 }}
      />
    );

    expect(overlays.map((el) => el.textContent)).toEqual(['1', '2·3', '출발']);
    expect(polylines.map((line) => line.strokeStyle)).toEqual([
      'solid',
      'shortdash',
    ]);
    expect(setBounds).toHaveBeenCalled();
    expect(screen.getByLabelText('방문 순서 지도')).toBeTruthy();
    expect(screen.getByText('주소·좌표: 행정안전부')).toBeTruthy();
  });
});
