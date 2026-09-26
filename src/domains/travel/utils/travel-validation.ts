/**
 * Travel-domain-local file validation. The 50MB ceiling matches the server's
 * per-file multipart cap, raised so camera JPGs (20~40MB) fit. Trip keeps its
 * own stricter copy in src/domains/trip/utils/trip-validation.ts rather than a
 * cross-domain import — trip and travel are separate domains (see AGENTS.md)
 * and this screen's message is in its own informal voice ('~해요'), unlike
 * trip's formal '~습니다'.
 */

export const MAX_TRAVEL_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** Returns a Korean error message when `file` is over the size limit, or null when it's fine. */
export function validateTravelFileSize(file: File): string | null {
  if (file.size > MAX_TRAVEL_FILE_SIZE_BYTES) {
    return '사진은 50MB까지 올릴 수 있어요.';
  }

  return null;
}

const ALLOWED_TRAVEL_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png'];
const ALLOWED_TRAVEL_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];

/**
 * Returns a Korean error message when `file` isn't one of the types the
 * cover/album dropzones declare via `accept='.jpg,.jpeg,.png'`, or null when
 * it's fine. `accept` only constrains the native file-picker dialog -- drag
 * and drop bypasses it entirely, so a .txt file dropped onto the dropzone
 * was accepted as-is and would have gone straight to the upload API. Checks
 * both the extension and the MIME type since either alone can be spoofed
 * (a renamed .txt file, or a browser that reports an empty `file.type`).
 */
export function validateTravelFileType(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const isAllowedExtension =
    ALLOWED_TRAVEL_IMAGE_EXTENSIONS.includes(extension);
  const isAllowedMimeType =
    file.type === '' || ALLOWED_TRAVEL_IMAGE_MIME_TYPES.includes(file.type);

  if (!isAllowedExtension || !isAllowedMimeType) {
    return 'jpg, jpeg, png 형식의 사진만 올릴 수 있어요.';
  }

  return null;
}
