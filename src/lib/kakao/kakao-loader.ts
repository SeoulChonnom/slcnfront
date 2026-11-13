import type { KakaoMaps } from '@/lib/kakao/kakao-maps';

let pending: Promise<KakaoMaps> | undefined;

export function loadKakaoMaps(appKey: string): Promise<KakaoMaps> {
  if (pending) return pending;

  pending = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(fail, 15_000);

    function fail() {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error('지도를 불러오지 못했어요.'));
    }

    function ready() {
      const maps = window.kakao?.maps;
      if (!maps) {
        fail();
        return;
      }
      maps.load(() => {
        if (!maps.Map || !maps.Polyline || !maps.MarkerClusterer) {
          fail();
          return;
        }
        window.clearTimeout(timeout);
        resolve(maps);
      });
    }

    if (window.kakao?.maps) {
      ready();
      return;
    }

    const query = new URLSearchParams({
      appkey: appKey,
      autoload: 'false',
      libraries: 'clusterer',
    });
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?${query}`;
    script.async = true;
    script.onload = ready;
    script.onerror = fail;
    document.head.append(script);
  }).catch((error: unknown) => {
    pending = undefined;
    throw error;
  });

  return pending;
}
