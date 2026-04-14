import type { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { buildDeviceRootPath } from '../../lib/routing/route-builders';
import { cn } from '../../lib/utils/cn';
import { MobileTopBar } from '../../components/layout/MobileTopBar';

type DetailMobileShellProps = PropsWithChildren<{
  className?: string;
  title?: string;
}>;

export function DetailMobileShell({
  children,
  className,
  title = 'DETAIL',
}: DetailMobileShellProps) {
  return (
    <div className={cn('slcn-shell-detail-mobile pink-mesh', className)}>
      <MobileTopBar title={title} backHref={buildDeviceRootPath('mobile')} />
      <main className="slcn-shell-detail-mobile__main">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
