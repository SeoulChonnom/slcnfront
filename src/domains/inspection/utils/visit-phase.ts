import type { InspectionStatus } from '@/domains/inspection/types';

export type VisitPhase = 'PLANNED' | 'REVISING' | 'COMPLETED';

/**
 * 05-fe-handoff §4.1: `completedAt` latches on first completion and is never
 * cleared, so `DRAFT` + `completedAt` means "was completed, now being edited".
 */
export function getVisitPhase({
  status,
  completedAt,
}: {
  status: InspectionStatus;
  completedAt: string | null;
}): VisitPhase {
  if (status === 'COMPLETED') return 'COMPLETED';
  if (completedAt == null) return 'PLANNED';
  return 'REVISING';
}
