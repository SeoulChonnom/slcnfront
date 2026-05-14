import { createAppQueryClient } from '../../app/providers/create-app-query-client';

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
