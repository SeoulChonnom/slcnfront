import type {
  AreaBucket,
  ComplexesParams,
  MapBounds,
  PriceRange,
  SummaryParams,
} from '@/domains/house/types';

const COMPLEX_MAX_LEVEL = 5;
const DISTRICT_MIN_LEVEL = 8;
const COMPLEX_MAX_SPAN = 0.2;
const DONG_MAX_SPAN = 1;

export function roundMapBounds(bounds: MapBounds): MapBounds {
  return {
    swLat: Math.floor(bounds.swLat * 1000) / 1000,
    swLng: Math.floor(bounds.swLng * 1000) / 1000,
    neLat: Math.ceil(bounds.neLat * 1000) / 1000,
    neLng: Math.ceil(bounds.neLng * 1000) / 1000,
  };
}

export function getMapLayer(level: number, bounds: MapBounds) {
  const rounded = roundMapBounds(bounds);
  // Integer millidegrees avoid rejecting an exact 0.2 degree boundary due to floating-point error.
  const latSpan =
    Math.round(rounded.neLat * 1000) - Math.round(rounded.swLat * 1000);
  const lngSpan =
    Math.round(rounded.neLng * 1000) - Math.round(rounded.swLng * 1000);
  if (
    latSpan <= 0 ||
    lngSpan <= 0 ||
    level >= DISTRICT_MIN_LEVEL ||
    latSpan > DONG_MAX_SPAN * 1000 ||
    lngSpan > DONG_MAX_SPAN * 1000
  )
    return 'DISTRICT';
  if (
    level <= COMPLEX_MAX_LEVEL &&
    latSpan <= COMPLEX_MAX_SPAN * 1000 &&
    lngSpan <= COMPLEX_MAX_SPAN * 1000
  )
    return 'COMPLEX';
  return 'DONG';
}

export function getMapQuery(
  level: number,
  bounds: MapBounds,
  area: AreaBucket,
  priceRange: PriceRange = {}
) {
  const rounded = roundMapBounds(bounds);
  const layer = getMapLayer(level, rounded);
  const filters = { area, ...priceRange };
  const complexes: ComplexesParams | null =
    layer === 'COMPLEX' ? { ...filters, ...rounded } : null;
  const summary: SummaryParams | null =
    layer === 'DISTRICT'
      ? { ...filters, groupBy: 'DISTRICT' }
      : layer === 'DONG'
        ? { ...filters, ...rounded, groupBy: 'DONG' }
        : null;
  return { layer, complexes, summary };
}
