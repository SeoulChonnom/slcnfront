import { useQuery } from '@tanstack/react-query';
import { profileQueryKeys } from '../../../lib/api/query-keys';
import { useAuthStore } from '../../auth/store/auth-store';
import { profileApi } from '../api/profile-api';

export function useProfile() {
  const username = useAuthStore((state) => state.userInfo?.userName ?? null);

  return useQuery({
    queryKey: profileQueryKeys.detail(username),
    queryFn: ({ signal }) => profileApi.getProfile({ signal }),
    enabled: username !== null,
  });
}
