import type { DeviceType } from '../../app/router/route-constants';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils/cn';
import { getPrimaryNavigationItems } from './navigation-items';

export type MobileNavItem = {
  label: string;
  to: string;
  icon: string;
  external?: boolean;
  end?: boolean;
};

type MobileBottomNavProps = {
  items?: MobileNavItem[];
  className?: string;
  device?: DeviceType;
};

const iconByLabel: Record<string, string> = {
  메인: '⌂',
  나들이: '⌖',
  달력: '☷',
  신발: '⌁',
  필름: '◫',
};

export function MobileBottomNav({
  items,
  className,
  device = 'mobile',
}: MobileBottomNavProps) {
  const navigationItems =
    items ??
    getPrimaryNavigationItems(device).map((item) => ({
      ...item,
      icon: iconByLabel[item.label] ?? '•',
    }));

  return (
    <nav
      aria-label="모바일 하단 내비게이션"
      className={cn('slcn-mobile-bottom-nav pink-mesh', className)}
    >
      <ul className="slcn-mobile-bottom-nav__list">
        {navigationItems.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a
                href={item.to}
                target="_blank"
                rel="noreferrer"
                className="slcn-mobile-bottom-nav__link"
              >
                <span
                  aria-hidden="true"
                  className="slcn-mobile-bottom-nav__icon"
                >
                  {item.icon}
                </span>
                <span className="slcn-mobile-bottom-nav__label">
                  {item.label}
                </span>
              </a>
            ) : (
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'slcn-mobile-bottom-nav__link',
                    isActive && 'slcn-mobile-bottom-nav__link--active',
                  )
                }
              >
                <>
                  <span
                    aria-hidden="true"
                    className="slcn-mobile-bottom-nav__icon"
                  >
                    {item.icon}
                  </span>
                  <span className="slcn-mobile-bottom-nav__label">
                    {item.label}
                  </span>
                </>
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
