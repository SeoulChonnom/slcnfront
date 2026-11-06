import { describe, expect, it } from 'vitest';
import {
  parseCompareParam,
  serializeCompareParam,
  toCompareApiItems,
} from '@/domains/house/utils/compare-param';
import {
  formatChangeManwon,
  formatChangePct,
  formatEok,
} from '@/domains/house/utils/format-eok';
import { parseHouseUrlState } from '@/domains/house/utils/house-url-state';
import {
  getMapLayer,
  getMapQuery,
  roundMapBounds,
} from '@/domains/house/utils/map-bounds';

describe('house price formatting', () => {
  it.each([
    [57340, '5.73억', '5.7억'],
    [57350, '5.74억', '5.7억'],
    [150000, '15.00억', '15.0억'],
    [10000, '1.00억', '1.0억'],
    [9500, '9,500만', '9,500만'],
    [9999, '9,999만', '9,999만'],
    [-57350, '-5.74억', '-5.7억'],
  ])('formats %i by original amount', (input, normal, map) => {
    expect(formatEok(input)).toBe(normal);
    expect(formatEok(input, 'map')).toBe(map);
  });
  it.each([
    [2000, '+2,000만'],
    [-12000, '-1.20억'],
    [0, '0만'],
  ])('formats change %i', (input, expected) => {
    expect(formatChangeManwon(input)).toBe(expected);
  });
  it.each([
    [4.65, '+4.65%'],
    [-3.1, '-3.10%'],
    [0, '0.00%'],
  ])('formats percent %f', (input, expected) => {
    expect(formatChangePct(input)).toBe(expected);
  });
});

describe('house shared URL', () => {
  it('preserves order and allows different areas for the same complex', () => {
    const parsed = parseCompareParam('c1:59,c1:84,c2:59');
    expect(parsed).toEqual([
      { complexId: 'c1', area: 'B59' },
      { complexId: 'c1', area: 'B84' },
      { complexId: 'c2', area: 'B59' },
    ]);
    expect(serializeCompareParam(parsed)).toBe('c1:59,c1:84,c2:59');
    expect(toCompareApiItems(parsed)).toBe('c1:B59,c1:B84,c2:B59');
  });
  it('discards invalid/duplicate entries and caps the tray at three', () => {
    expect(
      parseCompareParam('bad,:59,c1:60,c1:59,c1:59,c2:84,c3:59,c4:59')
    ).toEqual([
      { complexId: 'c1', area: 'B59' },
      { complexId: 'c2', area: 'B84' },
      { complexId: 'c3', area: 'B59' },
    ]);
    expect(parseCompareParam(null)).toEqual([]);
  });
  it('restores shareable filters without budget values', () => {
    expect(
      parseHouseUrlState(
        new URLSearchParams(
          'area=84&cmp=c1:84&lat=37.5&lng=127.1&level=5&rank=FALL&budget=90000'
        )
      )
    ).toEqual({
      areaBucket: 'B84',
      compareItems: [{ complexId: 'c1', area: 'B84' }],
      mapPosition: { lat: 37.5, lng: 127.1, level: 5 },
      rankingType: 'FALL',
    });
  });
  it('ignores invalid numbers, empty numbers, fractional levels and invalid enums', () => {
    expect(
      parseHouseUrlState(
        new URLSearchParams('area=60&lat=Infinity&lng=&level=5.5&rank=TOP')
      )
    ).toEqual({
      areaBucket: 'B59',
      compareItems: [],
      mapPosition: { lat: 37.5665, lng: 126.978, level: 8 },
      rankingType: 'LEADER',
    });
  });
});

describe('house map queries', () => {
  const small = {
    swLat: 37.5012,
    swLng: 126.9012,
    neLat: 37.6001,
    neLng: 127.0001,
  };
  it('rounds outward to millidegrees', () => {
    expect(roundMapBounds(small)).toEqual({
      swLat: 37.501,
      swLng: 126.901,
      neLat: 37.601,
      neLng: 127.001,
    });
  });
  it('selects a layer from zoom level and rounded spans', () => {
    expect(getMapLayer(5, small)).toBe('COMPLEX');
    expect(getMapLayer(6, small)).toBe('DONG');
    expect(getMapLayer(8, small)).toBe('DISTRICT');
    expect(
      getMapLayer(5, { swLat: 37.5, swLng: 127, neLat: 37.7, neLng: 127.2 })
    ).toBe('COMPLEX');
    expect(getMapLayer(5, { ...small, neLat: 37.702 })).toBe('DONG');
    expect(getMapLayer(5, { ...small, neLat: 38.502 })).toBe('DISTRICT');
  });
  it('omits bounds from district requests and forwards only derived price filters', () => {
    expect(
      getMapQuery(8, small, 'B59', { minPrice: 45872, maxPrice: 57340 })
    ).toEqual({
      layer: 'DISTRICT',
      complexes: null,
      summary: {
        groupBy: 'DISTRICT',
        area: 'B59',
        minPrice: 45872,
        maxPrice: 57340,
      },
    });
    expect(getMapQuery(5, small, 'B84').complexes).toEqual({
      area: 'B84',
      ...roundMapBounds(small),
    });
  });
});
