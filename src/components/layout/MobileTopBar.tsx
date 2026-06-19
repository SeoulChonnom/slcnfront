import { Link } from 'react-router-dom';
import logo from '../../assets/img/SLCN.png';
import { cn } from '../../lib/utils/cn';

type MobileTopBarProps = {
  title?: string;
  className?: string;
  backHref?: string;
  avatar?: string;
};

export function MobileTopBar({
  title = 'SLCN',
  className,
  backHref,
  avatar,
}: MobileTopBarProps) {
  return (
    <header className={cn('slcn-mobile-topbar pink-mesh', className)}>
      <div className='slcn-mobile-topbar__inner'>
        {backHref ? (
          <Link
            to={backHref}
            aria-label='이전 화면으로 이동'
            className='slcn-mobile-topbar__leading'
          >
            ←
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
          <p className='slcn-mobile-topbar__title-text display-hand'>{title}</p>
        </div>
        {avatar ? (
          <span className='slcn-mobile-topbar__avatar' aria-hidden='true'>
            {avatar}
          </span>
        ) : (
          <span className='slcn-mobile-topbar__trailing' aria-hidden='true' />
        )}
      </div>
    </header>
  );
}
