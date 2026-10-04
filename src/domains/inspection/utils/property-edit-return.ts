/**
 * ③-1 매물 편집 normally hands back to the register wizard. When it was
 * opened from 지역 상세 instead, this query flag sends it back there.
 */
const PROPERTY_EDIT_FROM_PARAM = 'from';
const PROPERTY_EDIT_FROM_AREA = 'area';

export const PROPERTY_EDIT_FROM_AREA_SEARCH = `?${PROPERTY_EDIT_FROM_PARAM}=${PROPERTY_EDIT_FROM_AREA}`;

export function isPropertyEditFromArea(searchParams: URLSearchParams): boolean {
  return searchParams.get(PROPERTY_EDIT_FROM_PARAM) === PROPERTY_EDIT_FROM_AREA;
}
