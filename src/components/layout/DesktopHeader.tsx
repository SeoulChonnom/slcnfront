import type { DeviceType } from '../../app/router/route-constants';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils/cn';
import { buildDeviceRootPath } from '../../lib/routing/route-builders';
import { SLCNLogoBlob } from '../ui/SLCNLogoBlob';
import { getPrimaryNavigationItems } from './navigation-items';

type DesktopHeaderProps = {
  className?: string;
  device?: DeviceType;
};

export function DesktopHeader({
  className,
  device = 'main',
}: DesktopHeaderProps) {
  const navigationItems = getPrimaryNavigationItems(device);

  return (
    <header className={cn('slcn-desktop-header pink-mesh', className)}>
      <div className="slcn-desktop-header__inner">
        <Link
          to={buildDeviceRootPath(device)}
          className="slcn-desktop-header__home"
          aria-label="SLCN 홈으로 이동"
        >
          <SLCNLogoBlob size="sm" />
        </Link>

        <nav aria-label="주요 메뉴">
          <ul className="slcn-desktop-header__nav-list">
            {navigationItems.map((item) => {
              return (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.to}
                      target="_blank"
                      rel="noreferrer"
                      className="slcn-desktop-header__nav-link"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'slcn-desktop-header__nav-link',
                          isActive && 'slcn-desktop-header__nav-link--active',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          aria-label="사용자 메뉴"
          className="slcn-desktop-header__profile"
        >
          <span className="sr-only">프로필</span>
        </button>
      </div>
    </header>
  );
}
