import type { VisitPhase } from '@/domains/inspection/utils/visit-phase';
import { cn } from '@/lib/utils/cn';

type VisitPhaseBadgeProps = {
  phase: VisitPhase;
  className?: string;
};

/**
 * Visit-level badge: "계획" (never completed) or "수정 중" (completed once,
 * now reopened). `COMPLETED` gets no badge. Property-level badges stay on
 * {@link DraftBadge}.
 */
export function VisitPhaseBadge({ phase, className }: VisitPhaseBadgeProps) {
  if (phase === 'COMPLETED') return null;

  return (
    <span
      className={cn(
        'slcn-inspection-draft-badge',
        phase === 'PLANNED' && 'slcn-inspection-draft-badge--planned',
        className
      )}
    >
      {phase === 'PLANNED' ? '계획' : '수정 중'}
    </span>
  );
}
