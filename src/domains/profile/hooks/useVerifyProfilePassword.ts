import { useMutation } from '@tanstack/react-query';
import { profileApi } from '@/domains/profile/api/profile-api';
import { profileQueryKeys } from '@/lib/api/query-keys';

export function useVerifyProfilePassword() {
  return useMutation({
    mutationKey: profileQueryKeys.passwordVerification(),
    mutationFn: (password: string) => profileApi.verifyPassword(password),
  });
}
