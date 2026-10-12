import { describe, expect, it } from 'vitest';
import {
  classifyLocationError,
  describeLocationError,
} from '@/domains/geo/utils/location-error';
import { AppError } from '@/lib/api/errors';

function httpError(status: number, apiCode?: string, fieldErrors = false) {
  return new AppError({
    code: 'HTTP_ERROR',
    message: '서버 안내',
    status,
    apiCode,
    fieldErrors: fieldErrors
      ? [{ field: 'name', code: 'NotBlank', message: 'x' }]
      : [],
  });
}

describe('classifyLocationError', () => {
  it('classifies 06 §4.3 location problems', () => {
    expect(
      classifyLocationError(httpError(400, 'ADDRESS_COORDINATE_NOT_FOUND'))
    ).toBe('location');
    expect(classifyLocationError(httpError(502, 'ADDRESS_LOOKUP_FAILED'))).toBe(
      'location'
    );
  });

  it('classifies 503 as unavailable and keyword errors separately', () => {
    expect(
      classifyLocationError(httpError(503, 'ADDRESS_LOOKUP_UNAVAILABLE'))
    ).toBe('unavailable');
    expect(
      classifyLocationError(httpError(400, 'INVALID_ADDRESS_KEYWORD'))
    ).toBe('keyword');
  });

  it('treats VALIDATION_FAILED as a location problem only when a new location was sent without field errors', () => {
    const error = httpError(400, 'VALIDATION_FAILED');
    expect(classifyLocationError(error)).toBe('other');
    expect(classifyLocationError(error, { requestHadNewLocation: true })).toBe(
      'location'
    );
    expect(
      classifyLocationError(httpError(400, 'VALIDATION_FAILED', true), {
        requestHadNewLocation: true,
      })
    ).toBe('other');
  });

  it('falls back to other for unrelated or non-AppError failures', () => {
    expect(classifyLocationError(httpError(500))).toBe('other');
    expect(classifyLocationError(new Error('boom'))).toBe('other');
    expect(classifyLocationError(httpError(500, 'ADDRESS_LOOKUP_FAILED'))).toBe(
      'other'
    );
  });
});

describe('describeLocationError', () => {
  it('uses fixed copy for 502/503 and the server title (plus a hint) for missing coordinates', () => {
    expect(
      describeLocationError(httpError(503, 'ADDRESS_LOOKUP_UNAVAILABLE'))
    ).toBe('지금은 주소를 쓸 수 없어요');
    expect(describeLocationError(httpError(502, 'ADDRESS_LOOKUP_FAILED'))).toBe(
      '주소 확인에 실패했어요. 잠시 후 다시 시도해 주세요'
    );
    expect(
      describeLocationError(httpError(400, 'ADDRESS_COORDINATE_NOT_FOUND'))
    ).toContain('가까운 다른 건물을 고르거나 위치 없이 두세요');
  });
});
