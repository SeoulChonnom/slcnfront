import type { FileAsset } from '@/domains/travel/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';

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

    uploadTravelFiles(files: File[]): Promise<FileAsset[]> {
      // No files to send — skip the request rather than issuing one with an
      // empty `files` field.
      if (files.length === 0) {
        return Promise.resolve([]);
      }

      const formData = new FormData();

      for (const file of files) {
        formData.append('files', file);
      }

      return client.post<FileAsset[]>({
        path: '/assets/files',
        query: {
          type: 'travel',
        },
        body: formData,
      });
    },
  };
}

export const travelFilesApi = createTravelFilesApi();
