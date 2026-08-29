import type { FileAsset } from '@/domains/trip/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'post'>;

type TripFileUploadKind = 'logo' | 'map1' | 'map2';

function mapTripFileUploadType(kind: TripFileUploadKind): string {
  return kind === 'logo' ? 'logo' : 'map';
}

export function createTripFilesApi(client: ApiClientLike = apiClient) {
  return {
    uploadTripFile(kind: TripFileUploadKind, file: File) {
      const formData = new FormData();

      formData.append('file', file);

      return client.post<FileAsset>({
        path: '/assets/file',
        query: {
          type: mapTripFileUploadType(kind),
        },
        body: formData,
      });
    },
  };
}

export const tripFilesApi = createTripFilesApi();
