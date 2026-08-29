import type { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils/cn';

type MainDesktopShellProps = PropsWithChildren<{
  className?: string;
}>;

export function MainDesktopShell({
  children,
  className,
}: MainDesktopShellProps) {
  const { pathname } = useLocation();

  return (
    <div className={cn('slcn-shell-desktop', className)}>
      <DesktopHeader device='main' />
      <main className='slcn-shell-desktop__main'>{children ?? <Outlet />}</main>
      <Footer showFilmLink={pathname !== '/main'} />
    </div>
  );
}
