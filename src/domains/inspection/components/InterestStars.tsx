import {
  formatInterestAriaLabel,
  INTEREST_LEVEL_EMPTY_LABEL,
  MAX_INTEREST_LEVEL,
} from '@/domains/inspection/utils/inspection-format';
import { cn } from '@/lib/utils/cn';

/**
 * A single drawn star (screen_design.md §4.2 forbids the unicode `★`
 * glyph). `filled` toggles the CSS class that colors it
 * `--color-accent-muted`; unfilled stars stay outline-only.
 */
function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      className={cn(
        'slcn-inspection-star',
        filled && 'slcn-inspection-star--filled'
      )}
      width='16'
      height='16'
      viewBox='0 0 24 24'
      aria-hidden='true'
    >
      <path
        d='M12 2.5l2.9 6.1 6.6.7-4.9 4.5 1.3 6.6-5.9-3.4-5.9 3.4 1.3-6.6-4.9-4.5 6.6-.7L12 2.5Z'
        fill={filled ? 'currentColor' : 'none'}
        stroke='currentColor'
        strokeWidth='1.4'
        strokeLinejoin='round'
      />
    </svg>
  );
}

type InterestStarsProps = {
  /** `null` renders the "관심도 미입력" fallback instead of stars. */
  level: number | null;
  max?: number;
  className?: string;
};

/**
 * Display-only interest rating. Always renders the numeric level next to the
 * stars (screen_design.md §4.2: "항상 숫자를 옆에 둔다") and carries the
 * accessible label as a single `aria-label` rather than relying on the
 * decorative stars.
 */
export function InterestStars({
  level,
  max = MAX_INTEREST_LEVEL,
  className,
}: InterestStarsProps) {
  if (level === null) {
    return (
      <span className={cn('slcn-inspection-interest-stars--empty', className)}>
        {INTEREST_LEVEL_EMPTY_LABEL}
      </span>
    );
  }

  return (
    <span
      className={cn('slcn-inspection-interest-stars', className)}
      role='img'
      aria-label={formatInterestAriaLabel(level)}
    >
      <span
        className='slcn-inspection-interest-stars__icons'
        aria-hidden='true'
      >
        {Array.from({ length: max }, (_, index) => (
          <Star key={`star-${index + 1}`} filled={index < level} />
        ))}
      </span>
      <span
        className='slcn-inspection-interest-stars__value'
        aria-hidden='true'
      >
        {level}
      </span>
    </span>
  );
}

type InterestStarsInputProps = {
  value: number | null;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
};

/**
 * Input variant — 44×44 touch targets in a `radiogroup`
 * (screen_design.md §4.2).
 */
export function InterestStarsInput({
  value,
  onChange,
  max = MAX_INTEREST_LEVEL,
  className,
  name,
}: InterestStarsInputProps & { name?: string }) {
  const groupName = name ?? 'inspection-interest-level';

  return (
    <span
      className={cn('slcn-inspection-interest-input', className)}
      role='radiogroup'
      aria-label={`관심도 ${max}점 만점`}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isSelected = value === starValue;

        return (
          <label
            key={`interest-input-${starValue}`}
            className='slcn-inspection-interest-input__star'
          >
            <input
              type='radio'
              className='slcn-visually-hidden'
              name={groupName}
              checked={isSelected}
              aria-label={formatInterestAriaLabel(starValue)}
              onChange={() => onChange(starValue)}
            />
            <Star filled={value !== null && starValue <= value} />
          </label>
        );
      })}
      <span
        className='slcn-inspection-interest-input__value'
        aria-hidden='true'
      >
        {value ?? INTEREST_LEVEL_EMPTY_LABEL}
      </span>
    </span>
  );
}
