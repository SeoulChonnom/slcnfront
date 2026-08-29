import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import logo from '@/assets/img/SLCN.webp';
import {
  getDesktopHomeNavigationItems,
  getDesktopNavigationItems,
} from '@/components/layout/navigation-items';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { ThemeChoice } from '@/components/ui/ThemeChoice';
import { useLogout } from '@/domains/auth/hooks/useLogout';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { ProfileAvatar } from '@/domains/profile/components/ProfileAvatar';
import { ProfileEditForm } from '@/domains/profile/components/ProfileEditForm';
import { ProfileIdentityVerification } from '@/domains/profile/components/ProfileIdentityVerification';
import { useProfile } from '@/domains/profile/hooks/useProfile';
import { useProfileImageUrl } from '@/domains/profile/hooks/useProfileImageUrl';
import { revokeProfileEditAccess } from '@/domains/profile/utils/profile-verification';
import {
  buildDeviceLoginPath,
  buildDeviceRootPath,
} from '@/lib/routing/route-builders';
import { cn } from '@/lib/utils/cn';

type DesktopHeaderProps = {
  className?: string;
  device?: DeviceType;
};

type ProfileDialog = 'edit' | 'verify' | null;

function ProfileMenuIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <circle cx='12' cy='8' r='3.4' />
      <path d='M5.5 20c0-3.4 2.9-5.6 6.5-5.6M15.5 18.5l4-4a1.4 1.4 0 00-2-2l-4 4-.4 2.4z' />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <path d='M15 17l5-5-5-5M20 12H9M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h5' />
    </svg>
  );
}

export function DesktopHeader({
  className,
  device = 'main',
}: DesktopHeaderProps) {
  const popoverId = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomeSurface = location.pathname === buildDeviceRootPath(device);
  const navigationItems = isHomeSurface
    ? getDesktopHomeNavigationItems(device)
    : getDesktopNavigationItems(device);
  const fallbackUser = useAuthStore((state) => state.userInfo);
  const profile = useProfile();
  const { profileImageUrl, isLoading: isProfileImageLoading } =
    useProfileImageUrl(profile.data?.profileImage ?? null);
  const logoutMutation = useLogout();
  const profileControlRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [dialog, setDialog] = useState<ProfileDialog>(null);
  const [isEditDirty, setIsEditDirty] = useState(false);
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const displayName = profile.data?.name ?? fallbackUser?.name ?? '';

  useEffect(() => {
    setIsPopoverOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    popoverRef.current
      ?.querySelector<HTMLButtonElement>('button:not([disabled])')
      ?.focus();

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !profileControlRef.current?.contains(event.target)
      ) {
        setIsPopoverOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      setIsPopoverOpen(false);
      avatarButtonRef.current?.focus();
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isPopoverOpen]);

  function closeDialog() {
    if (dialog === 'edit' && isEditDirty) {
      setIsConfirmingClose(true);
      return;
    }

    setIsEditDirty(false);
    setDialog(null);
    setIsPopoverOpen(true);
  }

  function confirmCloseDialog() {
    setIsConfirmingClose(false);
    setIsEditDirty(false);
    setDialog(null);
    setIsPopoverOpen(true);
  }

  async function handleLogout() {
    revokeProfileEditAccess();

    try {
      await logoutMutation.mutateAsync();
    } catch {
      // A failed server logout still clears the local session in useLogout.
    } finally {
      navigate(buildDeviceLoginPath(device), { replace: true });
    }
  }

  return (
    <>
      <header className={cn('slcn-desktop-header', className)}>
        <div className='slcn-desktop-header__inner'>
          <Link
            to={buildDeviceRootPath(device)}
            className='slcn-desktop-header__home'
            aria-label='SLCN 홈으로 이동'
          >
            <img src={logo} alt='SLCN' className='slcn-desktop-header__logo' />
            <span className='slcn-desktop-header__brand-name'>서울 촌놈</span>
          </Link>

          <nav aria-label='주요 메뉴'>
            <ul className='slcn-desktop-header__nav-list'>
              {navigationItems.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'slcn-desktop-header__nav-link',
                        isActive && 'slcn-desktop-header__nav-link--active'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div
            ref={profileControlRef}
            className='slcn-desktop-header__profile-control'
          >
            <button
              ref={avatarButtonRef}
              type='button'
              className='slcn-desktop-header__avatar'
              aria-label='내 프로필'
              aria-haspopup='menu'
              aria-expanded={isPopoverOpen}
              aria-controls={isPopoverOpen ? popoverId : undefined}
              onClick={() => setIsPopoverOpen((open) => !open)}
            >
              <ProfileAvatar
                imageUrl={profileImageUrl}
                loading={profile.isLoading || isProfileImageLoading}
                alt={profileImageUrl ? `${displayName} 프로필` : ''}
              />
            </button>

            {isPopoverOpen ? (
              <div
                id={popoverId}
                ref={popoverRef}
                className='slcn-profile-popover'
                role='menu'
                aria-label='프로필 메뉴'
                onKeyDown={(event) => {
                  const items = Array.from(
                    event.currentTarget.querySelectorAll<HTMLButtonElement>(
                      '[role="menuitem"]:not([disabled]), [role="menuitemradio"]:not([disabled])'
                    )
                  );
                  const currentIndex = items.indexOf(
                    document.activeElement as HTMLButtonElement
                  );
                  let nextIndex: number | null = null;

                  if (event.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % items.length;
                  } else if (event.key === 'ArrowUp') {
                    nextIndex =
                      (currentIndex - 1 + items.length) % items.length;
                  } else if (event.key === 'Home') {
                    nextIndex = 0;
                  } else if (event.key === 'End') {
                    nextIndex = items.length - 1;
                  }

                  if (nextIndex !== null && items[nextIndex]) {
                    event.preventDefault();
                    items[nextIndex].focus();
                  }
                }}
              >
                <span className='slcn-profile-popover__arrow' />
                <div className='slcn-profile-popover__surface'>
                  <div className='slcn-profile-popover__identity'>
                    <ProfileAvatar
                      imageUrl={profileImageUrl}
                      loading={profile.isLoading || isProfileImageLoading}
                      alt=''
                      size={52}
                    />
                    <div className='slcn-profile-popover__identity-text'>
                      <strong title={displayName}>{displayName}</strong>
                      <span>로그인 계정</span>
                    </div>
                  </div>
                  <button
                    type='button'
                    className='slcn-profile-popover__item'
                    role='menuitem'
                    onClick={() => {
                      revokeProfileEditAccess();
                      setIsPopoverOpen(false);
                      setDialog('verify');
                    }}
                  >
                    <span className='slcn-profile-popover__item-icon'>
                      <ProfileMenuIcon />
                    </span>
                    <span>사용자 정보 수정</span>
                    <svg
                      className='slcn-profile-popover__chevron'
                      viewBox='0 0 24 24'
                      aria-hidden='true'
                    >
                      <path d='M9 6l6 6-6 6' />
                    </svg>
                  </button>
                  <span className='slcn-profile-popover__divider' />
                  <ThemeChoice inMenu />
                  <span className='slcn-profile-popover__divider' />
                  <button
                    type='button'
                    className='slcn-profile-popover__item slcn-profile-popover__item--logout'
                    role='menuitem'
                    disabled={logoutMutation.isPending}
                    onClick={() => void handleLogout()}
                  >
                    <span className='slcn-profile-popover__item-icon'>
                      <LogoutIcon />
                    </span>
                    <span>
                      {logoutMutation.isPending ? '로그아웃 중…' : '로그아웃'}
                    </span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <Modal
        isOpen={dialog === 'verify'}
        onClose={closeDialog}
        title='본인 확인'
        className='slcn-profile-dialog slcn-profile-dialog--verify'
        hideDefaultClose
      >
        <button
          type='button'
          className='slcn-profile-dialog__close'
          aria-label='닫기'
          onClick={closeDialog}
        >
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M6 6l12 12M18 6L6 18' />
          </svg>
        </button>
        <ProfileIdentityVerification
          device='desktop'
          onCancel={closeDialog}
          onContinue={() => {
            setIsEditDirty(false);
            setDialog('edit');
          }}
        />
      </Modal>

      <Modal
        isOpen={dialog === 'edit'}
        onClose={closeDialog}
        title='사용자 정보 수정'
        className='slcn-profile-dialog slcn-profile-dialog--edit'
        hideDefaultClose
      >
        <button
          type='button'
          className='slcn-profile-dialog__close'
          aria-label='닫기'
          onClick={closeDialog}
        >
          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M6 6l12 12M18 6L6 18' />
          </svg>
        </button>
        <ProfileEditForm
          device='desktop'
          onCancel={closeDialog}
          onDirtyChange={setIsEditDirty}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmingClose}
        title='저장하지 않은 변경 사항이 있어요'
        description='닫으면 지금까지 수정한 내용이 사라져요. 그래도 닫을까요?'
        confirmLabel='변경 사항 버리기'
        cancelLabel='계속 수정'
        onCancel={() => {
          setIsConfirmingClose(false);
        }}
        onConfirm={confirmCloseDialog}
      />
    </>
  );
}
