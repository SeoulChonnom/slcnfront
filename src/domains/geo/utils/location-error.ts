import { AppError } from '@/lib/api/errors';

/**
 * 06-fe-plan §4.3 — how a failed request relates to the location feature.
 * - `location`: the address could not be resolved/saved (retry without it)
 * - `unavailable`: the lookup feature is off (503)
 * - `keyword`: the search keyword was rejected
 * - `other`: not location related
 */
export type LocationErrorKind =
  | 'location'
  | 'unavailable'
  | 'keyword'
  | 'other';

type ClassifyOptions = {
  /** Whether the failed request carried a new location (needs a lookup). */
  requestHadNewLocation?: boolean;
};

export function classifyLocationError(
  error: unknown,
  { requestHadNewLocation = false }: ClassifyOptions = {}
): LocationErrorKind {
  if (!(error instanceof AppError)) {
    return 'other';
  }

  switch (error.apiCode) {
    case 'ADDRESS_COORDINATE_NOT_FOUND':
      return error.status === 400 ? 'location' : 'other';
    case 'ADDRESS_LOOKUP_FAILED':
      return error.status === 502 ? 'location' : 'other';
    case 'ADDRESS_LOOKUP_UNAVAILABLE':
      return error.status === 503 ? 'unavailable' : 'other';
    case 'INVALID_ADDRESS_KEYWORD':
      return error.status === 400 ? 'keyword' : 'other';
    case 'VALIDATION_FAILED':
      // Location violations come with `title` only; any other validation
      // failure is an ordinary input problem unless a new location was sent.
      return error.status === 400 &&
        requestHadNewLocation &&
        error.fieldErrors.length === 0
        ? 'location'
        : 'other';
    default:
      return 'other';
  }
}

export const ADDRESS_UNAVAILABLE_MESSAGE = '지금은 주소를 쓸 수 없어요';
const ADDRESS_LOOKUP_FAILED_MESSAGE =
  '주소 확인에 실패했어요. 잠시 후 다시 시도해 주세요';
const COORDINATE_NOT_FOUND_HINT =
  '가까운 다른 건물을 고르거나 위치 없이 두세요';

/** The reason line shown after a location save failed. */
export function describeLocationError(error: unknown): string {
  if (error instanceof AppError) {
    if (error.apiCode === 'ADDRESS_LOOKUP_UNAVAILABLE') {
      return ADDRESS_UNAVAILABLE_MESSAGE;
    }
    if (error.apiCode === 'ADDRESS_LOOKUP_FAILED') {
      return ADDRESS_LOOKUP_FAILED_MESSAGE;
    }
    if (error.message) {
      return error.apiCode === 'ADDRESS_COORDINATE_NOT_FOUND'
        ? `${error.message}. ${COORDINATE_NOT_FOUND_HINT}`
        : error.message;
    }
  }
  return ADDRESS_LOOKUP_FAILED_MESSAGE;
}
