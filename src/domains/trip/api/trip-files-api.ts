import { apiClient, type createApiClient } from '../../../lib/api/api-client';
import type { FileRef } from '../types';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get' | 'post'>;

type TripFileUploadKind = 'logo' | 'map1' | 'map2';

function mapTripFileUploadType(kind: TripFileUploadKind): string {
  return kind === 'logo' ? 'logo' : 'map';
}

export function createTripFilesApi(client: ApiClientLike = apiClient) {
  return {
    downloadTripFile(ref: FileRef) {
      return client.get<Blob>({
        path: '/file',
        query: {
          type: ref.type,
          filename: ref.filename,
        },
        responseType: 'blob',
      });
    },
    uploadTripFile(kind: TripFileUploadKind, file: File) {
      const formData = new FormData();

      formData.append('file', file);
      formData.append('type', mapTripFileUploadType(kind));

      return client.post<FileRef>({
        path: '/file',
        body: formData,
      });
    },
  };
}

export const tripFilesApi = createTripFilesApi();
