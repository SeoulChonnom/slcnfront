import type { AnswerType } from '@/domains/inspection/types';

/**
 * screen_design.md §5.5 / prototype.html §9 — the Korean label shown for
 * each `AnswerType` in the type badge and the create-modal select. Kept as
 * a single source so the row badge and the form select never drift.
 */
export const ANSWER_TYPE_LABELS: Record<AnswerType, string> = {
  TEXT: '한 줄 글',
  LONG_TEXT: '긴 글',
  NUMBER: '숫자',
  BOOLEAN: '예 / 아니오',
  SINGLE_SELECT: '단일 선택',
  MULTI_SELECT: '다중 선택',
  RATING: '별점',
};

/** Order shown in the "타입" select when creating a question. */
export const CREATABLE_ANSWER_TYPES: AnswerType[] = [
  'LONG_TEXT',
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'SINGLE_SELECT',
  'MULTI_SELECT',
  'RATING',
];

export function answerTypeNeedsChoices(answerType: AnswerType) {
  return answerType === 'SINGLE_SELECT' || answerType === 'MULTI_SELECT';
}

export function answerTypeAllowsUnit(answerType: AnswerType) {
  return answerType === 'NUMBER';
}

/** api.md §9 — a PUT always mints a new version, so this is only ever "the next number". */
export function nextVersionLabel(currentVersionNo: number) {
  return `v${currentVersionNo + 1}으로 저장`;
}

/** Versions are minted 1..currentVersionNo with no gaps (api.md §9). */
export function existingVersionLabels(currentVersionNo: number) {
  return Array.from(
    { length: currentVersionNo },
    (_, index) => `v${index + 1}`
  ).join('·');
}
