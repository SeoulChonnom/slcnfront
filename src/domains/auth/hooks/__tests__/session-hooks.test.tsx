import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient } from '../../../../test/helpers/query-client';
import {
  grantProfileEditAccess,
  hasProfileEditAccess,
} from '../../../profile/utils/profile-verification';
import { useAuthStore } from '../../store/auth-store';
import { useLogin } from '../useLogin';
import { useLogout } from '../useLogout';
import { useRestoreSession } from '../useRestoreSession';

const { login, logout, restoreSession } = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  restoreSession: vi.fn(),
}));

vi.mock('../../api/auth-api', () => ({
  authApi: {
    login,
    logout,
    restoreSession,
  },
}));

const session = {
  accessToken: 'access-token',
  userInfo: {
    name: '사용자',
    userName: 'string',
    roleList: ['user' as const],
  },
};

function createWrapper(client = createTestQueryClient()) {
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('auth session hooks', () => {
  beforeEach(() => {
    login.mockReset();
    logout.mockReset();
    restoreSession.mockReset();
    window.sessionStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      userInfo: null,
      hydrated: true,
      restoreState: 'idle',
    });
  });

  it('revokes a previous profile-edit grant when login changes the session', async () => {
    login.mockResolvedValueOnce(session);
    grantProfileEditAccess('previous-user');
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        userName: 'string',
        password: 'password',
      });
    });

    expect(hasProfileEditAccess('previous-user')).toBe(false);
    expect(useAuthStore.getState()).toMatchObject(session);
  });

  it('revokes a previous profile-edit grant as soon as a login attempt starts', async () => {
    login.mockRejectedValueOnce(new Error('login failed'));
    grantProfileEditAccess('previous-user');
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        userName: 'string',
        password: 'wrong-password',
      })
    ).rejects.toThrow('login failed');

    expect(hasProfileEditAccess('previous-user')).toBe(false);
  });

  it('revokes a profile-edit grant after successful session restoration', async () => {
    restoreSession.mockResolvedValueOnce(session);
    grantProfileEditAccess('string');
    const { result } = renderHook(() => useRestoreSession(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(undefined);
    });

    expect(hasProfileEditAccess('string')).toBe(false);
    expect(useAuthStore.getState()).toMatchObject(session);
  });

  it('revokes a profile-edit grant when session restoration fails', async () => {
    restoreSession.mockRejectedValueOnce(new Error('refresh failed'));
    grantProfileEditAccess('string');
    const { result } = renderHook(() => useRestoreSession(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync(undefined)).rejects.toThrow(
      'refresh failed'
    );

    expect(hasProfileEditAccess('string')).toBe(false);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      userInfo: null,
      restoreState: 'error',
    });
  });

  it('clears cached user data and the grant even when server logout fails', async () => {
    const client = createTestQueryClient();
    useAuthStore.getState().setSession(session);
    client.setQueryData(['trip', 'list'], [{ id: 1 }]);
    client.setQueryData(['profile', 'detail', 'string'], {
      username: 'string',
    });
    logout.mockRejectedValueOnce(new Error('logout failed'));
    grantProfileEditAccess('string');
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(client),
    });

    await expect(result.current.mutateAsync()).rejects.toThrow('logout failed');

    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(hasProfileEditAccess('string')).toBe(false);
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      userInfo: null,
    });
  });
});
