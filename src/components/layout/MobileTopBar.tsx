import type { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/SLCN.png';
import { cn } from '../../lib/utils/cn';

type MobileTopBarProps = {
  title?: string;
  className?: string;
  backHref?: string;
  onBackClick?: MouseEventHandler<HTMLAnchorElement>;
  trailing?: ReactNode;
};

export function MobileTopBar({
  title = 'SLCN',
  className,
  backHref,
  onBackClick,
  trailing,
}: MobileTopBarProps) {
  return (
    <header className={cn('slcn-mobile-topbar pink-mesh', className)}>
      <div className='slcn-mobile-topbar__inner'>
        {backHref ? (
          <Link
            to={backHref}
            aria-label='이전 화면으로 이동'
            className='slcn-mobile-topbar__leading'
            onClick={onBackClick}
          >
            <svg viewBox='0 0 24 24' aria-hidden='true'>
              <path d='M15 5l-7 7 7 7' />
            </svg>
          </Link>
        ) : (
          <span className='slcn-mobile-topbar__leading'>
            <img
              src={logo}
              alt='Seoul Chonnom'
              className='slcn-mobile-topbar__logo'
            />
          </span>
        )}
        <div className='slcn-mobile-topbar__title'>
          <p className='slcn-mobile-topbar__title-text'>{title}</p>
        </div>
        {trailing ? (
          <div className='slcn-mobile-topbar__trailing'>{trailing}</div>
        ) : (
          <span className='slcn-mobile-topbar__trailing' aria-hidden='true' />
        )}
      </div>
    </header>
  );
}
