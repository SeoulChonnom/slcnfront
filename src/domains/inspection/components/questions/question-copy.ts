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
  'TEXT',
  'LONG_TEXT',
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

/**
 * api.md §11 — branch on the server `code`, never on `title`. Anything not
 * listed falls back to the caller's generic sentence.
 */
const CATEGORY_ERROR_MESSAGES: Record<string, string> = {
  INSPECTION_QUESTION_CATEGORY_DUPLICATED:
    '같은 이름의 분류가 이미 있습니다. 미사용 분류까지 포함해 이름이 겹치면 안 됩니다.',
  INVALID_INSPECTION_QUESTION_CATEGORY: '분류 이름은 1~50자로 입력해 주세요.',
  INSPECTION_QUESTION_CATEGORY_IN_USE:
    '사용 중인 질문이 남아 있어 미사용 처리할 수 없습니다. 질문을 먼저 미사용 처리하거나 다른 분류로 옮겨 주세요.',
  INSPECTION_QUESTION_CATEGORY_CONFLICT:
    '다른 곳에서 먼저 수정했습니다. 새로고침 후 다시 시도하세요.',
  INSPECTION_QUESTION_CATEGORY_REQUIRED: '질문을 넣을 분류를 골라 주세요.',
  INSPECTION_QUESTION_CATEGORY_NOT_FOUND:
    '선택한 분류를 찾을 수 없습니다. 새로고침 후 다른 분류를 골라 주세요.',
  INSPECTION_QUESTION_CATEGORY_DISABLED:
    '미사용 분류에는 질문을 넣을 수 없습니다. 다른 분류를 골라 주세요.',
  INSPECTION_QUESTION_REACTIVATION_BLOCKED:
    '미사용 분류에 있는 질문은 다시 사용할 수 없습니다. 분류를 먼저 다시 사용하거나 다른 분류로 옮겨 주세요.',
  INSPECTION_QUESTION_CONFLICT:
    '질문이 이미 수정되었습니다. 새로고침 후 다시 시도하세요.',
};

export function questionErrorMessage(apiCode: string | undefined) {
  return apiCode ? CATEGORY_ERROR_MESSAGES[apiCode] : undefined;
}

export const CATEGORY_NAME_MAX_LENGTH = 50;
