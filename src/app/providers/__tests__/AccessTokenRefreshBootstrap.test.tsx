import { act, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireAuth } from '@/app/router/guards';
import { resetAuthStore, useAuthStore } from '@/domains/auth/store/auth-store';
import {
  grantProfileEditAccess,
  hasProfileEditAccess,
} from '@/domains/profile/utils/profile-verification';
import { createApiClient } from '@/lib/api/api-client';
import { AppError } from '@/lib/api/errors';
import { renderWithAppProviders } from '@/test/helpers/render';

const { restoreSession } = vi.hoisted(() => ({ restoreSession: vi.fn() }));

vi.mock('@/domains/auth/api/auth-api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/domains/auth/api/auth-api')>();
  return { ...actual, authApi: { ...actual.authApi, restoreSession } };
});

const session = {
  accessToken: 'expired-token',
  userInfo: { name: 'SLCN', userName: 'string', roleList: ['user' as const] },
};

function renderProtectedRoute(device: string) {
  return renderWithAppProviders(
    <Routes>
      <Route path={`/${device}/login`} element={<p>login-page</p>} />
      <Route element={<RequireAuth />}>
        <Route path={`/${device}/protected`} element={<p>private-page</p>} />
      </Route>
    </Routes>,
    { route: `/${device}/protected` }
  );
}

function unauthorized() {
  return new Response(JSON.stringify({ title: 'expired token' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('access token refresh bootstrap', () => {
  beforeEach(() => {
    resetAuthStore();
    useAuthStore.getState().setSession(session);
  });

  afterEach(() => {
    resetAuthStore();
    window.sessionStorage.clear();
  });

  it('registers refresh and keeps protected content visible after a successful retry', async () => {
    restoreSession.mockResolvedValue({
      ...session,
      accessToken: 'fresh-token',
    });
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = createApiClient({
      fetchFn,
      getBaseUrl: () => 'http://localhost:8080',
    });
    renderProtectedRoute('main');

    await act(async () => {
      await client.get({ path: '/protected' });
    });

    expect(restoreSession).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');
    expect(
      new Headers(fetchFn.mock.calls[1]?.[1]?.headers).get('X-AUTH-TOKEN')
    ).toBe('fresh-token');
    expect(screen.getByText('private-page')).toBeTruthy();
  });

  it.each(['main', 'mobile'])(
    'clears cached data and redirects %s when refresh is rejected',
    async (device) => {
      restoreSession.mockRejectedValue(
        new AppError({
          code: 'HTTP_ERROR',
          message: 'expired refresh token',
          status: 401,
        })
      );
      const client = createApiClient({
        fetchFn: vi.fn<typeof fetch>().mockResolvedValue(unauthorized()),
        getBaseUrl: () => 'http://localhost:8080',
      });
      const { queryClient } = renderProtectedRoute(device);
      queryClient.setQueryData(['private-data'], { secret: 'cached' });
      grantProfileEditAccess('string');

      await act(async () => {
        await expect(client.get({ path: '/protected' })).rejects.toMatchObject({
          status: 401,
        });
      });

      expect(await screen.findByText('login-page')).toBeTruthy();
      expect(screen.queryByText('private-page')).toBeNull();
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
      expect(hasProfileEditAccess('string')).toBe(false);
      expect(useAuthStore.getState().restoreState).toBe('error');
      expect(restoreSession).toHaveBeenCalledTimes(1);
    }
  );
});
