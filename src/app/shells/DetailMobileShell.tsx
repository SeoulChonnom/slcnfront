import type { PropsWithChildren } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import {
  buildDeviceProfilePath,
  buildDeviceRootPath,
  buildDeviceTripListPath,
} from '@/lib/routing/route-builders';
import { cn } from '@/lib/utils/cn';

type DetailMobileShellProps = PropsWithChildren<{
  className?: string;
  title?: string;
}>;

function getDetailMobileTitle(pathname: string) {
  if (pathname.startsWith('/mobile/profile/edit')) {
    return '사용자 정보 수정';
  }

  if (pathname.startsWith('/mobile/profile/verify')) {
    return '본인 확인';
  }

  if (pathname.startsWith('/mobile/profile')) {
    return '마이페이지';
  }

  if (pathname.startsWith('/mobile/map/register')) {
    return '기록하기';
  }

  if (pathname.startsWith('/mobile/map/')) {
    return '나들이 경로';
  }

  if (pathname.startsWith('/mobile/')) {
    return '신발 상세';
  }

  return 'DETAIL';
}

function getDetailMobileBackHref(pathname: string) {
  if (
    pathname.startsWith('/mobile/profile/verify') ||
    pathname.startsWith('/mobile/profile/edit')
  ) {
    return buildDeviceProfilePath('mobile');
  }

  /* Register is entered from the trip list and returns to it on save, so
     the back arrow has to land there too rather than on the mobile home. */
  if (pathname.startsWith('/mobile/map/register')) {
    return buildDeviceTripListPath('mobile');
  }

  return buildDeviceRootPath('mobile');
}

export function DetailMobileShell({
  children,
  className,
  title = 'DETAIL',
}: DetailMobileShellProps) {
  const { pathname } = useLocation();
  const resolvedTitle =
    title === 'DETAIL' ? getDetailMobileTitle(pathname) : title;
  const isProfileRoute = pathname.startsWith('/mobile/profile');

  return (
    <div className={cn('slcn-shell-detail-mobile', className)}>
      <MobileTopBar
        title={resolvedTitle}
        backHref={getDetailMobileBackHref(pathname)}
      />
      <main
        className={cn(
          'slcn-shell-detail-mobile__main',
          isProfileRoute && 'slcn-shell-detail-mobile__main--profile'
        )}
      >
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
