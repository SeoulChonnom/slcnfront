/**
 * Travel-domain-local file validation. Mirrors the 10MB ceiling in
 * src/domains/trip/utils/trip-validation.ts, but is kept as its own copy
 * rather than a cross-domain import — trip and travel are separate domains
 * (see AGENTS.md) and this screen's message is in its own informal voice
 * ('~해요'), unlike trip's formal '~습니다'.
 */

export const MAX_TRAVEL_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Returns a Korean error message when `file` is over the size limit, or null when it's fine. */
export function validateTravelFileSize(file: File): string | null {
  if (file.size > MAX_TRAVEL_FILE_SIZE_BYTES) {
    return '사진은 10MB까지 올릴 수 있어요.';
  }

  return null;
}
