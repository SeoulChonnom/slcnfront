import type { PropsWithChildren } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { ProfileAvatar } from '@/domains/profile/components/ProfileAvatar';
import { useProfile } from '@/domains/profile/hooks/useProfile';
import { buildOptionalAssetImageUrl } from '@/lib/api/asset-url';
import { buildDeviceProfilePath } from '@/lib/routing/route-builders';
import { cn } from '@/lib/utils/cn';

type MainMobileShellProps = PropsWithChildren<{
  className?: string;
}>;

function getMainMobileTitle(pathname: string) {
  if (pathname.startsWith('/mobile/calendar')) {
    return '서울 촌놈 달력';
  }

  if (pathname.startsWith('/mobile/travel/')) {
    return '여행 상세';
  }

  if (pathname.startsWith('/mobile/travel')) {
    return '여행 기록';
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
  const profile = useProfile();
  const profileImageUrl = buildOptionalAssetImageUrl(
    profile.data?.profileImage?.fileId,
    'home-thumb'
  );

  return (
    <div className={cn('slcn-shell-mobile', className)}>
      <MobileTopBar
        title={getMainMobileTitle(pathname)}
        trailing={
          <Link
            to={buildDeviceProfilePath('mobile')}
            className='slcn-mobile-topbar__profile-link'
            aria-label='내 프로필'
          >
            <ProfileAvatar
              imageUrl={profileImageUrl}
              loading={profile.isLoading}
              alt=''
            />
          </Link>
        }
      />
      <main className='slcn-shell-mobile__main'>{children ?? <Outlet />}</main>
      <MobileBottomNav device='mobile' />
      <div className='slcn-shell-mobile__bottom-spacer' aria-hidden='true' />
    </div>
  );
}
