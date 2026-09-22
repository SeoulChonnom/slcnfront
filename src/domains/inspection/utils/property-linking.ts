/**
 * Normalizes a `complexName`/`name` value the same way the server does when
 * it stores one (trim + collapse internal whitespace to a single space) so
 * the value sent to `GET /inspection-areas/{areaId}/properties` matches on
 * exact equality. See fe_implementation_decisions.md §3-② and api.md §4
 * "회차 간 매물 연결 목록" — this is deliberately exact-match, not fuzzy:
 * a false positive would link two unrelated properties together.
 */
export function normalizePropertyLinkValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export type PropertyLinkKey = {
  complexName: string;
  name: string;
};

/** True when both `complexName` and `name` normalize to the same value. */
export function isSamePropertyLink(
  a: PropertyLinkKey,
  b: PropertyLinkKey
): boolean {
  return (
    normalizePropertyLinkValue(a.complexName) ===
      normalizePropertyLinkValue(b.complexName) &&
    normalizePropertyLinkValue(a.name) === normalizePropertyLinkValue(b.name)
  );
}
