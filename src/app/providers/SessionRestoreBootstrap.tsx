import { useEffect, useRef } from 'react';
import { useRestoreSession } from '../../domains/auth/hooks/useRestoreSession';
import { useAuthStore } from '../../domains/auth/store/auth-store';

export function SessionRestoreBootstrap() {
  const restoreAttemptedRef = useRef(false);
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userInfo = useAuthStore((state) => state.userInfo);
  const restoreState = useAuthStore((state) => state.restoreState);
  const restoreSession = useRestoreSession();

  useEffect(() => {
    if (!hydrated || accessToken || !userInfo || restoreAttemptedRef.current) {
      return;
    }

    if (restoreState !== 'idle') {
      return;
    }

    restoreAttemptedRef.current = true;
    restoreSession.mutate(undefined);
  }, [accessToken, hydrated, restoreSession, restoreState, userInfo]);

  return null;
}
