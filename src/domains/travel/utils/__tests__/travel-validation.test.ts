import { describe, expect, it } from 'vitest';
import {
  MAX_TRAVEL_FILE_SIZE_BYTES,
  validateTravelFileSize,
  validateTravelFileType,
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

describe('validateTravelFileType', () => {
  it('returns null for a .jpg/.jpeg/.png file with a matching image MIME type', () => {
    expect(
      validateTravelFileType(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))
    ).toBeNull();
    expect(
      validateTravelFileType(new File(['x'], 'a.jpeg', { type: 'image/jpeg' }))
    ).toBeNull();
    expect(
      validateTravelFileType(new File(['x'], 'a.png', { type: 'image/png' }))
    ).toBeNull();
  });

  it('returns the informal message for a .txt file, even one with an image MIME type', () => {
    // Extension AND MIME type are both checked -- a renamed file can spoof
    // one but not both without also fooling the OS's own file picker.
    expect(
      validateTravelFileType(
        new File(['x'], 'notes.txt', { type: 'text/plain' })
      )
    ).toBe('jpg, jpeg, png 형식의 사진만 올릴 수 있어요.');
    expect(
      validateTravelFileType(
        new File(['x'], 'notes.txt', { type: 'image/png' })
      )
    ).toBe('jpg, jpeg, png 형식의 사진만 올릴 수 있어요.');
  });

  it('rejects a disallowed image type such as .gif', () => {
    expect(
      validateTravelFileType(new File(['x'], 'a.gif', { type: 'image/gif' }))
    ).toBe('jpg, jpeg, png 형식의 사진만 올릴 수 있어요.');
  });
});
