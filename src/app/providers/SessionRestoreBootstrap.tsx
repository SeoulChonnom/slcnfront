import { useEffect } from 'react';
import { useRestoreSession } from '../../domains/auth/hooks/useRestoreSession';
import { useAuthStore } from '../../domains/auth/store/auth-store';

export function SessionRestoreBootstrap() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const restoreState = useAuthStore((state) => state.restoreState);
  const restoreSession = useRestoreSession();

  useEffect(() => {
    if (!hydrated || accessToken) {
      return;
    }

    if (restoreState !== 'idle') {
      return;
    }

    restoreSession.mutate(undefined);
  }, [accessToken, hydrated, restoreSession, restoreState]);

  return null;
}
