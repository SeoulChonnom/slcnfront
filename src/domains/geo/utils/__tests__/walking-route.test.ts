import { describe, expect, it } from 'vitest';
import type { WalkingRoute } from '@/domains/geo/api/geo-schemas';
import { buildStops } from '@/domains/geo/utils/route-geometry';
import {
  secondsToWalkMinutes,
  toWalkingRouteDisplay,
} from '@/domains/geo/utils/walking-route';

const props = [
  {
    propertyId: 'a',
    location: { bdMgtSn: 'X', latitude: 37.5, longitude: 127.0 },
  },
  {
    propertyId: 'b',
    location: { bdMgtSn: 'X', latitude: 37.5, longitude: 127.0 },
  },
  {
    propertyId: 'c',
    location: { bdMgtSn: 'Y', latitude: 37.6, longitude: 127.1 },
  },
  {
    propertyId: 'd',
    location: { bdMgtSn: 'Z', latitude: 37.7, longitude: 127.2 },
  },
];
const ownStops = buildStops(props);

const stopsPayload = [
  { index: 0, propertyIds: ['a', 'b'], latitude: 37.5, longitude: 127.0 },
  { index: 1, propertyIds: ['c'], latitude: 37.6, longitude: 127.1 },
  { index: 2, propertyIds: ['d'], latitude: 37.7, longitude: 127.2 },
];

function route(legs: WalkingRoute['legs']): WalkingRoute {
  return { totalDistance: 3000, totalTime: 1801, stops: stopsPayload, legs };
}

describe('toWalkingRouteDisplay', () => {
  it('flips [lng, lat] and keeps own labels', () => {
    const display = toWalkingRouteDisplay(
      route([
        {
          fromStopIndex: 0,
          toStopIndex: 1,
          distance: 1000,
          time: 600,
          path: [
            [127.0, 37.5],
            [127.05, 37.55],
          ],
        },
        {
          fromStopIndex: 1,
          toStopIndex: 2,
          distance: 2000,
          time: 1201,
          path: [[127.1, 37.6]],
        },
      ]),
      ownStops
    );

    expect(display?.segments[0].path?.[1]).toEqual({
      latitude: 37.55,
      longitude: 127.05,
    });
    expect(display?.stops.map((s) => s.label)).toEqual(['1·2', '3', '4']);
    expect(display?.segments[0]).toMatchObject({
      meters: 1000,
      walkMinutes: 10,
    });
    expect(display?.segments[1].walkMinutes).toBe(21);
    expect(display?.totalMeters).toBe(3000);
    expect(display?.totalSeconds).toBe(1801);
  });

  it('draws a multi-stop leg with empty path straight through its stops', () => {
    const display = toWalkingRouteDisplay(
      route([
        {
          fromStopIndex: 0,
          toStopIndex: 2,
          distance: 3000,
          time: 1800,
          path: [],
        },
      ]),
      ownStops
    );

    expect(display?.segments).toHaveLength(1);
    expect(display?.segments[0].path).toEqual([
      { latitude: 37.5, longitude: 127.0 },
      { latitude: 37.6, longitude: 127.1 },
      { latitude: 37.7, longitude: 127.2 },
    ]);
    expect(display?.segments[0].to.label).toBe('4');
  });

  it('falls back to response stops with index + 1 labels when they do not match', () => {
    const display = toWalkingRouteDisplay(
      route([
        { fromStopIndex: 0, toStopIndex: 1, distance: 1, time: 60, path: [] },
      ]),
      buildStops(props.slice(0, 2))
    );

    expect(display?.stops.map((s) => s.label)).toEqual(['1', '2', '3']);
  });

  it('returns null for an empty route', () => {
    expect(
      toWalkingRouteDisplay(
        { totalDistance: 0, totalTime: 0, stops: [], legs: [] },
        ownStops
      )
    ).toBeNull();
  });
});

describe('secondsToWalkMinutes', () => {
  it('rounds up and keeps zero', () => {
    expect(secondsToWalkMinutes(0)).toBe(0);
    expect(secondsToWalkMinutes(61)).toBe(2);
  });
});
