import type { ReactNode } from 'react';

/**
 * Inline SVG icons scoped to the property-detail screen, redrawn from the
 * prototype's sprite defs (`docs/field_research/design/prototype.html`
 * `#i-link`/`#i-up`/`#i-down`/`#i-same`/`#i-chev`/`#i-pro`/`#i-con`/`#i-info`/
 * `#i-yes`/`#i-no`) so this component tree does not depend on the prototype
 * file at runtime. All are `aria-hidden` — meaning is always carried by
 * adjacent text per screen_design.md §8.
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

export function LinkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d='M10 13.5a4 4 0 006 .5l2.5-2.5a4 4 0 00-5.6-5.6L11.6 7' />
      <path d='M14 10.5a4 4 0 00-6-.5L5.5 12.5a4 4 0 005.6 5.6L12.4 17' />
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

export function SameIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.8'>
      <path d='M6 12h12' />
    </BaseIcon>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d='M9 5l7 7-7 7' />
    </BaseIcon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.7'>
      <circle cx='12' cy='12' r='8.5' />
      <path d='M12 11.2v5' />
      <circle cx='12' cy='8' r='0.9' fill='currentColor' stroke='none' />
    </BaseIcon>
  );
}

export function WarnIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.7'>
      <path d='M12 4.5l8.5 15h-17z' />
      <path d='M12 10v4' />
      <circle cx='12' cy='16.8' r='0.9' fill='currentColor' stroke='none' />
    </BaseIcon>
  );
}

export function YesIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.7'>
      <circle cx='12' cy='12' r='8.5' />
      <path d='M8.5 12.2l2.4 2.4 4.6-5' />
    </BaseIcon>
  );
}

export function NoIcon(props: IconProps) {
  return (
    <BaseIcon {...props} strokeWidth='1.7'>
      <circle cx='12' cy='12' r='8.5' />
      <path d='M8.6 15.4l6.8-6.8' />
    </BaseIcon>
  );
}
