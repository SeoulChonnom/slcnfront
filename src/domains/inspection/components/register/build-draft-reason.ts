import type { IncompleteSummary } from '@/domains/inspection/types';

const PROPERTY_FIELD_LABELS: Record<string, string> = {
  complexName: '단지명',
  name: '매물명',
  interestLevel: '관심도',
};

const VISIT_FIELD_LABELS: Record<string, string> = {
  visitedAt: '임장 일시',
  revisitIntent: '재방문 의사',
};

/**
 * "필수 문답 2개 남음 — 관리비 수준, 주차 대수" style one-liner
 * (screen_design.md §5.4 ③) built from a property's own `incompleteSummary`.
 */
export function buildPropertyDraftReason(summary: IncompleteSummary): string {
  const parts: string[] = [];
  const missing = summary.missingFields.map(
    (field) => PROPERTY_FIELD_LABELS[field] ?? field
  );

  if (missing.length > 0) {
    parts.push(missing.join('·'));
  }

  if (summary.unansweredRequiredCount > 0) {
    const names = summary.unansweredRequiredQuestions
      .map((question) => question.question)
      .slice(0, 3);
    const suffix =
      summary.unansweredRequiredQuestions.length > names.length ? ' 외' : '';

    parts.push(
      `필수 문답 ${summary.unansweredRequiredCount}개 남음 — ${names.join(', ')}${suffix}`
    );
  }

  return parts.join(' · ');
}

export function buildVisitDraftReason(summary: IncompleteSummary): string {
  const parts: string[] = [];
  const missing = summary.visitMissingFields.map(
    (field) => VISIT_FIELD_LABELS[field] ?? field
  );

  if (missing.length > 0) {
    parts.push(`${missing.join('·')} 미입력`);
  }

  if (summary.draftPropertyCount > 0) {
    parts.push(`매물 ${summary.draftPropertyCount}건 작성 중`);
  }

  return parts.join(' · ');
}
