import type { WalkingRoute } from '@/domains/geo/api/geo-schemas';
import type {
  RouteSegment,
  RouteStop,
} from '@/domains/geo/utils/route-geometry';

export type WalkingRouteDisplay = {
  stops: RouteStop[];
  segments: RouteSegment[];
  totalMeters: number;
  totalSeconds: number;
};

/** Whole minutes, rounded up; 0 only for a zero duration. */
export function secondsToWalkMinutes(seconds: number) {
  return seconds <= 0 ? 0 : Math.ceil(seconds / 60);
}

/** Only geometry for this exact visit input may be displayed as a walking route. */
export function toWalkingRouteDisplay(
  route: WalkingRoute,
  ownStops: RouteStop[]
): WalkingRouteDisplay | null {
  if (
    ownStops.length < 2 ||
    route.stops.length !== ownStops.length ||
    route.legs.length === 0
  )
    return null;
  if (
    !Number.isFinite(route.totalDistance) ||
    route.totalDistance < 0 ||
    !Number.isFinite(route.totalTime) ||
    route.totalTime < 0
  )
    return null;

  const matches = route.stops.every((stop, index) => {
    const own = ownStops[index];
    return (
      stop.index === index &&
      stop.latitude === own.latitude &&
      stop.longitude === own.longitude &&
      stop.propertyIds.length === own.propertyIds.length &&
      stop.propertyIds.every((id, position) => id === own.propertyIds[position])
    );
  });
  if (!matches) return null;

  const segments: RouteSegment[] = [];
  let nextIndex = 0;
  for (const leg of route.legs) {
    // A single leg may span several stops, but all legs must join in order.
    if (
      leg.fromStopIndex !== nextIndex ||
      leg.toStopIndex <= leg.fromStopIndex ||
      leg.toStopIndex >= ownStops.length ||
      leg.path.length < 2 ||
      !Number.isFinite(leg.distance) ||
      leg.distance < 0 ||
      !Number.isFinite(leg.time) ||
      leg.time < 0
    )
      return null;
    if (
      !leg.path.every(
        ([longitude, latitude]) =>
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180
      )
    )
      return null;
    const first = leg.path[0];
    if (
      !leg.path.some(
        ([longitude, latitude]) =>
          longitude !== first[0] || latitude !== first[1]
      )
    )
      return null;

    segments.push({
      from: ownStops[leg.fromStopIndex],
      to: ownStops[leg.toStopIndex],
      meters: leg.distance,
      walkMinutes: secondsToWalkMinutes(leg.time),
      path: leg.path.map(([longitude, latitude]) => ({ latitude, longitude })),
    });
    nextIndex = leg.toStopIndex;
  }
  if (nextIndex !== ownStops.length - 1) return null;

  return {
    stops: ownStops,
    segments,
    totalMeters: route.totalDistance,
    totalSeconds: route.totalTime,
  };
}
