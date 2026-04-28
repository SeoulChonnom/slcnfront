import { apiClient, type createApiClient } from '../../../lib/api/api-client';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get' | 'post'>;

type TripFileUploadKind = 'logo' | 'map1' | 'map2';

function mapTripFileUploadPath(kind: TripFileUploadKind) {
  return kind === 'logo' ? 'logo' : 'map';
}

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
    uploadTripFile(kind: TripFileUploadKind, file: File) {
      const formData = new FormData();

      formData.append('file', file);

      return client.post<string>({
        path: '/file',
        query: {
          path: mapTripFileUploadPath(kind),
        },
        body: formData,
        responseType: 'text',
      });
    },
  };
}

export const tripFilesApi = createTripFilesApi();
