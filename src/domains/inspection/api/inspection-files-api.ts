import type { FileAsset } from '@/domains/inspection/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';
import { splitIntoUploadBatches } from '@/lib/api/upload-limits';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'post'>;

type UploadProgress = {
  /** Files whose upload request has completed (successfully). */
  completed: number;
  total: number;
};

function createInspectionFilesApi(client: ApiClientLike = apiClient) {
  return {
    /**
     * Uploads `files` in request-sized batches (see
     * {@link splitIntoUploadBatches}), sequentially, and reports progress
     * after each batch completes — derivative generation runs synchronously
     * inside the upload request, so a batch can take a while and the caller
     * needs something to show while it waits (§3-⑧).
     */
    async uploadInspectionFiles(
      files: File[],
      onProgress?: (progress: UploadProgress) => void
    ): Promise<FileAsset[]> {
      const uploaded: FileAsset[] = [];

      for (const batch of splitIntoUploadBatches(files)) {
        const formData = new FormData();

        for (const file of batch) {
          formData.append('files', file);
        }

        const batchResult = await client.post<FileAsset[]>({
          path: '/assets/files',
          query: { type: 'inspection' },
          body: formData,
        });

        uploaded.push(...batchResult);
        onProgress?.({ completed: uploaded.length, total: files.length });
      }

      return uploaded;
    },
  };
}

export const inspectionFilesApi = createInspectionFilesApi();
