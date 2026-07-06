import { NavLink } from 'react-router-dom';
import type { DeviceType } from '../../app/router/route-constants';
import { cn } from '../../lib/utils/cn';
import { getMobileNavigationItems } from './navigation-items';

type MobileBottomNavProps = {
  className?: string;
  device?: DeviceType;
};

function NavIcon({ label }: { label: string }) {
  if (label === '홈') {
    return (
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.9'
        aria-hidden='true'
      >
        <path d='M4 10.5L12 4l8 6.5' />
        <path d='M6 9.5V20h12V9.5' />
      </svg>
    );
  }
  if (label === '기록') {
    return (
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.9'
        aria-hidden='true'
      >
        <path d='M12 21s-7-5.3-7-11a7 7 0 0114 0c0 5.7-7 11-7 11z' />
        <circle cx='12' cy='10' r='2.2' />
      </svg>
    );
  }
  if (label === '여행') {
    return (
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.9'
        aria-hidden='true'
      >
        <polygon points='1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6' />
        <line x1='8' y1='2' x2='8' y2='18' />
        <line x1='16' y1='6' x2='16' y2='22' />
      </svg>
    );
  }
  if (label === '달력') {
    return (
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.9'
        aria-hidden='true'
      >
        <rect x='4' y='5' width='16' height='15' rx='2.5' />
        <path d='M4 9h16M8 3v4M16 3v4' />
      </svg>
    );
  }
  if (label === '신발') {
    return (
      <svg
        width='22'
        height='22'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.9'
        aria-hidden='true'
      >
        <path d='M3 16h16a2 2 0 002-2c0-1-1-1.6-2.5-2.2L13 9l-2-3H6v8l-3 2z' />
        <path d='M3 16v2h18' />
      </svg>
    );
  }
  return null;
}

export function MobileBottomNav({
  className,
  device = 'mobile',
}: MobileBottomNavProps) {
  const navigationItems = getMobileNavigationItems(device);

  return (
    <nav
      aria-label='모바일 하단 내비게이션'
      className={cn('slcn-mobile-bottom-nav', className)}
    >
      <ul className='slcn-mobile-bottom-nav__list'>
        {navigationItems.map((item) => (
          <li key={item.label}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'slcn-mobile-bottom-nav__link',
                  isActive && 'slcn-mobile-bottom-nav__link--active'
                )
              }
            >
              <span className='slcn-mobile-bottom-nav__icon'>
                <NavIcon label={item.label} />
              </span>
              <span className='slcn-mobile-bottom-nav__label'>
                {item.label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
