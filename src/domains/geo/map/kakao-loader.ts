const SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';

let pending: Promise<typeof kakao.maps> | null = null;

/**
 * Injects the Kakao Maps SDK once and resolves after `kakao.maps.load`.
 * Never call this without a key (callers check `getAppEnv().kakaoMapJsKey`).
 * A failed load is not memoized, so a later mount can retry.
 */
export function loadKakaoMaps(appKey: string): Promise<typeof kakao.maps> {
  if (pending) {
    return pending;
  }

  pending = new Promise<typeof kakao.maps>((resolve, reject) => {
    function fail(message: string) {
      pending = null;
      reject(new Error(message));
    }

    function finish() {
      const maps = window.kakao?.maps;
      if (!maps) {
        fail('Kakao Maps SDK did not initialize');

        return;
      }
      maps.load(() => resolve(maps));
    }

    if (window.kakao?.maps) {
      finish();

      return;
    }

    const script = document.createElement('script');
    script.src = `${SDK_URL}?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.onload = finish;
    script.onerror = () => {
      script.remove();
      fail('Kakao Maps SDK failed to load');
    };
    document.head.appendChild(script);
  });

  return pending;
}
