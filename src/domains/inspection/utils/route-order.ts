type Coordinate = { latitude: number; longitude: number };

type RouteOrderInput = {
  origin: Coordinate;
  /** 현재 화면 순서. 위치가 없는 항목은 `location: null` */
  items: Array<{ id: string; location: Coordinate | null }>;
  /** true면 출발지로 돌아오는 닫힌 경로로 계산한다 */
  returnToOrigin?: boolean;
};

type RouteOrderResult = {
  orderedIds: string[];
  /** 추천 순서의 총 비용(미터, 우회 보정 포함) */
  distanceMeters: number;
  /** 현재 화면 순서의 총 비용(미터, 위치가 있는 지점만) */
  currentDistanceMeters: number;
  unlocatedIds: string[];
};

const EARTH_RADIUS_METERS = 6_371_000;
const DETOUR_FACTOR = 1.3;
const EPSILON = 1e-6;
const BRUTE_FORCE_MAX = 8;
const HELD_KARP_MAX = 13;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function walkingCost(a: Coordinate, b: Coordinate) {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.asin(Math.min(1, Math.sqrt(h))) *
    DETOUR_FACTOR
  );
}

type Problem = {
  count: number;
  /** from origin to stop */
  fromOrigin: number[];
  /** between stops */
  between: number[][];
  returnToOrigin: boolean;
};

function pathCost(problem: Problem, order: readonly number[]) {
  if (order.length === 0) return 0;
  let total = problem.fromOrigin[order[0]];
  for (let i = 1; i < order.length; i += 1) {
    total += problem.between[order[i - 1]][order[i]];
  }
  if (problem.returnToOrigin)
    total += problem.fromOrigin[order[order.length - 1]];
  return total;
}

/** 사전순으로 순열을 훑고, 동률이면 먼저 나온(사전순으로 작은) 순열을 유지한다. */
function bruteForce(problem: Problem) {
  const { count } = problem;
  const current: number[] = [];
  const used: boolean[] = new Array(count).fill(false);
  let best: number[] = [];
  let bestCost = Number.POSITIVE_INFINITY;

  const visit = (partial: number) => {
    if (partial >= bestCost - EPSILON) return;
    if (current.length === count) {
      const total =
        partial +
        (problem.returnToOrigin ? problem.fromOrigin[current[count - 1]] : 0);
      if (total < bestCost - EPSILON) {
        bestCost = total;
        best = [...current];
      }
      return;
    }
    for (let next = 0; next < count; next += 1) {
      if (used[next]) continue;
      const step =
        current.length === 0
          ? problem.fromOrigin[next]
          : problem.between[current[current.length - 1]][next];
      used[next] = true;
      current.push(next);
      visit(partial + step);
      current.pop();
      used[next] = false;
    }
  };
  visit(0);
  return best;
}

/**
 * 남은 구간의 최소 비용 g[mask][last]를 뒤에서부터 계산한 뒤, 앞에서부터
 * 가장 작은 인덱스를 우선해 복원하므로 동률에서도 사전순 최소 순서가 나온다.
 */
function heldKarp(problem: Problem) {
  const { count } = problem;
  const full = (1 << count) - 1;
  const g = new Float64Array((full + 1) * count);
  for (let last = 0; last < count; last += 1) {
    g[full * count + last] = problem.returnToOrigin
      ? problem.fromOrigin[last]
      : 0;
  }
  for (let mask = full - 1; mask > 0; mask -= 1) {
    for (let last = 0; last < count; last += 1) {
      if (!(mask & (1 << last))) continue;
      let best = Number.POSITIVE_INFINITY;
      for (let next = 0; next < count; next += 1) {
        if (mask & (1 << next)) continue;
        const value =
          problem.between[last][next] + g[(mask | (1 << next)) * count + next];
        if (value < best) best = value;
      }
      g[mask * count + last] = best;
    }
  }

  let optimal = Number.POSITIVE_INFINITY;
  for (let first = 0; first < count; first += 1) {
    optimal = Math.min(
      optimal,
      problem.fromOrigin[first] + g[(1 << first) * count + first]
    );
  }

  const order: number[] = [];
  let mask = 0;
  let last = -1;
  let remaining = optimal;
  for (let step = 0; step < count; step += 1) {
    for (let next = 0; next < count; next += 1) {
      if (mask & (1 << next)) continue;
      const edge =
        step === 0 ? problem.fromOrigin[next] : problem.between[last][next];
      const nextMask = mask | (1 << next);
      const total = edge + g[nextMask * count + next];
      if (total <= remaining + EPSILON) {
        order.push(next);
        remaining = g[nextMask * count + next];
        mask = nextMask;
        last = next;
        break;
      }
    }
  }
  return order;
}

function nearestNeighbour(problem: Problem) {
  const order: number[] = [];
  const used: boolean[] = new Array(problem.count).fill(false);
  let last = -1;
  for (let step = 0; step < problem.count; step += 1) {
    let pick = -1;
    let pickCost = Number.POSITIVE_INFINITY;
    for (let next = 0; next < problem.count; next += 1) {
      if (used[next]) continue;
      const cost =
        last < 0 ? problem.fromOrigin[next] : problem.between[last][next];
      if (cost < pickCost - EPSILON) {
        pick = next;
        pickCost = cost;
      }
    }
    used[pick] = true;
    order.push(pick);
    last = pick;
  }
  return order;
}

function twoOpt(problem: Problem, start: number[]) {
  const order = [...start];
  let cost = pathCost(problem, order);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < order.length - 1 && !improved; i += 1) {
      for (let j = i + 1; j < order.length && !improved; j += 1) {
        const candidate = [
          ...order.slice(0, i),
          ...order.slice(i, j + 1).reverse(),
          ...order.slice(j + 1),
        ];
        const candidateCost = pathCost(problem, candidate);
        if (candidateCost < cost - EPSILON) {
          order.splice(0, order.length, ...candidate);
          cost = candidateCost;
          improved = true;
        }
      }
    }
  }
  return order;
}

function solve(problem: Problem) {
  if (problem.count <= 1) return problem.count === 0 ? [] : [0];
  if (problem.count <= BRUTE_FORCE_MAX) return bruteForce(problem);
  if (problem.count <= HELD_KARP_MAX) return heldKarp(problem);
  return twoOpt(problem, nearestNeighbour(problem));
}

export function recommendRouteOrder(input: RouteOrderInput): RouteOrderResult {
  // 같은 좌표는 한 지점으로 묶는다. 지점 번호는 화면에서 처음 나온 순서다.
  const stopIndexByKey = new Map<string, number>();
  const stops: Array<{ location: Coordinate; ids: string[] }> = [];
  const unlocatedIds: string[] = [];

  for (const item of input.items) {
    if (!item.location) {
      unlocatedIds.push(item.id);
      continue;
    }
    const key = `${item.location.latitude},${item.location.longitude}`;
    const existing = stopIndexByKey.get(key);
    if (existing === undefined) {
      stopIndexByKey.set(key, stops.length);
      stops.push({ location: item.location, ids: [item.id] });
    } else {
      stops[existing].ids.push(item.id);
    }
  }

  const problem: Problem = {
    count: stops.length,
    fromOrigin: stops.map((stop) => walkingCost(input.origin, stop.location)),
    between: stops.map((a) =>
      stops.map((b) => walkingCost(a.location, b.location))
    ),
    returnToOrigin: input.returnToOrigin === true,
  };

  const order = solve(problem);
  const currentOrder = stops.map((_, index) => index);

  return {
    orderedIds: [
      ...order.flatMap((index) => stops[index].ids),
      ...unlocatedIds,
    ],
    distanceMeters: pathCost(problem, order),
    currentDistanceMeters: pathCost(problem, currentOrder),
    unlocatedIds,
  };
}
