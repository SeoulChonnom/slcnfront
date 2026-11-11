import { describe, expect, it } from 'vitest';
import { getVisitPhase } from '@/domains/inspection/utils/visit-phase';

describe('getVisitPhase', () => {
  it('is COMPLETED whenever status is COMPLETED', () => {
    expect(
      getVisitPhase({ status: 'COMPLETED', completedAt: '2026-09-17T18:30' })
    ).toBe('COMPLETED');
    expect(getVisitPhase({ status: 'COMPLETED', completedAt: null })).toBe(
      'COMPLETED'
    );
  });

  it('is PLANNED for a DRAFT that was never completed', () => {
    expect(getVisitPhase({ status: 'DRAFT', completedAt: null })).toBe(
      'PLANNED'
    );
  });

  it('is REVISING for a DRAFT with completedAt', () => {
    expect(
      getVisitPhase({ status: 'DRAFT', completedAt: '2026-09-23T09:28:52' })
    ).toBe('REVISING');
  });
});
