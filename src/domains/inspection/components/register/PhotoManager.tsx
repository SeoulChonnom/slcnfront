import { useId, useRef, useState } from 'react';
import { FileDropzone } from '@/components/ui/FileDropzone';
import type { LocalPhotoItem } from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import { buildAssetImageUrl } from '@/lib/api/asset-url';
import { cn } from '@/lib/utils/cn';

export type PhotoUploadProgress = { completed: number; total: number };

type PhotoManagerProps = {
  label: string;
  hideLabel?: boolean;
  photos: LocalPhotoItem[];
  onAddFiles: (files: File[]) => void;
  onCaptionChange: (key: string, caption: string) => void;
  onRemove: (key: string) => void;
  onReorder: (nextPhotos: LocalPhotoItem[]) => void;
  uploadProgress: PhotoUploadProgress | null;
  uploadError?: string | null;
  className?: string;
};

function photoThumbnailUrl(photo: LocalPhotoItem): string | null {
  if (photo.previewUrl) {
    return photo.previewUrl;
  }

  if (photo.fileAssetId) {
    return buildAssetImageUrl(photo.fileAssetId, 'home-thumb');
  }

  return null;
}

/**
 * Shared drop-zone + thumbnail rail for visit/property photos. Every
 * thumbnail carries a drag handle, a caption input, and a delete button
 * (screen_design.md §5.4 ②) — upload progress is always shown because
 * derivative generation is synchronous server-side (fe_implementation_decisions.md §3-⑧).
 */
export function PhotoManager({
  label,
  hideLabel,
  photos,
  onAddFiles,
  onCaptionChange,
  onRemove,
  onReorder,
  uploadProgress,
  uploadError = null,
  className,
}: PhotoManagerProps) {
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const groupLabelId = useId();

  function handleDrop(targetIndex: number) {
    const fromIndex = dragIndexRef.current;

    dragIndexRef.current = null;
    setDragOverKey(null);

    if (fromIndex === null || fromIndex === targetIndex) {
      return;
    }

    const next = [...photos];
    const [moved] = next.splice(fromIndex, 1);

    if (!moved) {
      return;
    }

    next.splice(targetIndex, 0, moved);
    onReorder(next);
  }

  return (
    <div className={cn('slcn-inspection-photo-manager', className)}>
      <FileDropzone
        label={label}
        hideLabel={hideLabel}
        multiple
        prompt='사진을 끌어다 놓거나 선택하세요'
        hint='JPG · PNG · 최대 50MB, 여러 장 선택 가능'
        files={[]}
        onFilesSelect={(files) => {
          if (files.length > 0) {
            onAddFiles(files);
          }
        }}
      />

      {uploadError ? (
        <p className='slcn-inspection-photo-manager__error' role='alert'>
          {uploadError}
        </p>
      ) : null}

      {uploadProgress ? (
        <p className='slcn-inspection-photo-manager__progress' role='status'>
          사진 업로드 중 {uploadProgress.completed}/{uploadProgress.total}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul
          className='slcn-inspection-photo-manager__list'
          aria-labelledby={hideLabel ? undefined : groupLabelId}
        >
          {photos.map((photo, index) => {
            const thumbnailUrl = photoThumbnailUrl(photo);

            return (
              <li
                key={photo.key}
                className='slcn-inspection-photo-manager__item'
                data-dragging-over={dragOverKey === photo.key}
                draggable
                onDragStart={() => {
                  dragIndexRef.current = index;
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverKey(photo.key);
                }}
                onDragLeave={() => {
                  setDragOverKey((current) =>
                    current === photo.key ? null : current
                  );
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(index);
                }}
              >
                <span
                  className='slcn-inspection-photo-manager__handle'
                  aria-hidden='true'
                  title='끌어서 순서 바꾸기'
                >
                  ⠿
                </span>
                <span className='slcn-inspection-photo-manager__thumb'>
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={photo.caption || ''}
                      loading='lazy'
                    />
                  ) : (
                    <span
                      className='slcn-inspection-photo-manager__thumb-placeholder'
                      aria-hidden='true'
                    >
                      {photo.uploading ? '업로드 중' : '사진'}
                    </span>
                  )}
                  {index === 0 ? (
                    <span className='slcn-inspection-photo-manager__cover-mark'>
                      대표
                    </span>
                  ) : null}
                </span>
                <input
                  type='text'
                  className='slcn-inspection-photo-manager__caption'
                  placeholder='캡션 (선택) — 비우면 대체 텍스트 없음'
                  value={photo.caption}
                  onChange={(event) =>
                    onCaptionChange(photo.key, event.target.value)
                  }
                  aria-label={`${index + 1}번째 사진 캡션`}
                />
                <button
                  type='button'
                  className='slcn-inspection-photo-manager__remove'
                  aria-label={`${index + 1}번째 사진 삭제`}
                  onClick={() => onRemove(photo.key)}
                >
                  삭제
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
