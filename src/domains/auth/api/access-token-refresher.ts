import { type AuthSuccess, authApi } from '@/domains/auth/api/auth-api';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { revokeProfileEditAccess } from '@/domains/profile/utils/profile-verification';
import { AppError } from '@/lib/api/errors';

type AccessTokenRefresherOptions = {
  restoreSession?: () => Promise<AuthSuccess>;
  /** Runs once the refresh token is rejected and the session is gone. */
  onSessionExpired?: () => void;
};

function isSessionRejected(error: unknown) {
  return (
    error instanceof AppError &&
    error.code === 'HTTP_ERROR' &&
    (error.status === 401 || error.status === 403)
  );
}

/**
 * Reissues the access token from the refresh-token cookie. Concurrent callers
 * share one in-flight reissue, so a burst of 401s spends the refresh token
 * once instead of racing its rotation.
 */
export function createAccessTokenRefresher({
  restoreSession = () => authApi.restoreSession(),
  onSessionExpired,
}: AccessTokenRefresherOptions = {}) {
  let inFlight: Promise<string | null> | null = null;

  async function reissue() {
    const { accessToken, userInfo } = useAuthStore.getState();
    const isCurrentSession = () => {
      const current = useAuthStore.getState();
      return (
        current.accessToken === accessToken && current.userInfo === userInfo
      );
    };

    if (!accessToken) {
      return null;
    }

    try {
      const session = await restoreSession();
      // A late response must not undo logout or replace a newer login.
      if (!isCurrentSession()) {
        return null;
      }

      useAuthStore.getState().setSession(session);

      return session.accessToken;
    } catch (error) {
      // Only an authentication rejection proves the session has ended.
      // Network/server failures and stale responses must leave it alone.
      if (!isCurrentSession() || !isSessionRejected(error)) {
        return null;
      }

      revokeProfileEditAccess();
      useAuthStore.getState().markRestoreFailed();
      onSessionExpired?.();

      return null;
    }
  }

  return () => {
    inFlight ??= reissue().finally(() => {
      inFlight = null;
    });

    return inFlight;
  };
}
