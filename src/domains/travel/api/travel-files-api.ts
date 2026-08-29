import { apiClient, type createApiClient } from '@/lib/api/api-client';
import {
  type ImageVariant,
  toImageVariantQuery,
} from '@/lib/api/image-variant';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'get'>;

export function createTravelFilesApi(client: ApiClientLike = apiClient) {
  return {
    downloadTravelFile(fileId: string, variant: ImageVariant = 'original') {
      return client.get<Blob>({
        path: `/assets/files/${encodeURIComponent(fileId)}`,
        query: toImageVariantQuery(variant),
        responseType: 'blob',
      });
    },
  };
}

export const travelFilesApi = createTravelFilesApi();
