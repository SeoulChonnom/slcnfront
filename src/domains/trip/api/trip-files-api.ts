import { apiClient, type createApiClient } from '../../../lib/api/api-client';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get'>;

export function createTripFilesApi(client: ApiClientLike = apiClient) {
  return {
    downloadTripFile(path: string) {
      return client.get<Blob>({
        path: '/file',
        query: {
          path,
        },
        responseType: 'blob',
      });
    },
  };
}

export const tripFilesApi = createTripFilesApi();
