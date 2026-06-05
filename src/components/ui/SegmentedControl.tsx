import { cn } from '../../lib/utils/cn';

type SegmentOption = {
  label: string;
  value: string;
};

type SegmentedControlProps = {
  value: string;
  options: SegmentOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function SegmentedControl({
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div className={cn('slcn-segmented-control', className)} role='tablist'>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type='button'
            role='tab'
            aria-selected={active}
            className='slcn-segmented-control__button display-hand'
            data-active={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
