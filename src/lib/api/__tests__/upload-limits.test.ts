import { describe, expect, it } from 'vitest';
import { AppError } from '@/lib/api/errors';
import {
  getUploadErrorMessage,
  splitIntoUploadBatches,
} from '@/lib/api/upload-limits';

const MB = 1024 * 1024;

function files(...sizesInMb: number[]) {
  return sizesInMb.map((size, index) => ({ id: index, size: size * MB }));
}

function ids(batches: { id: number }[][]) {
  return batches.map((batch) => batch.map((file) => file.id));
}

describe('splitIntoUploadBatches', () => {
  it('returns no batches for no files', () => {
    expect(splitIntoUploadBatches([])).toEqual([]);
  });

  it('caps a batch at six files', () => {
    expect(ids(splitIntoUploadBatches(files(1, 1, 1, 1, 1, 1, 1)))).toEqual([
      [0, 1, 2, 3, 4, 5],
      [6],
    ]);
  });

  it('starts a new batch before the total would pass 100MB', () => {
    // Three 40MB camera JPGs would be 120MB of content — over the server's
    // 110MB request limit before multipart overhead is even counted.
    expect(ids(splitIntoUploadBatches(files(40, 40, 40)))).toEqual([
      [0, 1],
      [2],
    ]);
  });

  it('keeps file order across batches', () => {
    expect(ids(splitIntoUploadBatches(files(60, 45, 5, 60)))).toEqual([
      [0],
      [1, 2],
      [3],
    ]);
  });

  it('gives a file at the per-file cap a batch of its own when needed', () => {
    expect(ids(splitIntoUploadBatches(files(50, 50, 50)))).toEqual([
      [0, 1],
      [2],
    ]);
  });
});

describe('getUploadErrorMessage', () => {
  it('never shows a proxy 413 page body', () => {
    const error = new AppError({
      code: 'HTTP_ERROR',
      status: 413,
      message: '<html><head><title>413 Request Entity Too Large</title>',
    });

    expect(getUploadErrorMessage(error)).toBe(
      '사진 용량이 너무 커서 올리지 못했어요. 50MB 이하 사진으로 다시 시도해 주세요.'
    );
  });

  it('keeps a plain server message', () => {
    const error = new AppError({
      code: 'HTTP_ERROR',
      status: 400,
      message: '지원하지 않는 파일 형식입니다.',
    });

    expect(getUploadErrorMessage(error)).toBe(
      '사진을 올리지 못했어요. 지원하지 않는 파일 형식입니다.'
    );
  });

  it('drops an HTML body from any other status', () => {
    const error = new AppError({
      code: 'HTTP_ERROR',
      status: 502,
      message: '<html><body>Bad Gateway</body></html>',
    });

    expect(getUploadErrorMessage(error)).toBe(
      '사진을 올리지 못했어요. 잠시 뒤 다시 시도해 주세요.'
    );
  });
});
