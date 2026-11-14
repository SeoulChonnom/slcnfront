import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchWalkingRoute } from '@/domains/geo/api/geo-api';
import type { WalkingRoute } from '@/domains/geo/api/geo-schemas';
import { buildStops, type GeoPoint } from '@/domains/geo/utils/route-geometry';
import { toWalkingRouteDisplay } from '@/domains/geo/utils/walking-route';
import { AppError } from '@/lib/api/errors';

export type WalkingRouteFailure =
  | 'quota'
  | 'failed'
  | 'unavailable'
  | 'other'
  | 'stale'
  | 'insufficient';

type OrderedProperty = {
  propertyId: string;
  sortOrder?: number;
  location:
    | (GeoPoint & { bdMgtSn: string; roadAddress?: string | null })
    | null;
};

/** Includes the complete ordered map input, not only a building identifier. */
export function buildWalkingRouteKey(
  visitId: string,
  properties: OrderedProperty[]
) {
  return JSON.stringify([
    visitId,
    properties.map((property) => [
      property.propertyId,
      property.sortOrder,
      property.location?.bdMgtSn,
      property.location?.roadAddress,
      property.location?.latitude,
      property.location?.longitude,
    ]),
  ]);
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
    if (error.apiCode === 'INSPECTION_VISIT_NOT_FOUND') return 'stale';
    if (error.apiCode === 'WALKING_ROUTE_FAILED' || error.status === 502)
      return 'failed';
  }
  return 'other';
}

type State = {
  key: string;
  route: WalkingRoute | null;
  failure: WalkingRouteFailure | null;
  isPending: boolean;
};
const initial = (key: string): State => ({
  key,
  route: null,
  failure: null,
  isPending: false,
});

/**
 * An explicit request, held only for this panel lifetime. Generations prevent
 * A → B → A from resurrecting A's old request. No mutation/query cache or retry.
 */
export function useWalkingRoute(
  visitId: string,
  properties: OrderedProperty[],
  {
    enabled = true,
    isSaving = false,
    onStale,
  }: {
    enabled?: boolean;
    isSaving?: boolean;
    onStale?: () => void;
  } = {}
) {
  const key = useMemo(
    () => buildWalkingRouteKey(visitId, properties),
    [visitId, properties]
  );
  const [state, setState] = useState(() => initial(key));
  const [unavailable, setUnavailable] = useState(false);
  const lifecycle = useRef({ generation: 0, key, active: true });
  const pending = useRef<{
    controller: AbortController;
    promise: Promise<void>;
  } | null>(null);
  const staleCallback = useRef(onStale);
  staleCallback.current = onStale;

  useEffect(() => {
    lifecycle.current = {
      generation: lifecycle.current.generation + 1,
      key,
      active: enabled && !isSaving,
    };
    setState(initial(key));
    return () => {
      lifecycle.current.active = false;
      lifecycle.current.generation += 1;
      pending.current?.controller.abort();
      pending.current = null;
    };
  }, [key, enabled, isSaving]);

  const request = useCallback(() => {
    if (pending.current) return pending.current.promise;
    if (!lifecycle.current.active || unavailable) return Promise.resolve();
    const stops = buildStops(properties);
    if (stops.length < 2) return Promise.resolve();

    const controller = new AbortController();
    const generation = lifecycle.current.generation;
    const isCurrent = () =>
      lifecycle.current.active &&
      lifecycle.current.generation === generation &&
      lifecycle.current.key === key &&
      !controller.signal.aborted;
    setState({ ...initial(key), isPending: true });
    const promise = fetchWalkingRoute(visitId, controller.signal)
      .then((route) => {
        if (!isCurrent()) return;
        if (!toWalkingRouteDisplay(route, stops)) {
          setState({
            ...initial(key),
            failure: route.stops.length < 2 ? 'insufficient' : 'stale',
          });
          staleCallback.current?.();
          return;
        }
        setState({ ...initial(key), route });
      })
      .catch((error: unknown) => {
        if (!isCurrent()) return;
        const failure = classifyWalkingRouteError(error);
        if (failure === 'unavailable') setUnavailable(true);
        if (failure === 'stale') staleCallback.current?.();
        setState({ ...initial(key), failure });
      })
      .finally(() => {
        if (pending.current?.controller === controller) pending.current = null;
      });
    pending.current = { controller, promise };
    return promise;
  }, [key, properties, visitId, unavailable]);

  const current =
    state.key === key && enabled && !isSaving ? state : initial(key);
  return {
    request,
    route: current.route,
    failure: current.failure,
    isPending: current.isPending,
    unavailable,
  };
}
