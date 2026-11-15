import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAccessTokenRefresher } from '@/domains/auth/api/access-token-refresher';
import type { AuthSuccess } from '@/domains/auth/api/auth-api';
import { resetAuthStore, useAuthStore } from '@/domains/auth/store/auth-store';
import { AppError } from '@/lib/api/errors';

const renewedSession: AuthSuccess = {
  accessToken: 'fresh-token',
  userInfo: { name: 'SLCN', userName: 'slcn-admin', roleList: ['admin'] },
};

describe('createAccessTokenRefresher', () => {
  beforeEach(() => {
    resetAuthStore();
    useAuthStore.getState().setSession({
      accessToken: 'expired-token',
      userInfo: renewedSession.userInfo,
    });
  });

  afterEach(() => {
    resetAuthStore();
    window.sessionStorage.clear();
  });

  it('stores the reissued session and shares one reissue across callers', async () => {
    const restoreSession = vi.fn(async () => renewedSession);
    const refresh = createAccessTokenRefresher({ restoreSession });

    const tokens = await Promise.all([refresh(), refresh(), refresh()]);

    expect(tokens).toEqual(['fresh-token', 'fresh-token', 'fresh-token']);
    expect(restoreSession).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe('fresh-token');

    await refresh();
    expect(restoreSession).toHaveBeenCalledTimes(2);
  });

  it('ends the session when the refresh token is rejected', async () => {
    const onSessionExpired = vi.fn();
    const refresh = createAccessTokenRefresher({
      restoreSession: vi.fn(async () => {
        throw new AppError({
          code: 'HTTP_ERROR',
          message: 'invalid refresh token',
          status: 401,
        });
      }),
      onSessionExpired,
    });

    await expect(refresh()).resolves.toBeNull();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.userInfo).toBeNull();
    expect(state.restoreState).toBe('error');
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when the reissue fails on the network', async () => {
    const onSessionExpired = vi.fn();
    const refresh = createAccessTokenRefresher({
      restoreSession: vi.fn(async () => {
        throw new AppError({ code: 'NETWORK_ERROR', message: 'offline' });
      }),
      onSessionExpired,
    });

    await expect(refresh()).resolves.toBeNull();

    expect(useAuthStore.getState().accessToken).toBe('expired-token');
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it.each([429, 500, 503])(
    'keeps the session after a temporary HTTP %s failure',
    async (status) => {
      const onSessionExpired = vi.fn();
      const refresh = createAccessTokenRefresher({
        restoreSession: vi.fn().mockRejectedValue(
          new AppError({
            code: 'HTTP_ERROR',
            message: 'temporarily unavailable',
            status,
          })
        ),
        onSessionExpired,
      });

      await expect(refresh()).resolves.toBeNull();

      expect(useAuthStore.getState().accessToken).toBe('expired-token');
      expect(onSessionExpired).not.toHaveBeenCalled();
    }
  );

  it.each(['logout', 'login'])(
    'ignores a successful refresh after a newer %s',
    async (action) => {
      let finish!: (session: AuthSuccess) => void;
      const refresh = createAccessTokenRefresher({
        restoreSession: () =>
          new Promise<AuthSuccess>((resolve) => {
            finish = resolve;
          }),
      });
      const pending = refresh();
      if (action === 'logout') {
        useAuthStore.getState().clearSession();
      } else {
        useAuthStore
          .getState()
          .setSession({ ...renewedSession, accessToken: 'new-login-token' });
      }

      finish(renewedSession);

      await expect(pending).resolves.toBeNull();
      expect(useAuthStore.getState().accessToken).toBe(
        action === 'logout' ? null : 'new-login-token'
      );
    }
  );

  it('does not end a newer login when an older refresh is rejected', async () => {
    let fail!: (error: unknown) => void;
    const onSessionExpired = vi.fn();
    const refresh = createAccessTokenRefresher({
      restoreSession: () =>
        new Promise<AuthSuccess>((_, reject) => {
          fail = reject;
        }),
      onSessionExpired,
    });
    const pending = refresh();
    useAuthStore
      .getState()
      .setSession({ ...renewedSession, accessToken: 'new-login-token' });
    fail(
      new AppError({
        code: 'HTTP_ERROR',
        message: 'invalid refresh token',
        status: 401,
      })
    );

    await expect(pending).resolves.toBeNull();
    expect(useAuthStore.getState().accessToken).toBe('new-login-token');
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('does not refresh a session that has already ended', async () => {
    const restoreSession = vi.fn(async () => renewedSession);
    const refresh = createAccessTokenRefresher({ restoreSession });
    useAuthStore.getState().markRestoreFailed();

    await expect(refresh()).resolves.toBeNull();
    expect(restoreSession).not.toHaveBeenCalled();
  });
});
