import type { ReactElement } from 'react';
import type { PlaceCategory } from '../types';

type CategoryIconProps = {
  category: PlaceCategory;
  className?: string;
};

const ICON_PATHS: Record<PlaceCategory, ReactElement> = {
  TOURIST_SPOT: (
    <>
      <path d='M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z' />
      <circle cx='12' cy='10' r='2.5' />
    </>
  ),
  RESTAURANT: (
    <>
      <path d='M5 3v8a2 2 0 0 0 2 2v8M5 7h4M9 3v18M16 3c-1.5 1.5-2 3.5-2 6s.5 3 2 3v9' />
    </>
  ),
  CAFE: (
    <>
      <path d='M4 8h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z' />
      <path d='M17 9h2.5a2 2 0 0 1 0 4H17' />
      <path d='M7 3v2M11 3v2' />
    </>
  ),
  ACCOMMODATION: (
    <>
      <path d='M3 18v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6' />
      <path d='M3 14h18M3 18v2M21 18v2' />
      <path d='M7 9V7a2 2 0 0 1 2-2h2' />
    </>
  ),
  SHOPPING: (
    <>
      <path d='M6 8h12l-1 12H7L6 8Z' />
      <path d='M9 8V6a3 3 0 0 1 6 0v2' />
    </>
  ),
  TRANSPORT: (
    <>
      <rect x='5' y='4' width='14' height='13' rx='2' />
      <path d='M5 11h14M8 4v7M16 4v7' />
      <circle cx='8' cy='19' r='1.4' />
      <circle cx='16' cy='19' r='1.4' />
    </>
  ),
  ACTIVITY: (
    <>
      <path d='m12 3 2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7L6.9 21.6l1-5.6-4.1-4 5.7-.8L12 3Z' />
    </>
  ),
  ETC: (
    <>
      <circle cx='5' cy='12' r='1.4' />
      <circle cx='12' cy='12' r='1.4' />
      <circle cx='19' cy='12' r='1.4' />
    </>
  ),
};

export function CategoryIcon({ category, className }: CategoryIconProps) {
  return (
    <svg
      className={className}
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.7'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      {ICON_PATHS[category]}
    </svg>
  );
}
