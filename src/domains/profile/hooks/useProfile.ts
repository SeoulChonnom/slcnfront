import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/domains/auth/store/auth-store';
import { profileApi } from '@/domains/profile/api/profile-api';
import { profileQueryKeys } from '@/lib/api/query-keys';

export function useProfile() {
  const username = useAuthStore((state) => state.userInfo?.userName ?? null);

  return useQuery({
    queryKey: profileQueryKeys.detail(username),
    queryFn: ({ signal }) => profileApi.getProfile({ signal }),
    enabled: username !== null,
  });
}
