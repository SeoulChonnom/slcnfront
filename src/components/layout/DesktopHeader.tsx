import { Link, NavLink } from 'react-router-dom';
import type { DeviceType } from '../../app/router/route-constants';
import logo from '../../assets/img/SLCN.png';
import { useAuthStore } from '../../domains/auth/store/auth-store';
import { buildDeviceRootPath } from '../../lib/routing/route-builders';
import { cn } from '../../lib/utils/cn';
import { getDesktopNavigationItems } from './navigation-items';

type DesktopHeaderProps = {
  className?: string;
  device?: DeviceType;
};

export function DesktopHeader({
  className,
  device = 'main',
}: DesktopHeaderProps) {
  const navigationItems = getDesktopNavigationItems(device);
  const isAdmin = useAuthStore(
    (s) => s.userInfo?.roleList.includes('admin') ?? false
  );
  const avatar = isAdmin ? '관' : '촌';

  return (
    <header className={cn('slcn-desktop-header', className)}>
      <div className='slcn-desktop-header__inner'>
        <Link
          to={buildDeviceRootPath(device)}
          className='slcn-desktop-header__home'
          aria-label='SLCN 홈으로 이동'
        >
          <img src={logo} alt='SLCN' className='slcn-desktop-header__logo' />
          <span className='slcn-desktop-header__brand-name'>SeoulChonnom</span>
        </Link>

        <nav aria-label='주요 메뉴'>
          <ul className='slcn-desktop-header__nav-list'>
            {navigationItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'slcn-desktop-header__nav-link',
                      isActive && 'slcn-desktop-header__nav-link--active'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className='slcn-desktop-header__avatar' aria-label='사용자 메뉴'>
          {avatar}
        </div>
      </div>
    </header>
  );
}
