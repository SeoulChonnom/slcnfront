import type { FileAsset } from '@/domains/inspection/types';
import { apiClient, type createApiClient } from '@/lib/api/api-client';

type ApiClientLike = Pick<ReturnType<typeof createApiClient>, 'post'>;

/**
 * multipart cap is 10MB/file, 60MB/request, and inspection visits regularly
 * carry ~30 photos, so uploads are split into batches of this size (see
 * fe_implementation_decisions.md §3-⑧ and api.md §7①). Uploading more in one
 * request risks a `413`.
 */
export const INSPECTION_UPLOAD_BATCH_SIZE = 6;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export type UploadProgress = {
  /** Files whose upload request has completed (successfully). */
  completed: number;
  total: number;
};

export function createInspectionFilesApi(client: ApiClientLike = apiClient) {
  return {
    /**
     * Uploads `files` in batches of {@link INSPECTION_UPLOAD_BATCH_SIZE},
     * sequentially, and reports progress after each batch completes —
     * derivative generation runs synchronously inside the upload request, so
     * a 6-photo batch can take a while and the caller needs something to
     * show while it waits (§3-⑧).
     */
    async uploadInspectionFiles(
      files: File[],
      onProgress?: (progress: UploadProgress) => void
    ): Promise<FileAsset[]> {
      if (files.length === 0) {
        return [];
      }

      const batches = chunk(files, INSPECTION_UPLOAD_BATCH_SIZE);
      const uploaded: FileAsset[] = [];

      for (const batch of batches) {
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
