/**
 * Pure geometry for the visit route (04-decision-review §6.2 / §6.3).
 * The order is always the API array order; this module never sorts.
 */

export type GeoPoint = { latitude: number; longitude: number };

type LocatedProperty = {
  propertyId: string;
  location: (GeoPoint & { bdMgtSn: string }) | null;
};

export type RouteStop = GeoPoint & {
  /** `bdMgtSn` of the merged properties. */
  bdMgtSn: string;
  propertyIds: string[];
  /** 1-based positions in the full screen list (unlocated rows keep theirs). */
  numbers: number[];
  /** Marker text, e.g. "2" or "2·3". */
  label: string;
};

export type RouteSegment = {
  from: RouteStop;
  to: RouteStop;
  meters: number;
  walkMinutes: number;
};

const EARTH_RADIUS_METERS = 6_371_000;
const DETOUR_FACTOR = 1.3;
const WALK_METERS_PER_MINUTE = (4.5 * 1000) / 60;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function haversineMeters(a: GeoPoint, b: GeoPoint) {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Straight distance x 1.3 at 4.5 km/h, rounded up to whole minutes. */
export function estimateWalkMinutes(straightMeters: number) {
  if (straightMeters <= 0) {
    return 0;
  }

  return Math.ceil((straightMeters * DETOUR_FACTOR) / WALK_METERS_PER_MINUTE);
}

/**
 * Stops in array order. Properties without a location are skipped (they keep
 * their number but get no marker). Only CONSECUTIVE properties sharing a
 * `bdMgtSn` merge, so A -> B -> A stays three stops. Unlocated rows sitting
 * between two same-address rows do not break a merge (they are skipped first).
 */
export function buildStops(properties: LocatedProperty[]): RouteStop[] {
  const stops: RouteStop[] = [];

  properties.forEach((property, index) => {
    const { location } = property;
    if (!location) {
      return;
    }

    const number = index + 1;
    const last = stops.at(-1);
    if (last && last.bdMgtSn === location.bdMgtSn) {
      last.propertyIds.push(property.propertyId);
      last.numbers.push(number);
      last.label = last.numbers.join('·');

      return;
    }

    stops.push({
      bdMgtSn: location.bdMgtSn,
      latitude: location.latitude,
      longitude: location.longitude,
      propertyIds: [property.propertyId],
      numbers: [number],
      label: String(number),
    });
  });

  return stops;
}

export function buildSegments(stops: RouteStop[]): RouteSegment[] {
  const segments: RouteSegment[] = [];

  for (let index = 1; index < stops.length; index += 1) {
    const from = stops[index - 1];
    const to = stops[index];
    const meters = haversineMeters(from, to);
    segments.push({
      from,
      to,
      meters,
      walkMinutes: estimateWalkMinutes(meters),
    });
  }

  return segments;
}
