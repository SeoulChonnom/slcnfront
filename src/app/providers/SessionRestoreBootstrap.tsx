import { useEffect } from 'react';
import { useRestoreSession } from '../../domains/auth/hooks/useRestoreSession';
import {
  selectShouldAttemptSessionRestore,
  useAuthStore,
} from '../../domains/auth/store/auth-store';

export function SessionRestoreBootstrap() {
  const shouldAttemptRestore = useAuthStore(selectShouldAttemptSessionRestore);
  const restoreSession = useRestoreSession();

  useEffect(() => {
    if (!shouldAttemptRestore) {
      return;
    }

    restoreSession.mutate(undefined);
  }, [restoreSession, shouldAttemptRestore]);

  return null;
}
