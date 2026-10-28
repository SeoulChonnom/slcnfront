import { describe, expect, it } from 'vitest';
import { recommendRouteOrder } from '../route-order';

type Coordinate = { latitude: number; longitude: number };

function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cost(a: Coordinate, b: Coordinate) {
  const rad = (v: number) => (v * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h)) * 1.3;
}

function tourCost(origin: Coordinate, points: Coordinate[], back = false) {
  let total = 0;
  let prev = origin;
  for (const point of points) {
    total += cost(prev, point);
    prev = point;
  }
  return back && points.length > 0 ? total + cost(prev, origin) : total;
}

function randomPoints(random: () => number, count: number): Coordinate[] {
  return Array.from({ length: count }, () => ({
    latitude: 37.4 + random() * 0.1,
    longitude: 126.9 + random() * 0.1,
  }));
}

function toItems(points: Coordinate[]) {
  return points.map((location, index) => ({ id: `p${index}`, location }));
}

function bestBruteForce(
  origin: Coordinate,
  points: Coordinate[],
  back = false
) {
  let best = Number.POSITIVE_INFINITY;
  const used = new Array(points.length).fill(false);
  const walk = (prev: Coordinate, count: number, acc: number) => {
    if (acc >= best) return;
    if (count === points.length) {
      best = Math.min(best, acc + (back ? cost(prev, origin) : 0));
      return;
    }
    for (let i = 0; i < points.length; i += 1) {
      if (used[i]) continue;
      used[i] = true;
      walk(points[i], count + 1, acc + cost(prev, points[i]));
      used[i] = false;
    }
  };
  walk(origin, 0, 0);
  return best;
}

function costOfIds(
  origin: Coordinate,
  points: Coordinate[],
  ids: string[],
  back = false
) {
  return tourCost(
    origin,
    ids.map((id) => points[Number(id.slice(1))]),
    back
  );
}

const origin: Coordinate = { latitude: 37.45, longitude: 126.95 };

describe('recommendRouteOrder', () => {
  it('handles empty, all-unlocated and single-stop inputs', () => {
    expect(recommendRouteOrder({ origin, items: [] })).toEqual({
      orderedIds: [],
      distanceMeters: 0,
      currentDistanceMeters: 0,
      unlocatedIds: [],
    });
    const none = recommendRouteOrder({
      origin,
      items: [
        { id: 'a', location: null },
        { id: 'b', location: null },
      ],
    });
    expect(none.orderedIds).toEqual(['a', 'b']);
    expect(none.unlocatedIds).toEqual(['a', 'b']);
    expect(none.distanceMeters).toBe(0);

    const point = { latitude: 37.46, longitude: 126.96 };
    const one = recommendRouteOrder({
      origin,
      items: [{ id: 'a', location: point }],
    });
    expect(one.orderedIds).toEqual(['a']);
    expect(one.distanceMeters).toBeCloseTo(cost(origin, point), 6);
    const back = recommendRouteOrder({
      origin,
      items: [{ id: 'a', location: point }],
      returnToOrigin: true,
    });
    expect(back.distanceMeters).toBeCloseTo(cost(origin, point) * 2, 6);
  });

  it.each([6, 7, 8, 9])(
    'matches an independent brute force for k=%i',
    (count) => {
      for (let seed = 1; seed <= 3; seed += 1) {
        const random = createRandom(seed * 100 + count);
        const points = randomPoints(random, count);
        for (const back of [false, true]) {
          const result = recommendRouteOrder({
            origin,
            items: toItems(points),
            returnToOrigin: back,
          });
          const expected = bestBruteForce(origin, points, back);
          expect(result.distanceMeters).toBeCloseTo(expected, 3);
          expect(result.orderedIds).toHaveLength(count);
          expect(new Set(result.orderedIds).size).toBe(count);
          expect(
            costOfIds(origin, points, result.orderedIds, back)
          ).toBeCloseTo(expected, 3);
        }
      }
    }
  );

  it('is deterministic', () => {
    const points = randomPoints(createRandom(7), 11);
    const input = { origin, items: toItems(points) };
    expect(recommendRouteOrder(input)).toEqual(recommendRouteOrder(input));
  });

  it('prefers the current screen order on ties (lexicographically smallest stop sequence)', () => {
    // 출발지 양옆 대칭 두 지점: 비용이 같으므로 화면 순서(왼쪽 먼저)를 유지한다.
    const left = { latitude: 37.45, longitude: 126.94 };
    const right = { latitude: 37.45, longitude: 126.96 };
    const a = recommendRouteOrder({
      origin: { latitude: 37.45, longitude: 126.95 },
      items: [
        { id: 'l', location: left },
        { id: 'r', location: right },
      ],
      returnToOrigin: true,
    });
    expect(a.orderedIds).toEqual(['l', 'r']);
    const b = recommendRouteOrder({
      origin: { latitude: 37.45, longitude: 126.95 },
      items: [
        { id: 'r', location: right },
        { id: 'l', location: left },
      ],
      returnToOrigin: true,
    });
    expect(b.orderedIds).toEqual(['r', 'l']);
  });

  it('collapses identical coordinates and keeps their screen order', () => {
    const near = { latitude: 37.451, longitude: 126.951 };
    const far = { latitude: 37.5, longitude: 127.0 };
    const result = recommendRouteOrder({
      origin,
      items: [
        { id: 'far1', location: far },
        { id: 'near1', location: near },
        { id: 'far2', location: far },
        { id: 'near2', location: { ...near } },
      ],
    });
    expect(result.orderedIds).toEqual(['near1', 'near2', 'far1', 'far2']);
    expect(result.distanceMeters).toBeCloseTo(
      cost(origin, near) + cost(near, far),
      6
    );
    expect(result.currentDistanceMeters).toBeCloseTo(
      cost(origin, far) + cost(far, near),
      6
    );
  });

  it('appends unlocated items at the end in their relative order', () => {
    const result = recommendRouteOrder({
      origin,
      items: [
        { id: 'u1', location: null },
        { id: 'a', location: { latitude: 37.5, longitude: 127.0 } },
        { id: 'u2', location: null },
        { id: 'b', location: { latitude: 37.451, longitude: 126.951 } },
      ],
    });
    expect(result.orderedIds).toEqual(['b', 'a', 'u1', 'u2']);
    expect(result.unlocatedIds).toEqual(['u1', 'u2']);
  });

  it('returnToOrigin changes the result in a constructed case', () => {
    // 출발지에서 가까운 B(동쪽 약간), 먼 C(동쪽 멀리), 반대편 A(서쪽 중간)
    const a = { latitude: 37.45, longitude: 126.93 };
    const b = { latitude: 37.45, longitude: 126.955 };
    const c = { latitude: 37.45, longitude: 127.1 };
    const items = [
      { id: 'A', location: a },
      { id: 'B', location: b },
      { id: 'C', location: c },
    ];
    const open = recommendRouteOrder({ origin, items });
    const closed = recommendRouteOrder({ origin, items, returnToOrigin: true });
    expect(open.orderedIds).not.toEqual(closed.orderedIds);
    expect(closed.distanceMeters).toBeGreaterThan(open.distanceMeters);
  });

  it('k=15 returns a valid permutation no worse than nearest-neighbour', () => {
    for (const back of [false, true]) {
      const points = randomPoints(createRandom(15), 15);
      const result = recommendRouteOrder({
        origin,
        items: toItems(points),
        returnToOrigin: back,
      });
      expect([...result.orderedIds].sort()).toEqual(
        toItems(points)
          .map((i) => i.id)
          .sort()
      );

      const remaining = points.map((_, i) => i);
      const nn: number[] = [];
      let prev = origin;
      while (remaining.length > 0) {
        let pick = 0;
        for (let i = 1; i < remaining.length; i += 1) {
          if (
            cost(prev, points[remaining[i]]) <
            cost(prev, points[remaining[pick]])
          )
            pick = i;
        }
        const [index] = remaining.splice(pick, 1);
        nn.push(index);
        prev = points[index];
      }
      const nnCost = tourCost(
        origin,
        nn.map((i) => points[i]),
        back
      );
      expect(result.distanceMeters).toBeLessThanOrEqual(nnCost + 1e-6);
      expect(result.distanceMeters).toBeCloseTo(
        costOfIds(origin, points, result.orderedIds, back),
        3
      );
    }
  });

  it('computes k=13 in under 500ms', () => {
    const points = randomPoints(createRandom(13), 13);
    const started = performance.now();
    const result = recommendRouteOrder({ origin, items: toItems(points) });
    expect(performance.now() - started).toBeLessThan(500);
    expect(result.orderedIds).toHaveLength(13);
  });
});
