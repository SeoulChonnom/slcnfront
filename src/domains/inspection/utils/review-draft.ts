import type { ReviewSuggestion } from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';

export const REVIEW_DRAFT_MEMO_MAX_LENGTH = 5000;

const REVIEW_DRAFT_FALLBACK_ERROR =
  '초안을 만들지 못했어요. 잠시 뒤 다시 시도해 주세요.';

/** A precondition failure whose message is already user-facing Korean copy. */
export class ReviewDraftError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewDraftError';
  }
}

/**
 * 503 REVIEW_SUGGESTION_UNAVAILABLE and 400 VALIDATION_FAILED carry a
 * user-ready `title` (= AppError.message) — show it as-is (api.md §8-1).
 */
export function resolveReviewDraftErrorMessage(error: unknown): string {
  if (error instanceof ReviewDraftError) {
    return error.message;
  }

  if (
    error instanceof AppError &&
    (error.apiCode === 'REVIEW_SUGGESTION_UNAVAILABLE' ||
      error.apiCode === 'VALIDATION_FAILED')
  ) {
    return error.message;
  }

  return REVIEW_DRAFT_FALLBACK_ERROR;
}

/** True when any of the four fields a draft would replace already has content. */
export function hasExistingReviewContent(fields: {
  oneLineReview: string;
  pros: string;
  cons: string;
  tags: string[];
}): boolean {
  return (
    fields.oneLineReview.trim() !== '' ||
    fields.pros.trim() !== '' ||
    fields.cons.trim() !== '' ||
    fields.tags.length > 0
  );
}

export type ReviewSuggestionField = keyof ReviewSuggestion;

/** Fields the suggestion actually fills — empty ones are left untouched. */
export function getSuggestedFields(
  suggestion: ReviewSuggestion
): ReviewSuggestionField[] {
  const fields: ReviewSuggestionField[] = [];

  if (suggestion.oneLineReview.trim()) {
    fields.push('oneLineReview');
  }
  if (suggestion.pros.trim()) {
    fields.push('pros');
  }
  if (suggestion.cons.trim()) {
    fields.push('cons');
  }
  if (suggestion.tags.length > 0) {
    fields.push('tags');
  }

  return fields;
}
