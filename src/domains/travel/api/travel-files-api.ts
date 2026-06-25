import { apiClient, type createApiClient } from '../../../lib/api/api-client';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get'>;

export function createTravelFilesApi(client: ApiClientLike = apiClient) {
  return {
    downloadTravelFile(fileId: string) {
      return client.get<Blob>({
        path: `/assets/files/${encodeURIComponent(fileId)}`,
        responseType: 'blob',
      });
    },
  };
}

export const travelFilesApi = createTravelFilesApi();
