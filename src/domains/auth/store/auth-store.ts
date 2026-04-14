import { create } from 'zustand';
import type { AuthSession, UserInfo } from '../types';

export const AUTH_USER_INFO_STORAGE_KEY = 'slcn.auth.user-info';
export const AUTH_RESTORE_STATES = [
  'idle',
  'pending',
  'success',
  'error',
] as const;

export type AuthRestoreState = (typeof AUTH_RESTORE_STATES)[number];

type AuthStore = AuthSession & {
  restoreState: AuthRestoreState;
  hydrateFromStorage: () => void;
  setSession: (session: Pick<AuthSession, 'accessToken' | 'userInfo'>) => void;
  clearSession: () => void;
  startRestore: () => void;
  markRestoreFailed: () => void;
};

const initialAuthState: AuthSession & { restoreState: AuthRestoreState } = {
  accessToken: null,
  userInfo: null,
  hydrated: false,
  restoreState: 'idle',
};

function canUseSessionStorage() {
  return (
    typeof window !== 'undefined' &&
    typeof window.sessionStorage !== 'undefined'
  );
}

function readStoredUserInfo() {
  if (!canUseSessionStorage()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(AUTH_USER_INFO_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as UserInfo;
  } catch {
    window.sessionStorage.removeItem(AUTH_USER_INFO_STORAGE_KEY);

    return null;
  }
}

function writeStoredUserInfo(userInfo: UserInfo | null) {
  if (!canUseSessionStorage()) {
    return;
  }

  if (!userInfo) {
    window.sessionStorage.removeItem(AUTH_USER_INFO_STORAGE_KEY);

    return;
  }

  window.sessionStorage.setItem(
    AUTH_USER_INFO_STORAGE_KEY,
    JSON.stringify(userInfo),
  );
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialAuthState,
  hydrateFromStorage: () => {
    set({
      accessToken: null,
      userInfo: readStoredUserInfo(),
      hydrated: true,
      restoreState: 'idle',
    });
  },
  setSession: ({ accessToken, userInfo }) => {
    writeStoredUserInfo(userInfo);
    set({
      accessToken,
      userInfo,
      hydrated: true,
      restoreState: accessToken ? 'success' : 'idle',
    });
  },
  clearSession: () => {
    writeStoredUserInfo(null);
    set({
      accessToken: null,
      userInfo: null,
      hydrated: true,
      restoreState: 'idle',
    });
  },
  startRestore: () => {
    set({
      restoreState: 'pending',
    });
  },
  markRestoreFailed: () => {
    set((state) => ({
      accessToken: null,
      userInfo: state.userInfo,
      hydrated: true,
      restoreState: 'error',
    }));
  },
}));

export function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

export function resetAuthStore() {
  writeStoredUserInfo(null);
  useAuthStore.setState(initialAuthState);
}
