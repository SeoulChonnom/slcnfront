import { AppError } from '@/lib/api/errors';

/** Server multipart cap per file (`spring.servlet.multipart.max-file-size`). */
export const MAX_UPLOAD_FILE_BYTES = 50 * 1024 * 1024;

/**
 * Bytes of file content per upload request. The server caps a whole request at
 * 110MB; this leaves room for multipart boundaries and headers so a batch of
 * files just under the per-file cap can't tip the request over.
 */
const MAX_UPLOAD_BATCH_BYTES = 100 * 1024 * 1024;

/**
 * Files per upload request. Each photo gets its size variants generated inside
 * the request, so a large batch keeps the request open a long time.
 */
const MAX_UPLOAD_BATCH_FILES = 6;

/**
 * Splits `files` into request-sized batches, in order, by count and total
 * bytes. A file is never split, so each batch holds at least one file.
 */
export function splitIntoUploadBatches<T extends Pick<File, 'size'>>(
  files: readonly T[]
): T[][] {
  const batches: T[][] = [];
  let current: T[] = [];
  let currentBytes = 0;

  for (const file of files) {
    const isFull =
      current.length >= MAX_UPLOAD_BATCH_FILES ||
      currentBytes + file.size > MAX_UPLOAD_BATCH_BYTES;

    if (current.length > 0 && isFull) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }

    current.push(file);
    currentBytes += file.size;
  }

  if (current.length > 0) {
    batches.push(current);
  }

  return batches;
}

/**
 * A 413 can come from the reverse proxy as an HTML page, so its body is never
 * shown; any other failure keeps the server's message when it has one.
 */
export function getUploadErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.status === 413) {
    return '사진 용량이 너무 커서 올리지 못했어요. 50MB 이하 사진으로 다시 시도해 주세요.';
  }

  if (error instanceof AppError && error.code === 'NETWORK_ERROR') {
    return '사진을 올리지 못했어요. 네트워크 연결을 확인해 주세요.';
  }

  if (
    error instanceof Error &&
    error.message &&
    !/<[a-z!]/i.test(error.message)
  ) {
    return `사진을 올리지 못했어요. ${error.message}`;
  }

  return '사진을 올리지 못했어요. 잠시 뒤 다시 시도해 주세요.';
}
