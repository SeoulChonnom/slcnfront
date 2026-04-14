import { useMutation } from '@tanstack/react-query';
import { authQueryKeys } from '../../../lib/api/query-keys';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../store/auth-store';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationKey: authQueryKeys.session(),
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession(session);
    },
  });
}
