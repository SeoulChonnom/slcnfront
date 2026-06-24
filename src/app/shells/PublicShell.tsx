import type { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils/cn';

type PublicShellProps = PropsWithChildren<{
  className?: string;
}>;

export function PublicShell({ children, className }: PublicShellProps) {
  return (
    <div className={cn('slcn-shell-public', className)}>
      <main className='slcn-shell-public__main'>
        <div className='slcn-shell-public__inner'>{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}
