import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  AUTH_USER_INFO_STORAGE_KEY,
  resetAuthStore,
  useAuthStore,
} from '../auth-store';

describe('auth-store', () => {
  beforeEach(() => {
    resetAuthStore();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    resetAuthStore();
    window.sessionStorage.clear();
  });

  it('hydrates user info from session storage', () => {
    window.sessionStorage.setItem(
      AUTH_USER_INFO_STORAGE_KEY,
      JSON.stringify({
        name: 'Stored User',
        userName: 'stored-user',
        roleList: ['admin'],
      })
    );

    useAuthStore.getState().hydrateFromStorage();

    expect(useAuthStore.getState()).toMatchObject({
      hydrated: true,
      accessToken: null,
      restoreState: 'idle',
      userInfo: {
        name: 'Stored User',
        userName: 'stored-user',
        roleList: ['admin'],
      },
    });
  });

  it('persists user info on login success', () => {
    useAuthStore.getState().setSession({
      accessToken: 'token-123',
      userInfo: {
        name: 'SLCN',
        userName: 'slcn-admin',
        roleList: ['admin'],
      },
    });

    expect(useAuthStore.getState()).toMatchObject({
      hydrated: true,
      accessToken: 'token-123',
      restoreState: 'success',
    });
    expect(
      JSON.parse(
        window.sessionStorage.getItem(AUTH_USER_INFO_STORAGE_KEY) || 'null'
      )
    ).toEqual({
      name: 'SLCN',
      userName: 'slcn-admin',
      roleList: ['admin'],
    });
  });

  it('clears session state and storage on logout', () => {
    useAuthStore.getState().setSession({
      accessToken: 'token-123',
      userInfo: {
        name: 'SLCN',
        userName: 'slcn-admin',
        roleList: ['admin'],
      },
    });

    useAuthStore.getState().clearSession();

    expect(useAuthStore.getState()).toMatchObject({
      hydrated: true,
      accessToken: null,
      userInfo: null,
      restoreState: 'idle',
    });
    expect(
      window.sessionStorage.getItem(AUTH_USER_INFO_STORAGE_KEY)
    ).toBeNull();
  });

  it('tracks restore lifecycle state', () => {
    useAuthStore.getState().hydrateFromStorage();
    useAuthStore.getState().startRestore();

    expect(useAuthStore.getState().restoreState).toBe('pending');

    useAuthStore.getState().markRestoreFailed();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      hydrated: true,
      userInfo: null,
      restoreState: 'error',
    });
  });
});
