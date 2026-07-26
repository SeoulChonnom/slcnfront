import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revokeProfileEditAccess } from '../../profile/utils/profile-verification';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../store/auth-store';

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
