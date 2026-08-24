import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/domains/auth/api/auth-api';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { revokeProfileEditAccess } from '@/domains/profile/utils/profile-verification';
import { authQueryKeys } from '@/lib/api/query-keys';

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
