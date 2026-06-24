import { screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRouter } from '../../../app/router/AppRouter';
import {
  resetAuthStore,
  useAuthStore,
} from '../../../domains/auth/store/auth-store';
import { renderWithAppProviders } from '../../helpers/render';

const { restoreSession } = vi.hoisted(() => ({
  restoreSession: vi.fn(),
}));

vi.mock('../../../domains/auth/api/auth-api', async () => {
  const actual = await vi.importActual<
    typeof import('../../../domains/auth/api/auth-api')
  >('../../../domains/auth/api/auth-api');

  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      restoreSession,
    },
  };
});

function LocationProbe() {
  const location = useLocation();

  return (
    <div data-testid='location-probe'>
      {location.pathname}
      {location.search}
    </div>
  );
}

function renderApp(route: string) {
  return renderWithAppProviders(
    <>
      <LocationProbe />
      <AppRouter />
    </>,
    { route }
  );
}

describe('auth smoke', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetAuthStore();
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      restoreState: 'idle',
      userInfo: null,
    });
  });

  afterEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  it('redirects unauthenticated protected routes to the device login URL', async () => {
    restoreSession.mockRejectedValueOnce(new Error('refresh token missing'));

    renderApp('/main/map');

    await waitFor(() => {
      expect(screen.getByTestId('location-probe').textContent).toBe(
        '/main/login?redirect=%2Fmain%2Fmap'
      );
    });
    expect(await screen.findByRole('button', { name: '로그인' })).toBeTruthy();
  });

  it('restores a session from refresh token before entering the protected route', async () => {
    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      restoreState: 'idle',
      userInfo: null,
    });
    restoreSession.mockResolvedValueOnce({
      accessToken: 'token-123',
      userInfo: {
        name: 'SLCN',
        userName: 'slcn-admin',
        roleList: ['admin'],
      },
    });

    renderApp('/main/shoesRecom');

    await waitFor(() => {
      expect(restoreSession).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("서울 촌놈's 신발 추천")).toBeTruthy();
    expect(screen.getByTestId('location-probe').textContent).toBe(
      '/main/shoesRecom'
    );
    expect(useAuthStore.getState().accessToken).toBe('token-123');
  });
});
