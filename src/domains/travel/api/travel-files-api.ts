import type { FileAsset } from '@/domains/travel/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';
import { splitIntoUploadBatches } from '@/lib/api/upload-limits';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'post'>;

export function createTravelFilesApi(client: ApiClientLike = apiClient) {
  return {
    uploadTravelFile(file: File): Promise<FileAsset> {
      const formData = new FormData();

      formData.append('file', file);

      return client.post<FileAsset>({
        path: '/assets/file',
        query: {
          type: 'travel',
        },
        body: formData,
      });
    },

    /**
     * Album uploads have no photo-count cap, so they go up in request-sized
     * batches (see {@link splitIntoUploadBatches}), one after another, and
     * the assets come back in the order the files were given.
     */
    async uploadTravelFiles(files: File[]): Promise<FileAsset[]> {
      const uploaded: FileAsset[] = [];

      for (const batch of splitIntoUploadBatches(files)) {
        const formData = new FormData();

        for (const file of batch) {
          formData.append('files', file);
        }

        const batchResult = await client.post<FileAsset[]>({
          path: '/assets/files',
          query: {
            type: 'travel',
          },
          body: formData,
        });

        uploaded.push(...batchResult);
      }

      return uploaded;
    },
  };
}

export const travelFilesApi = createTravelFilesApi();
