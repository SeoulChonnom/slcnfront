import type { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { MobileTopBar } from '../../components/layout/MobileTopBar';
import { cn } from '../../lib/utils/cn';

type MainMobileShellProps = PropsWithChildren<{
  className?: string;
}>;

export function MainMobileShell({ children, className }: MainMobileShellProps) {
  return (
    <div className={cn('slcn-shell-mobile pink-mesh', className)}>
      <MobileTopBar title="SEOUL CHONNOM" />
      <main className="slcn-shell-mobile__main">{children ?? <Outlet />}</main>
      <MobileBottomNav device="mobile" />
      <div className="slcn-shell-mobile__bottom-spacer" aria-hidden="true" />
    </div>
  );
}
