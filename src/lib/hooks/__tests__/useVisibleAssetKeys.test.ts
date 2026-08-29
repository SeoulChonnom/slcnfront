import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useVisibleAssetKeys } from '@/lib/hooks/useVisibleAssetKeys';

type ObserverInstance = {
  callback: IntersectionObserverCallback;
  observed: Element[];
  unobserved: Element[];
  disconnected: boolean;
};

function installIntersectionObserver() {
  const instances: ObserverInstance[] = [];

  class FakeIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      this.instance = {
        callback,
        observed: [],
        unobserved: [],
        disconnected: false,
      };
      instances.push(this.instance);
    }

    instance: ObserverInstance;

    observe(node: Element) {
      this.instance.observed.push(node);
    }

    unobserve(node: Element) {
      this.instance.unobserved.push(node);
    }

    disconnect() {
      this.instance.disconnected = true;
    }
  }

  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

  return instances;
}

function entry(node: Element, isIntersecting: boolean) {
  return {
    target: node,
    isIntersecting,
  } as unknown as IntersectionObserverEntry;
}

function intersect(instance: ObserverInstance, node: Element) {
  act(() => {
    instance.callback([entry(node, true)], {} as IntersectionObserver);
  });
}

describe('useVisibleAssetKeys', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports a key only once its element reaches the viewport', () => {
    const instances = installIntersectionObserver();
    const { result } = renderHook(() => useVisibleAssetKeys());
    const node = document.createElement('div');

    act(() => {
      result.current.observe('cover-1')(node);
    });

    expect(result.current.visibleKeys.has('cover-1')).toBe(false);
    expect(instances[0]?.observed).toContain(node);

    intersect(instances[0] as ObserverInstance, node);

    expect(result.current.visibleKeys.has('cover-1')).toBe(true);
    // Sticky: the observer stops watching a key it has already reported.
    expect(instances[0]?.unobserved).toContain(node);
  });

  it('keeps a key visible after its element scrolls away', () => {
    const instances = installIntersectionObserver();
    const { result } = renderHook(() => useVisibleAssetKeys());
    const node = document.createElement('div');

    act(() => {
      result.current.observe('cover-1')(node);
    });
    intersect(instances[0] as ObserverInstance, node);

    act(() => {
      instances[0]?.callback([entry(node, false)], {} as IntersectionObserver);
    });

    expect(result.current.visibleKeys.has('cover-1')).toBe(true);
  });

  it('ignores a null key or node', () => {
    const instances = installIntersectionObserver();
    const { result } = renderHook(() => useVisibleAssetKeys());

    act(() => {
      result.current.observe(null)(document.createElement('div'));
      result.current.observe('cover-1')(null);
    });

    expect(result.current.visibleKeys.size).toBe(0);
    expect(instances[0]?.observed ?? []).toHaveLength(0);
  });

  it('marks keys visible immediately without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    const { result } = renderHook(() => useVisibleAssetKeys());

    act(() => {
      result.current.observe('cover-1')(document.createElement('div'));
    });

    // Degrades to the previous eager behaviour rather than showing nothing.
    expect(result.current.visibleKeys.has('cover-1')).toBe(true);
  });

  it('disconnects the observer on unmount', () => {
    const instances = installIntersectionObserver();
    const { result, unmount } = renderHook(() => useVisibleAssetKeys());

    act(() => {
      result.current.observe('cover-1')(document.createElement('div'));
    });

    unmount();

    expect(instances[0]?.disconnected).toBe(true);
  });
});
