import type { WalkingRoute } from '@/domains/geo/api/geo-schemas';
import type {
  GeoPoint,
  RouteSegment,
  RouteStop,
} from '@/domains/geo/utils/route-geometry';

export type WalkingRouteDisplay = {
  stops: RouteStop[];
  segments: RouteSegment[];
  totalMeters: number;
  totalSeconds: number;
};

const stopKey = (propertyIds: string[]) => propertyIds.join(',');

/** Whole minutes, rounded up; 0 only for a zero duration. */
export function secondsToWalkMinutes(seconds: number) {
  return seconds <= 0 ? 0 : Math.ceil(seconds / 60);
}

/**
 * Walking route -> what `RouteMap` and the list draw. Our own `buildStops`
 * stops are reused (so labels like "2·3" stay) when every response stop maps
 * onto one by `propertyIds`; otherwise the response geometry is used with
 * index + 1 labels. An empty route (`stops: []`) yields `null`.
 */
export function toWalkingRouteDisplay(
  route: WalkingRoute,
  ownStops: RouteStop[]
): WalkingRouteDisplay | null {
  if (route.stops.length === 0) {
    return null;
  }

  const ownByKey = new Map(
    ownStops.map((stop) => [stopKey(stop.propertyIds), stop])
  );
  const matched = route.stops.map((stop) =>
    ownByKey.get(stopKey(stop.propertyIds))
  );
  const allMatched = matched.every((stop) => stop !== undefined);

  const stops: RouteStop[] = route.stops.map((stop, position) => {
    const own = matched[position];
    if (allMatched && own) {
      return own;
    }

    return {
      bdMgtSn: '',
      latitude: stop.latitude,
      longitude: stop.longitude,
      propertyIds: stop.propertyIds,
      numbers: [stop.index + 1],
      label: String(stop.index + 1),
    };
  });
  const byIndex = new Map(
    route.stops.map((stop, position) => [stop.index, stops[position]])
  );

  const segments: RouteSegment[] = [];
  for (const leg of route.legs) {
    const from = byIndex.get(leg.fromStopIndex);
    const to = byIndex.get(leg.toStopIndex);
    if (!from || !to) {
      continue;
    }

    let path: GeoPoint[];
    if (leg.path.length > 0) {
      path = leg.path.map(([longitude, latitude]) => ({ latitude, longitude }));
    } else {
      path = route.stops
        .filter(
          (stop) =>
            stop.index >= leg.fromStopIndex && stop.index <= leg.toStopIndex
        )
        .sort((a, b) => a.index - b.index)
        .map(({ latitude, longitude }) => ({ latitude, longitude }));
    }

    segments.push({
      from,
      to,
      meters: leg.distance,
      walkMinutes: secondsToWalkMinutes(leg.time),
      path,
    });
  }

  return {
    stops,
    segments,
    totalMeters: route.totalDistance,
    totalSeconds: route.totalTime,
  };
}
