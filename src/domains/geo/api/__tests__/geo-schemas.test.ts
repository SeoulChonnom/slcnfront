import { describe, expect, it } from 'vitest';
import {
  parseAddressSearchResponse,
  parseWalkingRouteResponse,
} from '@/domains/geo/api/geo-schemas';

const coordKey = {
  admCd: '1120011500',
  rnMgtSn: '112003115001',
  udrtYn: '0',
  buldMnnm: '135',
  buldSlno: '0',
};

describe('parseAddressSearchResponse', () => {
  it('parses a full candidate', () => {
    const result = parseAddressSearchResponse({
      totalCount: 12,
      items: [
        {
          roadAddress: '서울특별시 성동구 용답토방길 135',
          jibunAddress: '서울특별시 성동구 성수동1가 685-1',
          buildingName: '트리마제',
          bdMgtSn: '1120011500106850001000001',
          zipNo: '04773',
          coordKey,
        },
      ],
    });

    expect(result.totalCount).toBe(12);
    expect(result.items[0].coordKey).toEqual(coordKey);
    expect(result.items[0].buildingName).toBe('트리마제');
  });

  it('accepts null or missing roadAddress / jibunAddress / buildingName / zipNo', () => {
    const result = parseAddressSearchResponse({
      totalCount: 1,
      items: [
        {
          roadAddress: null,
          jibunAddress: null,
          buildingName: null,
          bdMgtSn: 'B1',
          coordKey,
        },
      ],
    });

    expect(result.items[0]).toMatchObject({
      roadAddress: null,
      jibunAddress: null,
      buildingName: null,
      zipNo: null,
    });
  });

  it('rejects a candidate without a coordKey', () => {
    expect(() =>
      parseAddressSearchResponse({
        totalCount: 1,
        items: [{ bdMgtSn: 'B1', roadAddress: 'x' }],
      })
    ).toThrow();
  });
});

describe('parseWalkingRouteResponse', () => {
  it('parses stops, legs and [lng, lat] paths', () => {
    const result = parseWalkingRouteResponse({
      totalDistance: 1280,
      totalTime: 960,
      stops: [
        { index: 0, propertyIds: ['a', 'b'], latitude: 37.5, longitude: 127.0 },
        { index: 1, propertyIds: ['c'], latitude: 37.6, longitude: 127.1 },
      ],
      legs: [
        {
          fromStopIndex: 0,
          toStopIndex: 1,
          distance: 1280,
          time: 960,
          path: [
            [127.0, 37.5],
            [127.1, 37.6],
          ],
        },
      ],
    });

    expect(result.legs[0].path[0]).toEqual([127.0, 37.5]);
    expect(result.stops[0].propertyIds).toEqual(['a', 'b']);
  });

  it('accepts an empty route and a missing path', () => {
    expect(
      parseWalkingRouteResponse({
        totalDistance: 0,
        totalTime: 0,
        stops: [],
        legs: [],
      }).stops
    ).toEqual([]);
    const result = parseWalkingRouteResponse({
      totalDistance: 1,
      totalTime: 1,
      stops: [],
      legs: [{ fromStopIndex: 0, toStopIndex: 1, distance: 1, time: 1 }],
    });
    expect(result.legs[0].path).toEqual([]);
  });

  it('rejects a malformed path point', () => {
    expect(() =>
      parseWalkingRouteResponse({
        totalDistance: 1,
        totalTime: 1,
        stops: [],
        legs: [
          {
            fromStopIndex: 0,
            toStopIndex: 1,
            distance: 1,
            time: 1,
            path: [[1]],
          },
        ],
      })
    ).toThrow();
  });
});
