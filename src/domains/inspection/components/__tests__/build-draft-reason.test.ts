import { describe, expect, it } from 'vitest';
import {
  buildPropertyDraftReason,
  buildVisitDraftReason,
} from '@/domains/inspection/components/register/build-draft-reason';
import type { IncompleteSummary } from '@/domains/inspection/types';

function summary(
  overrides: Partial<IncompleteSummary> = {}
): IncompleteSummary {
  return {
    unansweredRequiredCount: 0,
    unansweredRequiredQuestions: [],
    missingFields: [],
    draftPropertyCount: 0,
    visitMissingFields: [],
    draftVisitCount: 0,
    ...overrides,
  };
}

describe('buildPropertyDraftReason', () => {
  it('lists missing scalar fields', () => {
    expect(
      buildPropertyDraftReason(summary({ missingFields: ['interestLevel'] }))
    ).toBe('관심도');
  });

  it('names unanswered required questions, matching the design mock', () => {
    const reason = buildPropertyDraftReason(
      summary({
        unansweredRequiredCount: 2,
        unansweredRequiredQuestions: [
          { questionId: 'q1', question: '관리비 수준', sortOrder: 1 },
          { questionId: 'q2', question: '주차 대수', sortOrder: 2 },
        ],
      })
    );

    expect(reason).toBe('필수 문답 2개 남음 — 관리비 수준, 주차 대수');
  });

  it('combines missing fields and unanswered questions', () => {
    const reason = buildPropertyDraftReason(
      summary({
        missingFields: ['interestLevel'],
        unansweredRequiredCount: 5,
        unansweredRequiredQuestions: [
          { questionId: 'q1', question: 'a', sortOrder: 1 },
        ],
      })
    );

    expect(reason).toContain('관심도');
    expect(reason).toContain('필수 문답 5개');
  });

  it('returns an empty string when nothing is missing', () => {
    expect(buildPropertyDraftReason(summary())).toBe('');
  });
});

describe('buildVisitDraftReason', () => {
  it('reports missing visit-level fields', () => {
    expect(
      buildVisitDraftReason(summary({ visitMissingFields: ['revisitIntent'] }))
    ).toBe('재방문 의사 미입력');
  });

  it('reports draft property count', () => {
    expect(buildVisitDraftReason(summary({ draftPropertyCount: 3 }))).toBe(
      '매물 3건 작성 중'
    );
  });
});
