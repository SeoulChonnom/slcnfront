import { useMutation } from '@tanstack/react-query';
import { profileQueryKeys } from '../../../lib/api/query-keys';
import { profileApi } from '../api/profile-api';

export function useVerifyProfilePassword() {
  return useMutation({
    mutationKey: profileQueryKeys.passwordVerification(),
    mutationFn: (password: string) => profileApi.verifyPassword(password),
  });
}
