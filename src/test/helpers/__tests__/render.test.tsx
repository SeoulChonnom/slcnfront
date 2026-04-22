import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  renderWithAppProviders,
  renderWithMinimalProviders,
  renderWithProviders,
} from '../render';
import {
  resetAuthStore,
  useAuthStore,
} from '../../../domains/auth/store/auth-store';

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

function ProviderProbe() {
  const location = useLocation();
  const query = useQuery({
    queryKey: ['probe'],
    queryFn: async () => 'query-ready',
  });

  return (
    <div>
      <p>{location.pathname}</p>
      <p>{query.data ?? 'loading'}</p>
    </div>
  );
}

describe('renderWithProviders', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetAuthStore();
    restoreSession.mockReset();
  });

  afterEach(() => {
    resetAuthStore();
  });

  it('wraps components with router and query providers', async () => {
    renderWithProviders(<ProviderProbe />, {
      route: '/calendar',
    });

    expect(screen.getByText('/calendar')).toBeTruthy();
    expect(await screen.findByText('query-ready')).toBeTruthy();
  });

  it('exposes the minimal helper explicitly', async () => {
    renderWithMinimalProviders(<ProviderProbe />, {
      route: '/map',
    });

    expect(screen.getByText('/map')).toBeTruthy();
    expect(await screen.findByText('query-ready')).toBeTruthy();
    expect(restoreSession).not.toHaveBeenCalled();
  });

  it('exposes a full app helper that runs session restore bootstrap', async () => {
    restoreSession.mockRejectedValueOnce(new Error('no refresh token'));

    useAuthStore.setState({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'idle',
    });

    renderWithAppProviders(<ProviderProbe />, {
      route: '/calendar',
    });

    expect(screen.getByText('/calendar')).toBeTruthy();
    expect(await screen.findByText('query-ready')).toBeTruthy();
    expect(restoreSession).toHaveBeenCalledTimes(1);
  });
});
