import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createAccessTokenRefresher } from '@/domains/auth/api/access-token-refresher';
import { setAccessTokenRefresher } from '@/lib/api/api-client';

/**
 * Lets the API client renew an access token that expired while the page
 * stayed open. When the refresh token is rejected too, the cached data of
 * the ended session is dropped and the route guard sends the user to login.
 */
export function AccessTokenRefreshBootstrap() {
  const queryClient = useQueryClient();

  useEffect(() => {
    setAccessTokenRefresher(
      createAccessTokenRefresher({
        onSessionExpired: () => queryClient.clear(),
      })
    );

    return () => setAccessTokenRefresher(null);
  }, [queryClient]);

  return null;
}
