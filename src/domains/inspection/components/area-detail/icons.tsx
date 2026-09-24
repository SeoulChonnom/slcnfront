import type { ReactNode } from 'react';

/**
 * Inline SVG icons scoped to the area-detail screen, redrawn in the same
 * style as the prototype's sprite defs
 * (`docs/field_research/design/prototype.html` `#i-chev`/`#i-plus`/`#i-pro`/
 * `#i-con`/`#i-up`/`#i-down`/`#i-photo`) so this tree does not depend on the
 * prototype file at runtime. All are `aria-hidden` — meaning is always
 * carried by adjacent text per screen_design.md §8.
 */

type IconProps = {
  className?: string;
};

function BaseIcon({
  className,
  children,
  strokeWidth = '1.6',
}: IconProps & { children: ReactNode; strokeWidth?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      {children}
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d='M9 5l7 7-7 7' />
    </BaseIcon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.8'>
      <path d='M12 5v14' />
      <path d='M5 12h14' />
    </BaseIcon>
  );
}

export function ProIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.8'>
      <path d='M12 5v14' />
      <path d='M5 12h14' />
    </BaseIcon>
  );
}

export function ConIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.8'>
      <path d='M5 12h14' />
    </BaseIcon>
  );
}

export function UpIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.8'>
      <path d='M12 19V6' />
      <path d='M6.5 11.5L12 6l5.5 5.5' />
    </BaseIcon>
  );
}

export function DownIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.8'>
      <path d='M12 5v13' />
      <path d='M6.5 12.5L12 18l5.5-5.5' />
    </BaseIcon>
  );
}

export function PhotoIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x='3' y='5' width='18' height='14' rx='2' />
      <circle cx='9' cy='11' r='1.6' />
      <path d='M21 16.5 16 11l-9 8' />
    </BaseIcon>
  );
}
