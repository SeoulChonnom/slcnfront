import { cn } from '@/lib/utils/cn';

type DraftBadgeProps = {
  /** One-line reason, e.g. "필수 문답 2개 남음 — 관리비 수준, 주차 대수". Omit when there's nothing to say yet. */
  reason?: string | null;
  className?: string;
};

/**
 * `COMPLETED` gets no badge at all (screen_design.md §4.3) — callers simply
 * don't render this component for a completed record. `DRAFT` gets a
 * dashed-border, pale-gray "작성 중" badge plus an optional reason line.
 */
export function DraftBadge({ reason, className }: DraftBadgeProps) {
  return (
    <span className={cn('slcn-inspection-draft-badge-group', className)}>
      <span className='slcn-inspection-draft-badge'>작성 중</span>
      {reason ? (
        <span className='slcn-inspection-draft-badge__reason'>{reason}</span>
      ) : null}
    </span>
  );
}
