import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  AreaBucket,
  CompareItem,
  MapPosition,
  RankingType,
} from '../types';
import { serializeCompareParam } from '../utils/compare-param';
import { parseHouseUrlState } from '../utils/house-url-state';

const SHARED_PARAMS = ['area', 'cmp', 'lat', 'lng', 'level', 'rank'];

export function useHouseUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.toString();
  const pending = useRef(search);
  const rendered = useRef(search);
  if (rendered.current !== search) {
    pending.current = search;
    rendered.current = search;
  }
  const state = useMemo(
    () => parseHouseUrlState(new URLSearchParams(search)),
    [search]
  );
  const update = useCallback(
    (patch: Record<string, string>) => {
      const next = new URLSearchParams(pending.current);
      for (const key of [...next.keys()]) {
        if (!SHARED_PARAMS.includes(key)) next.delete(key);
      }
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      pending.current = next.toString();
      setSearchParams(next, { replace: true });
    },
    [setSearchParams]
  );

  const setAreaBucket = useCallback(
    (area: AreaBucket) => {
      update({ area: area === 'B84' ? '84' : '59' });
    },
    [update]
  );
  const setCompareItems = useCallback(
    (items: CompareItem[]) => {
      update({ cmp: serializeCompareParam(items) });
    },
    [update]
  );
  const setMapPosition = useCallback(
    (position: MapPosition) => {
      update({
        lat: position.lat.toFixed(5),
        lng: position.lng.toFixed(5),
        level: String(position.level),
      });
    },
    [update]
  );
  const setRankingType = useCallback(
    (rank: RankingType) => {
      update({ rank });
    },
    [update]
  );

  return {
    ...state,
    setAreaBucket,
    setCompareItems,
    setMapPosition,
    setRankingType,
  };
}
