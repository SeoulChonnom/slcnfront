import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils/cn';

type MobileTopBarProps = {
  title?: string;
  className?: string;
  backHref?: string;
};

export function MobileTopBar({
  title = 'SLCN',
  className,
  backHref,
}: MobileTopBarProps) {
  return (
    <header className={cn('slcn-mobile-topbar pink-mesh', className)}>
      <div className="slcn-mobile-topbar__inner">
        {backHref ? (
          <Link
            to={backHref}
            aria-label="이전 화면으로 이동"
            className="slcn-mobile-topbar__leading"
          >
            ←
          </Link>
        ) : (
          <span className="slcn-mobile-topbar__leading" aria-hidden="true" />
        )}
        <div className="slcn-mobile-topbar__title">
          <p className="slcn-mobile-topbar__title-text display-hand">{title}</p>
        </div>
        <button
          type="button"
          aria-label="더 보기"
          className="slcn-mobile-topbar__trailing"
        >
          …
        </button>
      </div>
    </header>
  );
}
