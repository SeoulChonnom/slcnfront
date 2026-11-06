import { describe, expect, it } from 'vitest';
import {
  formatPlannedVisit,
  formatPlannedVisitMetaline,
} from '@/domains/inspection/components/area-list/format-area-row';
import type { InspectionArea } from '@/domains/inspection/types';

// 로컬 시간 2026-10-12 15:30 — 예정일과 같은 날이면 시각이 지났어도 "예정".
const today = new Date(2026, 9, 12, 15, 30);

function planned(visitedAt: string) {
  return { visitId: 'visit-1', visitedAt };
}

describe('formatPlannedVisit', () => {
  it('labels a future planned date as 예정', () => {
    expect(formatPlannedVisit(planned('2026-10-13T09:00'), today)).toBe(
      '예정 10.13'
    );
  });

  it('keeps today as 예정 even when the planned time has passed', () => {
    expect(formatPlannedVisit(planned('2026-10-12T09:00'), today)).toBe(
      '예정 10.12'
    );
    expect(formatPlannedVisit(planned('2026-10-12T23:59'), today)).toBe(
      '예정 10.12'
    );
  });

  it('labels yesterday and earlier as 미완료', () => {
    expect(formatPlannedVisit(planned('2026-10-11T23:59'), today)).toBe(
      '미완료 10.11'
    );
    expect(formatPlannedVisit(planned('2026-10-05T14:00'), today)).toBe(
      '미완료 10.05'
    );
  });

  it('compares across month and year boundaries', () => {
    expect(
      formatPlannedVisit(planned('2026-09-30T10:00'), new Date(2026, 9, 1))
    ).toBe('미완료 09.30');
    expect(
      formatPlannedVisit(planned('2027-01-02T10:00'), new Date(2026, 11, 31))
    ).toBe('예정 01.02');
  });

  it('accepts a visitedAt with seconds', () => {
    expect(formatPlannedVisit(planned('2026-10-12T14:00:00'), today)).toBe(
      '예정 10.12'
    );
  });
});

describe('formatPlannedVisitMetaline', () => {
  function area(
    plannedVisit: InspectionArea['plannedVisit'],
    plannedVisitCount: number
  ) {
    return {
      plannedVisit,
      incompleteSummary: { plannedVisitCount },
    } as InspectionArea;
  }

  it('is null without a planned visit', () => {
    expect(formatPlannedVisitMetaline(area(null, 0), today)).toBeNull();
  });

  it('shows a single plan as-is', () => {
    expect(
      formatPlannedVisitMetaline(area(planned('2026-10-12T14:00'), 1), today)
    ).toBe('예정 10.12');
  });

  it('appends 외 N건 for the remaining plans', () => {
    expect(
      formatPlannedVisitMetaline(area(planned('2026-10-05T14:00'), 3), today)
    ).toBe('미완료 10.05 외 2건');
  });
});
