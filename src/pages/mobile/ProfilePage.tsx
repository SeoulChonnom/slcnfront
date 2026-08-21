import { useNavigate } from 'react-router-dom';
import { ThemeChoice } from '../../components/ui/ThemeChoice';
import { useLogout } from '../../domains/auth/hooks/useLogout';
import { useAuthStore } from '../../domains/auth/store/auth-store';
import { ProfileAvatar } from '../../domains/profile/components/ProfileAvatar';
import { useProfile } from '../../domains/profile/hooks/useProfile';
import { useProfileImageUrl } from '../../domains/profile/hooks/useProfileImageUrl';
import { revokeProfileEditAccess } from '../../domains/profile/utils/profile-verification';
import {
  buildDeviceLoginPath,
  buildDeviceProfileVerifyPath,
} from '../../lib/routing/route-builders';

function ProfileMenuIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <circle cx='12' cy='8' r='3.4' />
      <path d='M5.5 20c0-3.4 2.9-5.6 6.5-5.6M15.5 18.5l4-4a1.4 1.4 0 00-2-2l-4 4-.4 2.4z' />
    </svg>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const profile = useProfile();
  const fallbackName = useAuthStore((state) => state.userInfo?.name ?? '');
  const logoutMutation = useLogout();
  const { profileImageUrl, isLoading: isProfileImageLoading } =
    useProfileImageUrl(profile.data?.profileImage ?? null);
  const displayName = profile.data?.name ?? fallbackName;

  async function handleLogout() {
    revokeProfileEditAccess();

    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Local logout is completed in useLogout even when the request fails.
    } finally {
      navigate(buildDeviceLoginPath('mobile'), { replace: true });
    }
  }

  return (
    <div className='slcn-mobile-profile-page'>
      <section className='slcn-mobile-profile-card'>
        <ProfileAvatar
          imageUrl={profileImageUrl}
          loading={profile.isLoading || isProfileImageLoading}
          alt={profileImageUrl ? `${displayName} 프로필` : ''}
          size={60}
        />
        <div>
          <h1>{displayName}</h1>
          <p>로그인 계정</p>
        </div>
      </section>

      <p className='slcn-mobile-profile-page__section-label'>계정</p>
      <button
        type='button'
        className='slcn-mobile-profile-page__edit'
        onClick={() => {
          revokeProfileEditAccess();
          navigate(buildDeviceProfileVerifyPath('mobile'));
        }}
      >
        <span className='slcn-mobile-profile-page__edit-icon'>
          <ProfileMenuIcon />
        </span>
        <span>사용자 정보 수정</span>
        <svg
          className='slcn-mobile-profile-page__chevron'
          viewBox='0 0 24 24'
          aria-hidden='true'
        >
          <path d='M9 6l6 6-6 6' />
        </svg>
      </button>

      <p className='slcn-mobile-profile-page__section-label'>화면</p>
      <ThemeChoice className='slcn-mobile-profile-page__theme' />

      <button
        type='button'
        className='slcn-mobile-profile-page__logout'
        disabled={logoutMutation.isPending}
        onClick={() => void handleLogout()}
      >
        <svg viewBox='0 0 24 24' aria-hidden='true'>
          <path d='M15 17l5-5-5-5M20 12H9M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h5' />
        </svg>
        {logoutMutation.isPending ? '로그아웃 중…' : '로그아웃'}
      </button>
    </div>
  );
}
