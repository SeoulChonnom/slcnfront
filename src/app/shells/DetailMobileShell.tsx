import type { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileTopBar } from '../../components/layout/MobileTopBar';
import { buildDeviceRootPath } from '../../lib/routing/route-builders';
import { cn } from '../../lib/utils/cn';

type DetailMobileShellProps = PropsWithChildren<{
  className?: string;
  title?: string;
}>;

function getDetailMobileTitle(pathname: string) {
  if (pathname.startsWith('/mobile/map/register')) {
    return '서울 촌놈 나들이 추가';
  }

  if (pathname.startsWith('/mobile/map/')) {
    return '서울 촌놈 나들이 경로 😎';
  }

  if (pathname.startsWith('/mobile/')) {
    return "서울 촌놈's 신발 추천 👟";
  }

  return 'DETAIL';
}

export function DetailMobileShell({
  children,
  className,
  title = 'DETAIL',
}: DetailMobileShellProps) {
  const { pathname } = useLocation();
  const resolvedTitle =
    title === 'DETAIL' ? getDetailMobileTitle(pathname) : title;

  return (
    <div className={cn('slcn-shell-detail-mobile pink-mesh', className)}>
      <MobileTopBar
        title={resolvedTitle}
        backHref={buildDeviceRootPath('mobile')}
      />
      <main className='slcn-shell-detail-mobile__main'>
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
