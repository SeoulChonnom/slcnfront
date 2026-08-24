import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/domains/auth/api/auth-api';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { revokeProfileEditAccess } from '@/domains/profile/utils/profile-verification';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onMutate: () => {
      revokeProfileEditAccess();
    },
    onSettled: () => {
      revokeProfileEditAccess();
      useAuthStore.getState().clearSession();
      queryClient.clear();
    },
  });
}
