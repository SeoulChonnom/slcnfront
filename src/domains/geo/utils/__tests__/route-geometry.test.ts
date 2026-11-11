import { describe, expect, it } from 'vitest';
import {
  buildSegments,
  buildStops,
  estimateWalkMinutes,
  haversineMeters,
} from '@/domains/geo/utils/route-geometry';

function property(id: string, bdMgtSn: string | null, lat = 37.5, lon = 127) {
  return {
    propertyId: id,
    location: bdMgtSn ? { bdMgtSn, latitude: lat, longitude: lon } : null,
  };
}

describe('haversineMeters / estimateWalkMinutes', () => {
  it('measures roughly 111 km per degree of latitude', () => {
    const meters = haversineMeters(
      { latitude: 37, longitude: 127 },
      { latitude: 38, longitude: 127 }
    );
    expect(meters).toBeGreaterThan(111_000);
    expect(meters).toBeLessThan(111_400);
  });

  it('applies x1.3 at 4.5 km/h, rounding up', () => {
    // 1000 m * 1.3 = 1300 m / 75 m per min = 17.3 -> 18
    expect(estimateWalkMinutes(1000)).toBe(18);
    expect(estimateWalkMinutes(0)).toBe(0);
  });
});

describe('buildStops', () => {
  it('merges consecutive same-address properties with a "2·3" label', () => {
    const stops = buildStops([
      property('a', 'X'),
      property('b', 'Y', 37.51),
      property('c', 'Y', 37.51),
    ]);
    expect(stops.map((s) => s.label)).toEqual(['1', '2·3']);
    expect(stops[1].propertyIds).toEqual(['b', 'c']);
  });

  it('does not merge A -> B -> A', () => {
    const stops = buildStops([
      property('a', 'X'),
      property('b', 'Y', 37.51),
      property('c', 'X'),
    ]);
    expect(stops.map((s) => s.label)).toEqual(['1', '2', '3']);
  });

  it('keeps list numbers when unlocated rows sit in between', () => {
    const stops = buildStops([
      property('a', 'X'),
      property('b', null),
      property('c', 'Y', 37.51),
    ]);
    expect(stops.map((s) => s.label)).toEqual(['1', '3']);
  });

  it('builds straight segments with distance and estimate', () => {
    const segments = buildSegments(
      buildStops([property('a', 'X'), property('b', 'Y', 37.509)])
    );
    expect(segments).toHaveLength(1);
    expect(segments[0].meters).toBeGreaterThan(900);
    expect(segments[0].walkMinutes).toBe(
      estimateWalkMinutes(segments[0].meters)
    );
  });
});
