import { type Dispatch, type SetStateAction, useState } from 'react';
import { inspectionFilesApi } from '@/domains/inspection/api/inspection-files-api';
import type { LocalPhotoItem } from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import {
  getUploadErrorMessage,
  MAX_UPLOAD_FILE_BYTES,
} from '@/lib/api/upload-limits';

export type PhotoUploadProgress = { completed: number; total: number };

let localKeySeq = 0;

function nextLocalKey() {
  localKeySeq += 1;

  return `local-photo-${Date.now()}-${localKeySeq}`;
}

/**
 * Shared upload plumbing for both the visit-level and property-level photo
 * managers. Files upload immediately on drop (they don't need a visit/
 * property id — only linking them via a save does), so the caller sees a
 * thumbnail right away and a progress line while derivatives generate
 * server-side (fe_implementation_decisions.md §3-⑧).
 */
export function useInspectionPhotoUploader(
  setPhotos: Dispatch<SetStateAction<LocalPhotoItem[]>>
) {
  const [progress, setProgress] = useState<PhotoUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(selectedFiles: File[]) {
    // The server rejects an oversized file with a 413 that fails the whole
    // batch, so drop it here and upload the rest.
    const files = selectedFiles.filter(
      (file) => file.size <= MAX_UPLOAD_FILE_BYTES
    );
    const skippedCount = selectedFiles.length - files.length;

    setError(
      skippedCount > 0
        ? `10MB를 넘는 사진 ${skippedCount}장은 올리지 않았어요.`
        : null
    );

    if (files.length === 0) {
      return;
    }

    const localItems: LocalPhotoItem[] = files.map((file) => ({
      key: nextLocalKey(),
      file,
      caption: '',
      uploading: true,
      previewUrl:
        typeof URL.createObjectURL === 'function'
          ? URL.createObjectURL(file)
          : undefined,
    }));

    setPhotos((current) => [...current, ...localItems]);
    setProgress({ completed: 0, total: files.length });

    try {
      const uploaded = await inspectionFilesApi.uploadInspectionFiles(
        files,
        setProgress
      );

      setPhotos((current) =>
        current.map((item) => {
          const localIndex = localItems.findIndex(
            (local) => local.key === item.key
          );
          const asset = localIndex >= 0 ? uploaded[localIndex] : undefined;

          return asset
            ? { ...item, fileAssetId: asset.fileId, uploading: false }
            : item;
        })
      );
    } catch (uploadError) {
      // Upload failed — drop the placeholders so the list doesn't carry
      // permanently-stuck "업로드 중" thumbnails, and say why.
      setError(getUploadErrorMessage(uploadError));
      const failedKeys = new Set(localItems.map((item) => item.key));

      setPhotos((current) =>
        current.filter((item) => !failedKeys.has(item.key))
      );
    } finally {
      setProgress(null);
    }
  }

  function removeFile(key: string, photos: LocalPhotoItem[]) {
    const target = photos.find((item) => item.key === key);

    if (target?.previewUrl && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(target.previewUrl);
    }

    setPhotos((current) => current.filter((item) => item.key !== key));
  }

  function updateCaption(key: string, caption: string) {
    setPhotos((current) =>
      current.map((item) => (item.key === key ? { ...item, caption } : item))
    );
  }

  function reorder(next: LocalPhotoItem[]) {
    setPhotos(next);
  }

  return { progress, error, addFiles, removeFile, updateCaption, reorder };
}
