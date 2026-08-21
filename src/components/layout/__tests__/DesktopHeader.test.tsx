import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import {
  resetAuthStore,
  useAuthStore,
} from '../../../domains/auth/store/auth-store';
import '../../../styles/profile.css';
import { renderWithProviders } from '../../../test/helpers/render';
import { DesktopHeader } from '../DesktopHeader';

const { getProfile, logout, verifyPassword } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  logout: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock('../../../domains/profile/api/profile-api', () => ({
  profileApi: { getProfile, verifyPassword },
}));

vi.mock('../../../domains/auth/api/auth-api', () => ({
  authApi: { logout },
}));

function LocationProbe() {
  return <p data-testid='location'>{useLocation().pathname}</p>;
}

describe('DesktopHeader', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'access-token',
      userInfo: {
        name: '기존 이름',
        userName: 'string',
        roleList: ['user'],
      },
      hydrated: true,
      restoreState: 'success',
    });
    getProfile.mockReset();
    logout.mockReset();
    verifyPassword.mockReset();
    getProfile.mockResolvedValue({
      username: 'string',
      name: '기존 이름',
      profileImage: null,
    });
  });

  afterEach(() => {
    resetAuthStore();
  });

  it('renders the primary navigation items', () => {
    renderWithProviders(<DesktopHeader />, {
      route: '/calendar',
    });

    expect(
      screen.getByRole('link', { name: /SLCN 홈으로 이동/i })
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: '나들이 기록' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '서울 촌놈 달력' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '신발 추천' })).toBeTruthy();
  });

  it('opens the profile menu and closes it with Escape or an outside press', async () => {
    const { user } = renderWithProviders(<DesktopHeader />, {
      route: '/main/calendar',
    });
    const profileButton = screen.getByRole('button', { name: '내 프로필' });

    await user.click(profileButton);
    expect(screen.getByRole('menu', { name: '프로필 메뉴' })).toBeTruthy();
    expect(
      screen.getByRole('menuitem', { name: '사용자 정보 수정' })
    ).toBeTruthy();
    const popoverAvatar = document.querySelector(
      '.slcn-profile-popover__identity > .slcn-profile-avatar'
    );
    expect(popoverAvatar).toBeTruthy();
    expect(window.getComputedStyle(popoverAvatar as Element).display).toBe(
      'inline-flex'
    );

    // The theme options sit between the two actions, so ArrowDown walks
    // through them rather than jumping straight to logout. They are
    // menuitemradio rather than menuitem, and the popover's roving focus has
    // to reach both roles or the choice becomes mouse-only.
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(
      screen.getByRole('menuitemradio', { name: '시스템' })
    );
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(document.activeElement).toBe(
      screen.getByRole('menuitemradio', { name: '어둡게' })
    );
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(
      screen.getByRole('menuitem', { name: '로그아웃' })
    );

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(
      screen.getByRole('menuitem', { name: '사용자 정보 수정' })
    );

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu', { name: '프로필 메뉴' })).toBe(null);
    expect(document.activeElement).toBe(profileButton);

    await user.click(profileButton);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu', { name: '프로필 메뉴' })).toBe(null);
  });

  it('requires password verification before the desktop edit dialog becomes available', async () => {
    verifyPassword.mockResolvedValue(undefined);
    const { user } = renderWithProviders(<DesktopHeader />, {
      route: '/main/calendar',
    });

    await user.click(screen.getByRole('button', { name: '내 프로필' }));
    await user.click(
      screen.getByRole('menuitem', { name: '사용자 정보 수정' })
    );
    expect(screen.getByRole('dialog', { name: '본인 확인' })).toBeTruthy();

    await user.type(screen.getByLabelText('현재 비밀번호'), 'current-password');
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(
      await screen.findByRole('dialog', { name: '사용자 정보 수정' })
    ).toBeTruthy();
    const editDialog = screen.getByRole('dialog', {
      name: '사용자 정보 수정',
    });
    const editDialogBody = editDialog.querySelector(
      ':scope > .slcn-modal__body'
    );
    expect(window.getComputedStyle(editDialog).overflowY).toBe('hidden');
    expect(editDialogBody).toBeTruthy();
    expect(window.getComputedStyle(editDialogBody as Element).overflowY).toBe(
      'auto'
    );
    expect(screen.queryByText('확인되었습니다')).toBeNull();
    expect(screen.queryByRole('button', { name: '모달 닫기' })).toBeNull();
    expect(screen.getAllByRole('button', { name: '닫기' })).toHaveLength(1);
  });

  it('confirms before closing an edit dialog that contains an unsaved draft', async () => {
    verifyPassword.mockResolvedValue(undefined);
    const { user } = renderWithProviders(<DesktopHeader />, {
      route: '/main/calendar',
    });

    await user.click(screen.getByRole('button', { name: '내 프로필' }));
    await user.click(
      screen.getByRole('menuitem', { name: '사용자 정보 수정' })
    );
    await user.type(screen.getByLabelText('현재 비밀번호'), 'current-password');
    await user.click(screen.getByRole('button', { name: '확인' }));
    await screen.findByRole('dialog', { name: '사용자 정보 수정' });
    await user.type(screen.getByLabelText('이름'), '저장 전 이름');

    await user.click(screen.getByRole('button', { name: '닫기' }));
    await screen.findByRole('dialog', {
      name: '저장하지 않은 변경 사항이 있어요',
    });
    expect(
      screen.getByRole('dialog', { name: '사용자 정보 수정' })
    ).toBeTruthy();
    const stayButton = screen.getByRole('button', { name: '계속 수정' });

    await waitFor(() => {
      expect(document.activeElement).toBe(stayButton);
    });

    // Cancelling the confirm dialog leaves the edit dialog and draft alone.
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: '저장하지 않은 변경 사항이 있어요' })
    ).toBeNull();
    expect(
      screen.getByRole('dialog', { name: '사용자 정보 수정' })
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '닫기' }));
    await screen.findByRole('dialog', {
      name: '저장하지 않은 변경 사항이 있어요',
    });
    await user.click(screen.getByRole('button', { name: '변경 사항 버리기' }));
    expect(
      screen.queryByRole('dialog', { name: '사용자 정보 수정' })
    ).toBeNull();
  });

  it('clears the local session and returns to login even when server logout fails', async () => {
    logout.mockRejectedValueOnce(new Error('logout failed'));
    const { user } = renderWithProviders(
      <>
        <DesktopHeader />
        <LocationProbe />
      </>,
      { route: '/main/calendar' }
    );

    await user.click(screen.getByRole('button', { name: '내 프로필' }));
    await user.click(screen.getByRole('menuitem', { name: '로그아웃' }));

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe(null);
      expect(screen.getByTestId('location').textContent).toContain(
        '/main/login'
      );
    });
  });
});
