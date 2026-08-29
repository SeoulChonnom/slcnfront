import type { FileAsset } from '@/domains/trip/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';
import {
  type ImageVariant,
  toImageVariantQuery,
} from '@/lib/api/image-variant';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get' | 'post'>;

type TripFileUploadKind = 'logo' | 'map1' | 'map2';

function mapTripFileUploadType(kind: TripFileUploadKind): string {
  return kind === 'logo' ? 'logo' : 'map';
}

export function createTripFilesApi(client: ApiClientLike = apiClient) {
  return {
    downloadTripFile(asset: FileAsset, variant: ImageVariant = 'original') {
      return client.get<Blob>({
        path: `/assets/files/${encodeURIComponent(asset.fileId)}`,
        query: toImageVariantQuery(variant),
        responseType: 'blob',
      });
    },
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
