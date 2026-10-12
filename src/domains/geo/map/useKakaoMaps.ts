import { useEffect, useState } from 'react';
import { loadKakaoMaps } from '@/domains/geo/map/kakao-loader';
import { getAppEnv } from '@/lib/env/env';

export type KakaoMapsState =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'ready'; maps: typeof kakao.maps };

/**
 * Tells the parent whether a map can be shown. Without a key (or when the SDK
 * fails to load) the status is `unavailable` and the parent keeps its list.
 * The loader is never touched when there is no key.
 */
export function useKakaoMaps(): KakaoMapsState {
  const key = getAppEnv().kakaoMapJsKey;
  const [state, setState] = useState<KakaoMapsState>(
    key ? { status: 'loading' } : { status: 'unavailable' }
  );

  useEffect(() => {
    if (!key) {
      return;
    }

    let cancelled = false;
    loadKakaoMaps(key).then(
      (maps) => {
        if (!cancelled) {
          setState({ status: 'ready', maps });
        }
      },
      () => {
        if (!cancelled) {
          setState({ status: 'unavailable' });
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
