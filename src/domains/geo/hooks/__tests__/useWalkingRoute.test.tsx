import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWalkingRoute } from '@/domains/geo/api/geo-api';
import type { WalkingRoute } from '@/domains/geo/api/geo-schemas';
import {
  buildWalkingRouteKey,
  useWalkingRoute,
} from '@/domains/geo/hooks/useWalkingRoute';

vi.mock('@/domains/geo/api/geo-api', () => ({ fetchWalkingRoute: vi.fn() }));
const fetchMock = vi.mocked(fetchWalkingRoute);
const ab = [
  {
    propertyId: 'a',
    sortOrder: 1,
    location: { bdMgtSn: 'X', latitude: 37.5, longitude: 127 },
  },
  {
    propertyId: 'b',
    sortOrder: 2,
    location: { bdMgtSn: 'Y', latitude: 37.6, longitude: 127.1 },
  },
];
const payload: WalkingRoute = {
  totalDistance: 1000,
  totalTime: 600,
  stops: ab.map((p, index) => ({
    index,
    propertyIds: [p.propertyId],
    latitude: p.location.latitude,
    longitude: p.location.longitude,
  })),
  legs: [
    {
      fromStopIndex: 0,
      toStopIndex: 1,
      distance: 1000,
      time: 600,
      path: [
        [127, 37.5],
        [127.1, 37.6],
      ],
    },
  ],
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
beforeEach(() => fetchMock.mockReset());

describe('useWalkingRoute', () => {
  it('never calls on mount and shares immediate duplicate requests', async () => {
    const response = deferred<WalkingRoute>();
    fetchMock.mockReturnValue(response.promise);
    const { result } = renderHook(() => useWalkingRoute('v1', ab));
    expect(fetchMock).not.toHaveBeenCalled();
    let first!: Promise<void>;
    let duplicate!: Promise<void>;
    act(() => {
      first = result.current.request();
      duplicate = result.current.request();
    });
    expect(first).toBe(duplicate);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.isPending).toBe(true);
    await act(async () => {
      response.resolve(payload);
      await first;
    });
    expect(result.current.route).toEqual(payload);
  });

  it('does not resurrect cached results after A → B → A', async () => {
    fetchMock.mockResolvedValue(payload);
    const { result, rerender } = renderHook(
      ({ visitId }) => useWalkingRoute(visitId, ab),
      { initialProps: { visitId: 'A' } }
    );
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.route).not.toBeNull();
    rerender({ visitId: 'B' });
    rerender({ visitId: 'A' });
    expect(result.current.route).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('aborts and ignores an old A request even after returning to A', async () => {
    const old = deferred<WalkingRoute>();
    fetchMock.mockReturnValueOnce(old.promise).mockResolvedValue(payload);
    const { result, rerender } = renderHook(
      ({ visitId }) => useWalkingRoute(visitId, ab),
      { initialProps: { visitId: 'A' } }
    );
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.request();
    });
    const signal = fetchMock.mock.calls[0][1];
    rerender({ visitId: 'B' });
    rerender({ visitId: 'A' });
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      old.resolve(payload);
      await pending;
    });
    expect(result.current.route).toBeNull();
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.route).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('invalidates when coordinates or sortOrder change with the same building', async () => {
    fetchMock.mockResolvedValue(payload);
    const { result, rerender } = renderHook(
      ({ properties }) => useWalkingRoute('v1', properties),
      { initialProps: { properties: ab } }
    );
    await act(async () => {
      await result.current.request();
    });
    rerender({
      properties: [
        { ...ab[0], location: { ...ab[0].location, latitude: 37.51 } },
        ab[1],
      ],
    });
    expect(result.current.route).toBeNull();
    expect(buildWalkingRouteKey('v1', ab)).not.toBe(
      buildWalkingRouteKey('v1', [{ ...ab[0], sortOrder: 3 }, ab[1]])
    );
  });

  it('rejects mismatched server stops and asks for the current list', async () => {
    fetchMock.mockResolvedValue({
      ...payload,
      stops: [...payload.stops].reverse(),
    });
    const onStale = vi.fn();
    const { result } = renderHook(() => useWalkingRoute('v1', ab, { onStale }));
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.route).toBeNull();
    expect(result.current.failure).toBe('stale');
    expect(onStale).toHaveBeenCalledOnce();
  });

  it('does not request with fewer than two coordinate-distinct consecutive stops', () => {
    const { result } = renderHook(() =>
      useWalkingRoute('v1', [ab[0], { ...ab[1], location: ab[0].location }])
    );
    act(() => {
      void result.current.request();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('aborts when the panel closes or saving starts and drops its result', async () => {
    const response = deferred<WalkingRoute>();
    fetchMock.mockReturnValue(response.promise);
    const { result, rerender } = renderHook(
      ({ enabled, isSaving }) =>
        useWalkingRoute('v1', ab, { enabled, isSaving }),
      { initialProps: { enabled: true, isSaving: false } }
    );
    act(() => {
      void result.current.request();
    });
    const signal = fetchMock.mock.calls[0][1];
    rerender({ enabled: false, isSaving: false });
    expect(signal?.aborted).toBe(true);
    expect(result.current.isPending).toBe(false);
    await act(async () => {
      response.resolve(payload);
    });
    await waitFor(() => expect(result.current.route).toBeNull());
  });
});
