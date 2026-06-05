import { useEffect } from 'react';
import { useAuthStore } from '../../domains/auth/store/auth-store';

export function AuthBootstrap() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    if (!hydrated) {
      hydrateFromStorage();
    }
  }, [hydrateFromStorage, hydrated]);

  return null;
}
