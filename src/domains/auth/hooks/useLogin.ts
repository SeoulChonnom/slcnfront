import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/domains/auth/api/auth-api';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { revokeProfileEditAccess } from '@/domains/profile/utils/profile-verification';
import { authQueryKeys } from '@/lib/api/query-keys';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationKey: authQueryKeys.session(),
    mutationFn: authApi.login,
    onMutate: () => {
      revokeProfileEditAccess();
    },
    onSuccess: (session) => {
      setSession(session);
    },
  });
}
