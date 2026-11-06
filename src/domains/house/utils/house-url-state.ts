import type {
  AreaBucket,
  MapPosition,
  RankingType,
} from '@/domains/house/types';
import { parseCompareParam } from '@/domains/house/utils/compare-param';

const defaultPosition: MapPosition = { lat: 37.5665, lng: 126.978, level: 8 };

function readNumber(
  params: URLSearchParams,
  key: string,
  min: number,
  max: number,
  fallback: number
) {
  const raw = params.get(key);
  if (!raw?.trim()) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= min && value <= max
    ? value
    : fallback;
}

export function parseHouseUrlState(params: URLSearchParams) {
  const areaBucket: AreaBucket = params.get('area') === '84' ? 'B84' : 'B59';
  const rank = params.get('rank');
  const rankingType: RankingType =
    rank === 'RISE' || rank === 'FALL' || rank === 'VOLUME' ? rank : 'LEADER';
  const level = readNumber(params, 'level', 1, 14, defaultPosition.level);
  return {
    areaBucket,
    compareItems: parseCompareParam(params.get('cmp')),
    mapPosition: {
      lat: readNumber(params, 'lat', -90, 90, defaultPosition.lat),
      lng: readNumber(params, 'lng', -180, 180, defaultPosition.lng),
      level: Number.isInteger(level) ? level : defaultPosition.level,
    },
    rankingType,
  };
}
