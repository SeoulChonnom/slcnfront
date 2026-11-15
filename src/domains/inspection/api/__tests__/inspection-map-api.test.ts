import { describe, expect, it, vi } from 'vitest';
import { createGeoApi } from '@/domains/geo/api/geo-api';
import { parseWalkingRouteResponse } from '@/domains/geo/api/geo-schemas';
import { createInspectionApi } from '@/domains/inspection/api/inspection-api';
import { parseViewedPropertyDetailResponse } from '@/domains/inspection/api/inspection-schemas';
import { mapViewedPropertyDetailDto } from '@/domains/inspection/mappers/inspection-mappers';
import type { ViewedPropertyUdo } from '@/domains/inspection/types';
import { createApiClient } from '@/lib/api/api-client';

const location = {
  bdMgtSn: '1111010100100010000000001',
  roadAddress: null,
  latitude: 37.57,
  longitude: 126.98,
};
const coordKey = {
  admCd: '1111010100',
  rnMgtSn: '111103100001',
  udrtYn: '0',
  buldMnnm: '1',
  buldSlno: '0',
};
function propertyResponse() {
  return {
    propertyId: 'p1',
    inspectionVisitId: 'v1',
    areaId: 'a1',
    areaName: '성수동',
    visitedAt: '2026-11-15T14:00',
    complexName: '예시 아파트',
    name: null,
    status: 'DRAFT',
    sortOrder: 1,
    location,
    incompleteSummary: {
      unansweredRequiredCount: 0,
      draftPropertyCount: 0,
      draftVisitCount: 0,
    },
  };
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
function client(fetchFn: typeof fetch) {
  return createApiClient({
    fetchFn,
    getBaseUrl: () => 'http://localhost:8080/api',
    getAccessToken: () => null,
  });
}

describe('inspection map data safety', () => {
  it('preserves the loaded location and nullable planned property name', () => {
    const property = mapViewedPropertyDetailDto(
      parseViewedPropertyDetailResponse(propertyResponse(), 'test')
    );
    expect(property.location).toEqual(location);
    expect(property.name).toBeNull();
  });

  it('accepts deliberate null but rejects unknown or invalid location data', () => {
    expect(
      parseViewedPropertyDetailResponse(
        { ...propertyResponse(), location: null },
        'test'
      ).location
    ).toBeNull();
    const { location: _location, ...unknownLocation } = propertyResponse();
    expect(() =>
      parseViewedPropertyDetailResponse(unknownLocation, 'test')
    ).toThrow();
    expect(() =>
      parseViewedPropertyDetailResponse(
        {
          ...propertyResponse(),
          location: { ...location, latitude: 200 },
        },
        'test'
      )
    ).toThrow();
  });

  it('keeps a loaded building on memo-only PUT while removing coordinates from the request', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => json(propertyResponse()));
    const api = createInspectionApi(client(fetchFn));
    const loaded = await api.getProperty('p1');
    await api.updateProperty('v1', 'p1', {
      complexName: loaded.complexName,
      memo: '메모만 수정',
      location: loaded.location,
    });
    const body = JSON.parse(String(fetchFn.mock.calls[1]?.[1]?.body));
    expect(body.location).toEqual({
      bdMgtSn: location.bdMgtSn,
      roadAddress: null,
    });
    expect(body.memo).toBe('메모만 수정');
    expect(body.location).not.toHaveProperty('latitude');
    expect(body.location).not.toHaveProperty('longitude');
  });

  it('sends a new candidate exactly and clears only an explicit null', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => json(propertyResponse()));
    const api = createInspectionApi(client(fetchFn));
    const input = { bdMgtSn: location.bdMgtSn, roadAddress: null, coordKey };
    await api.createProperty('v1', {
      complexName: '계획 매물',
      location: input,
    });
    await api.updateProperty('v1', 'p1', {
      complexName: '계획 매물',
      location: null,
    });
    expect(
      JSON.parse(String(fetchFn.mock.calls[0]?.[1]?.body)).location
    ).toEqual(input);
    expect(
      JSON.parse(String(fetchFn.mock.calls[1]?.[1]?.body)).location
    ).toBeNull();
  });

  it('blocks a PUT with no explicit location before sending a request', async () => {
    const fetchFn = vi.fn<typeof fetch>();
    await expect(
      createInspectionApi(client(fetchFn)).updateProperty('v1', 'p1', {
        complexName: '위치 미확인',
      } as ViewedPropertyUdo)
    ).rejects.toThrow('explicit location');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});

describe('existing geo API map contracts', () => {
  it('trims address search and supplies pagination while preserving nullable candidate values and cancellation', async () => {
    const payload = {
      totalCount: 1,
      items: [
        {
          roadAddress: null,
          jibunAddress: null,
          buildingName: null,
          bdMgtSn: location.bdMgtSn,
          zipNo: null,
          coordKey,
        },
      ],
    };
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(json(payload));
    const signal = new AbortController().signal;
    const result = await createGeoApi(client(fetchFn)).searchAddresses(
      { keyword: '  예시  ' },
      signal
    );
    const url = new URL(String(fetchFn.mock.calls[0]?.[0]));
    expect(url.pathname).toBe('/api/geo/addresses');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      keyword: '예시',
      page: '1',
      size: '10',
    });
    expect(fetchFn.mock.calls[0]?.[1]?.signal).toBe(signal);
    expect(result).toEqual(payload);
  });

  it('posts no body to the encoded visit path and opts out of authentication replay', async () => {
    const post = vi.fn().mockResolvedValue({
      totalDistance: 0,
      totalTime: 0,
      stops: [],
      legs: [],
    });
    const api = createGeoApi({ ...createApiClient(), post });
    const signal = new AbortController().signal;
    await api.fetchWalkingRoute('visit/1', signal);
    expect(post).toHaveBeenCalledExactlyOnceWith({
      path: '/inspection-visits/visit%2F1/walking-route',
      signal,
      retryAfterUnauthorized: false,
    });
  });

  it.each([
    [429, 'WALKING_ROUTE_QUOTA_EXCEEDED', '오늘 경로 조회 한도를 넘었습니다'],
    [502, 'WALKING_ROUTE_FAILED', '경로 조회에 실패했습니다'],
    [503, 'WALKING_ROUTE_UNAVAILABLE', '도보 경로를 사용할 수 없습니다'],
  ])(
    'retains error %s and its server code without retry',
    async (status, code, title) => {
      const fetchFn = vi
        .fn<typeof fetch>()
        .mockImplementation(async () => json({ status, code, title }, status));
      await expect(
        createGeoApi(client(fetchFn)).fetchWalkingRoute('v1')
      ).rejects.toMatchObject({ status, apiCode: code, message: title });
      expect(fetchFn).toHaveBeenCalledTimes(1);
    }
  );

  it('allows an empty path for UI fallback but rejects invalid WGS84 path points', () => {
    const route = {
      totalDistance: 450,
      totalTime: 360,
      stops: [],
      legs: [
        {
          fromStopIndex: 0,
          toStopIndex: 2,
          distance: 450,
          time: 360,
          path: [],
        },
      ],
    };
    expect(parseWalkingRouteResponse(route)).toEqual(route);
    expect(() =>
      parseWalkingRouteResponse({
        ...route,
        legs: [{ ...route.legs[0], path: [[126.98, 200]] }],
      })
    ).toThrow();
  });
});
