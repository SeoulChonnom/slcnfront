import { useMutation } from '@tanstack/react-query';
import { authQueryKeys } from '../../../lib/api/query-keys';
import { revokeProfileEditAccess } from '../../profile/utils/profile-verification';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../store/auth-store';

export function useRestoreSession() {
  const setSession = useAuthStore((state) => state.setSession);
  const startRestore = useAuthStore((state) => state.startRestore);
  const markRestoreFailed = useAuthStore((state) => state.markRestoreFailed);

  return useMutation({
    mutationKey: authQueryKeys.session(),
    mutationFn: authApi.restoreSession,
    onMutate: () => {
      revokeProfileEditAccess();
      startRestore();
    },
    onSuccess: (session) => {
      revokeProfileEditAccess();
      setSession(session);
    },
    onError: () => {
      revokeProfileEditAccess();
      markRestoreFailed();
    },
  });
}
