import { cn } from '@/lib/utils/cn';

type TagChipsProps = {
  tags: string[];
  /**
   * Default 3 — fe_implementation_decisions.md §4 corrects screen_design.md's
   * "상위 3개" to "3개": tag order is alphabetical from the server, not
   * insertion order, so there is no "top" to claim.
   */
  max?: number;
  className?: string;
};

export function TagChips({ tags, max = 3, className }: TagChipsProps) {
  const visible = tags.slice(0, max);
  const overflow = tags.length - visible.length;

  if (visible.length === 0) {
    return null;
  }

  return (
    <span className={cn('slcn-inspection-tag-chips', className)}>
      {visible.map((tag) => (
        // The server normalises the stored name without a '#', and the design
        // shows one on every chip. Prefixing here keeps the filter value the
        // server expects (an exact, case-sensitive match) out of the display.
        <span key={tag} className='slcn-inspection-tag-chip'>
          #{tag}
        </span>
      ))}
      {overflow > 0 ? (
        <span className='slcn-inspection-tag-chip slcn-inspection-tag-chip--more'>
          +{overflow}
        </span>
      ) : null}
    </span>
  );
}
