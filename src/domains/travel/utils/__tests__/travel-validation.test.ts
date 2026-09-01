import { describe, expect, it } from 'vitest';
import {
  MAX_TRAVEL_FILE_SIZE_BYTES,
  validateTravelFileSize,
} from '@/domains/travel/utils/travel-validation';

function fileOfSize(bytes: number): File {
  return new File([new Uint8Array(bytes)], 'photo.jpg', {
    type: 'image/jpeg',
  });
}

describe('validateTravelFileSize', () => {
  it('returns null for a file within the 10MB limit', () => {
    expect(validateTravelFileSize(fileOfSize(1024))).toBeNull();
  });

  it('returns null for a file exactly at the limit', () => {
    expect(
      validateTravelFileSize(fileOfSize(MAX_TRAVEL_FILE_SIZE_BYTES))
    ).toBeNull();
  });

  it("returns the screen's informal message for an oversized file", () => {
    expect(
      validateTravelFileSize(fileOfSize(MAX_TRAVEL_FILE_SIZE_BYTES + 1))
    ).toBe('사진은 10MB까지 올릴 수 있어요.');
  });
});
