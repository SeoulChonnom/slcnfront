import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { useWalkingRoute } from '@/domains/geo/hooks/useWalkingRoute';
import { createTestQueryClient } from '@/test/helpers/query-client';
import { server } from '@/test/helpers/server';

const client = createTestQueryClient();
function wrapper({ children }: PropsWithChildren) {
  return <QueryProvider client={client}>{children}</QueryProvider>;
}

const loc = { bdMgtSn: 'X' };
const ab = [
  { propertyId: 'a', location: loc },
  { propertyId: 'b', location: { bdMgtSn: 'Y' } },
];
const ba = [ab[1], ab[0]];

const payload = {
  totalDistance: 10,
  totalTime: 60,
  stops: [{ index: 0, propertyIds: ['a'], latitude: 1, longitude: 2 }],
  legs: [],
};

describe('useWalkingRoute', () => {
  it('drops the cached route when the order changes', async () => {
    let calls = 0;
    server.use(
      http.post('*/inspection-visits/v1/walking-route', () => {
        calls += 1;
        return HttpResponse.json(payload);
      })
    );
    const { result, rerender } = renderHook(
      ({ properties }) => useWalkingRoute('v1', properties),
      { wrapper, initialProps: { properties: ab } }
    );

    expect(result.current.route).toBeNull();
    act(() => result.current.request());
    await waitFor(() => expect(result.current.route).not.toBeNull());

    rerender({ properties: [...ab] });
    expect(result.current.route).not.toBeNull();

    rerender({ properties: ba });
    expect(result.current.route).toBeNull();

    rerender({ properties: ab });
    expect(result.current.route).not.toBeNull();
    expect(calls).toBe(1);
  });

  it('also drops it when a stop address changes', async () => {
    server.use(
      http.post('*/inspection-visits/v1/walking-route', () =>
        HttpResponse.json(payload)
      )
    );
    const { result, rerender } = renderHook(
      ({ properties }) => useWalkingRoute('v1', properties),
      { wrapper, initialProps: { properties: ab } }
    );
    act(() => result.current.request());
    await waitFor(() => expect(result.current.route).not.toBeNull());

    rerender({
      properties: [{ propertyId: 'a', location: { bdMgtSn: 'Z' } }, ab[1]],
    });
    expect(result.current.route).toBeNull();
  });
});
