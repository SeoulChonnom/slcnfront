import type { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { MobileTopBar } from '../../components/layout/MobileTopBar';
import { useAuthStore } from '../../domains/auth/store/auth-store';
import { cn } from '../../lib/utils/cn';

type MainMobileShellProps = PropsWithChildren<{
  className?: string;
}>;

function getMainMobileTitle(pathname: string) {
  if (pathname.startsWith('/mobile/calendar')) {
    return '나들이 일정';
  }

  if (pathname.startsWith('/mobile/map')) {
    return '나들이 기록';
  }

  if (pathname.startsWith('/mobile/shoesRecom')) {
    return '신발 추천';
  }

  return '서울 촌놈';
}

export function MainMobileShell({ children, className }: MainMobileShellProps) {
  const { pathname } = useLocation();
  const userInfo = useAuthStore((s) => s.userInfo);
  const avatar = userInfo?.roleList.includes('admin') ? '관' : '촌';

  return (
    <div className={cn('slcn-shell-mobile pink-mesh', className)}>
      <MobileTopBar title={getMainMobileTitle(pathname)} avatar={avatar} />
      <main className='slcn-shell-mobile__main'>{children ?? <Outlet />}</main>
      <MobileBottomNav device='mobile' />
      <div className='slcn-shell-mobile__bottom-spacer' aria-hidden='true' />
    </div>
  );
}
