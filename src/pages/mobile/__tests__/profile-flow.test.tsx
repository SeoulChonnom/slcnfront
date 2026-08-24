import { screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { grantProfileEditAccess } from '@/domains/profile/utils/profile-verification';
import { ProfileEditPage } from '@/pages/mobile/ProfileEditPage';
import { ProfilePage } from '@/pages/mobile/ProfilePage';
import { ProfileVerifyPage } from '@/pages/mobile/ProfileVerifyPage';
import { renderWithProviders } from '@/test/helpers/render';

const { getProfile, logout, verifyPassword } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  logout: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock('@/domains/profile/api/profile-api', () => ({
  profileApi: { getProfile, verifyPassword },
}));

vi.mock('@/domains/auth/api/auth-api', () => ({
  authApi: { logout },
}));

function LocationProbe() {
  return <p data-testid='location'>{useLocation().pathname}</p>;
}

function renderMobileProfileFlow(route: string) {
  return renderWithProviders(
    <>
      <Routes>
        <Route path='/mobile/profile' element={<ProfilePage />} />
        <Route path='/mobile/profile/verify' element={<ProfileVerifyPage />} />
        <Route path='/mobile/profile/edit' element={<ProfileEditPage />} />
        <Route path='/mobile/login' element={<p>mobile-login</p>} />
      </Routes>
      <LocationProbe />
    </>,
    { route }
  );
}

describe('mobile profile flow', () => {
  beforeEach(() => {
    getProfile.mockReset();
    logout.mockReset();
    verifyPassword.mockReset();
    getProfile.mockResolvedValue({
      username: 'string',
      name: '기존 이름',
      profileImage: null,
    });
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
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('sends a direct edit visit to password verification', async () => {
    renderMobileProfileFlow('/mobile/profile/edit');

    expect(
      await screen.findByRole('heading', { name: '본인 확인' })
    ).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe(
      '/mobile/profile/verify'
    );
  });

  it('allows the edit page only after a successful verification grant', async () => {
    verifyPassword.mockResolvedValue(undefined);
    const flow = renderMobileProfileFlow('/mobile/profile/verify');

    await flow.user.type(
      screen.getByLabelText('현재 비밀번호'),
      'current-password'
    );
    await flow.user.click(screen.getByRole('button', { name: '확인' }));

    expect(
      await screen.findByRole('heading', { name: '프로필 이미지' })
    ).toBeTruthy();
    expect(screen.queryByText('확인되었습니다')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe(
      '/mobile/profile/edit'
    );

    flow.unmount();
    renderMobileProfileFlow('/mobile/profile/edit');
    expect(
      await screen.findByRole('heading', { name: '본인 확인' })
    ).toBeTruthy();
  });

  it('rejects a verification grant created by another account', async () => {
    grantProfileEditAccess('user-a');
    useAuthStore.getState().setSession({
      accessToken: 'access-token-b',
      userInfo: {
        name: '사용자 B',
        userName: 'user-b',
        roleList: ['user'],
      },
    });

    renderMobileProfileFlow('/mobile/profile/edit');

    expect(
      await screen.findByRole('heading', { name: '본인 확인' })
    ).toBeTruthy();
    expect(screen.getByTestId('location').textContent).toBe(
      '/mobile/profile/verify'
    );
  });

  it('navigates from the profile page to verification and logs out locally on a server error', async () => {
    logout.mockRejectedValueOnce(new Error('logout failed'));
    const editFlow = renderMobileProfileFlow('/mobile/profile');

    expect(
      await screen.findByRole('heading', { name: '기존 이름' })
    ).toBeTruthy();
    await editFlow.user.click(
      screen.getByRole('button', { name: '사용자 정보 수정' })
    );
    expect(screen.getByTestId('location').textContent).toBe(
      '/mobile/profile/verify'
    );

    editFlow.unmount();
    const logoutFlow = renderMobileProfileFlow('/mobile/profile');
    await logoutFlow.user.click(
      screen.getByRole('button', { name: '로그아웃' })
    );

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe(null);
      expect(screen.getByTestId('location').textContent).toBe('/mobile/login');
    });
  });
});
