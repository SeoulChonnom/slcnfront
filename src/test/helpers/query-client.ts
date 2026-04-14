import { QueryClient } from '@tanstack/react-query';
import { createAppQueryClient } from '../../app/providers/QueryProvider';

export function createTestQueryClient() {
  const client = createAppQueryClient();

  client.setDefaultOptions({
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  });

  return client;
}

export function clearQueryClient(client: QueryClient) {
  client.clear();
}
