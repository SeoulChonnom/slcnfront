import { afterEach, describe, expect, it, vi } from 'vitest';
import type { KakaoMaps } from '@/lib/kakao/kakao-maps';

afterEach(() => {
  delete window.kakao;
  document
    .querySelectorAll('script[src*="dapi.kakao.com"]')
    .forEach((script) => {
      script.remove();
    });
  vi.resetModules();
  vi.useRealTimers();
});

describe('loadKakaoMaps', () => {
  it('shares one pending load and waits for the SDK load callback', async () => {
    const { loadKakaoMaps } = await import('@/lib/kakao/kakao-loader');
    const first = loadKakaoMaps('test-key');
    expect(loadKakaoMaps('test-key')).toBe(first);
    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="dapi.kakao.com"]'
    );
    if (!script) throw new Error('SDK script missing');
    expect(new URL(script.src).searchParams.get('autoload')).toBe('false');
    expect(new URL(script.src).searchParams.get('libraries')).toBe('clusterer');
    const maps = { load: (callback: () => void) => callback() } as KakaoMaps;
    window.kakao = { maps };
    script.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBe(maps);
    expect(loadKakaoMaps('test-key')).toBe(first);
    expect(
      document.querySelectorAll('script[src*="dapi.kakao.com"]')
    ).toHaveLength(1);
  });

  it('releases a failed load so a later visit can retry', async () => {
    const { loadKakaoMaps } = await import('@/lib/kakao/kakao-loader');
    const first = loadKakaoMaps('test-key');
    const rejected = expect(first).rejects.toThrow('지도를 불러오지 못했어요.');
    document
      .querySelector('script[src*="dapi.kakao.com"]')
      ?.dispatchEvent(new Event('error'));
    await rejected;
    const retry = loadKakaoMaps('test-key');
    expect(retry).not.toBe(first);
    const maps = { load: (callback: () => void) => callback() } as KakaoMaps;
    window.kakao = { maps };
    document
      .querySelector('script[src*="dapi.kakao.com"]')
      ?.dispatchEvent(new Event('load'));
    await expect(retry).resolves.toBe(maps);
  });

  it('times out an SDK that never initializes', async () => {
    vi.useFakeTimers();
    const { loadKakaoMaps } = await import('@/lib/kakao/kakao-loader');
    const rejected = expect(loadKakaoMaps('test-key')).rejects.toThrow(
      '지도를 불러오지 못했어요.'
    );
    await vi.advanceTimersByTimeAsync(15_000);
    await rejected;
    expect(document.querySelector('script[src*="dapi.kakao.com"]')).toBeNull();
  });
});
