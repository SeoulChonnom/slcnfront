import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { fetchWalkingRoute } from '@/domains/geo/api/geo-api';
import type { WalkingRoute } from '@/domains/geo/api/geo-schemas';
import { AppError } from '@/lib/api/errors';

export type WalkingRouteFailure = 'quota' | 'failed' | 'unavailable' | 'other';

type OrderedProperty = {
  propertyId: string;
  location: { bdMgtSn: string } | null;
};

/** Changes whenever the visit, the order, or any stop's address changes. */
export function buildWalkingRouteKey(
  visitId: string,
  properties: OrderedProperty[]
) {
  return `${visitId}|${properties
    .map((p) => `${p.propertyId}:${p.location?.bdMgtSn ?? ''}`)
    .join(',')}`;
}

function classifyWalkingRouteError(error: unknown): WalkingRouteFailure {
  if (error instanceof AppError) {
    if (
      error.apiCode === 'WALKING_ROUTE_QUOTA_EXCEEDED' ||
      error.status === 429
    )
      return 'quota';
    if (error.apiCode === 'WALKING_ROUTE_UNAVAILABLE' || error.status === 503)
      return 'unavailable';
    if (error.apiCode === 'WALKING_ROUTE_FAILED' || error.status === 502)
      return 'failed';
  }

  return 'other';
}

/**
 * On-demand walking route (api.md §8-3). The result lives in component state
 * keyed by visit + ordered properties: when the key changes the route is
 * dropped and the caller is back on straight lines. Nothing is persisted.
 * A 503 disables further requests for as long as the component stays mounted.
 */
export function useWalkingRoute(
  visitId: string,
  properties: OrderedProperty[]
) {
  const key = useMemo(
    () => buildWalkingRouteKey(visitId, properties),
    [visitId, properties]
  );
  const [result, setResult] = useState<{
    key: string;
    route: WalkingRoute;
  } | null>(null);
  const [failure, setFailure] = useState<{
    key: string;
    kind: WalkingRouteFailure;
  } | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const mutation = useMutation({
    mutationFn: () => fetchWalkingRoute(visitId),
  });
  const { mutate } = mutation;

  const request = useCallback(() => {
    const requestKey = key;
    setPendingKey(requestKey);
    setFailure(null);
    mutate(undefined, {
      onSuccess: (route) => setResult({ key: requestKey, route }),
      onError: (error) => {
        const kind = classifyWalkingRouteError(error);
        if (kind === 'unavailable') setUnavailable(true);
        setFailure({ key: requestKey, kind });
      },
      onSettled: () =>
        setPendingKey((current) => (current === requestKey ? null : current)),
    });
  }, [key, mutate]);

  return {
    request,
    route: result?.key === key ? result.route : null,
    failure: failure?.key === key ? failure.kind : null,
    isPending: pendingKey === key,
    unavailable,
  };
}
