import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { buildVisitDraftReason } from '@/domains/inspection/components/register/build-draft-reason';
import { RegisterStepBasicInfo } from '@/domains/inspection/components/register/RegisterStepBasicInfo';
import {
  useDeleteInspectionVisit,
  useInspectionVisitForEdit,
  useReorderInspectionVisitImages,
  useUpdateInspectionVisit,
  useUpdateInspectionVisitStatus,
} from '@/domains/inspection/hooks/inspection-queries';
import { useInspectionPhotoUploader } from '@/domains/inspection/hooks/useInspectionPhotoUploader';
import {
  buildVisitFilesPayload,
  combineVisitedAt,
  type LocalPhotoItem,
  type VisitBasicFormValues,
} from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import { AppError } from '@/lib/api/errors';
import { buildDeviceInspectionAreaDetailPath } from '@/lib/routing/route-builders';

type InspectionVisitEditSectionProps = {
  device: DeviceType;
  areaId: string;
  visitId: string;
};

function splitVisitedAt(visitedAt: string): { date: string; time: string } {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(visitedAt);

  return match ? { date: match[1], time: match[2] } : { date: '', time: '' };
}

function formatSavedAtLabel(date: Date | null): string {
  if (!date) {
    return '';
  }

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${hh}:${mm}에 저장됨`;
}

/**
 * Standalone edit for an existing visit's basic info — reached from the
 * area detail rail, not from the register wizard. Reuses
 * `RegisterStepBasicInfo` since the field set is identical
 * (screen_design.md §5.4 ②).
 */
export function InspectionVisitEditSection({
  device,
  areaId,
  visitId,
}: InspectionVisitEditSectionProps) {
  const navigate = useNavigate();
  // §3-⑥: no optimistic locking, so an edit entry always refetches fresh.
  const visitQuery = useInspectionVisitForEdit(visitId);
  const updateMutation = useUpdateInspectionVisit(visitId);
  const statusMutation = useUpdateInspectionVisitStatus(visitId);
  const deleteMutation = useDeleteInspectionVisit();
  const reorderImagesMutation = useReorderInspectionVisitImages(visitId);

  const hydratedRef = useRef(false);
  const [values, setValues] = useState<VisitBasicFormValues | null>(null);
  const [photos, setPhotos] = useState<LocalPhotoItem[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const photoUploader = useInspectionPhotoUploader(setPhotos);

  const detail = visitQuery.data;

  useEffect(() => {
    if (hydratedRef.current || !detail) {
      return;
    }

    hydratedRef.current = true;
    const { date, time } = splitVisitedAt(detail.visitedAt);

    setValues({
      visitedAtDate: date,
      visitedAtTime: time,
      revisitIntent: detail.revisitIntent,
      oneLineReview: detail.oneLineReview ?? '',
      memo: detail.memo ?? '',
      pros: detail.pros ?? '',
      cons: detail.cons ?? '',
      tags: detail.tags,
    });
    setPhotos(
      detail.photos.map((photo) => ({
        key: photo.id,
        id: photo.id,
        fileAssetId: photo.fileAssetId,
        caption: photo.caption ?? '',
      }))
    );
  }, [detail]);

  const pendingSnapshotRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!values) {
      return;
    }

    const snapshot = JSON.stringify({ values, photos });

    if (pendingSnapshotRef.current === snapshot) {
      return;
    }

    pendingSnapshotRef.current = snapshot;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void save(values, photos);
    }, 800);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, photos]);

  async function save(
    next: VisitBasicFormValues,
    nextPhotos: LocalPhotoItem[]
  ) {
    const visitedAt = combineVisitedAt(next.visitedAtDate, next.visitedAtTime);

    if (!visitedAt) {
      return;
    }

    setSaveError(null);

    try {
      const response = await updateMutation.mutateAsync({
        visitedAt,
        memo: next.memo.trim() || undefined,
        revisitIntent: next.revisitIntent ?? undefined,
        oneLineReview: next.oneLineReview.trim() || undefined,
        pros: next.pros.trim() || undefined,
        cons: next.cons.trim() || undefined,
        tags: next.tags,
        files: buildVisitFilesPayload(nextPhotos),
      });

      setPhotos((current) =>
        current.map((photo) => {
          const matched = response.photos.find(
            (item) => item.fileAssetId === photo.fileAssetId
          );

          return matched ? { ...photo, id: matched.id } : photo;
        })
      );
      setLastSavedAt(new Date());
    } catch (error) {
      setSaveError(
        error instanceof AppError
          ? error.message
          : '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.'
      );
    }
  }

  function handleReorderPhotos(next: LocalPhotoItem[]) {
    photoUploader.reorder(next);

    if (next.every((photo) => photo.id)) {
      reorderImagesMutation.mutate(
        next.map((photo, index) => ({
          id: photo.id as string,
          sortOrder: index,
        }))
      );
    }
  }

  async function handleToggleStatus() {
    if (!detail) {
      return;
    }

    setStatusError(null);

    try {
      await statusMutation.mutateAsync(
        detail.status === 'COMPLETED' ? 'DRAFT' : 'COMPLETED'
      );
    } catch (error) {
      setStatusError(
        error instanceof AppError ? error.message : '상태를 바꾸지 못했어요.'
      );
    }
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(visitId);
    setIsDeleteConfirmOpen(false);
    navigate(buildDeviceInspectionAreaDetailPath(device, areaId));
  }

  if (visitQuery.isLoading || !values) {
    return (
      <section data-device={device} className='slcn-inspection-register'>
        <Skeleton className='slcn-inspection-register-skeleton' />
      </section>
    );
  }

  if (visitQuery.isError || !detail) {
    return (
      <section data-device={device} className='slcn-inspection-register'>
        <ErrorState
          title='임장 기록을 불러오지 못했어요'
          onRetry={() => visitQuery.refetch()}
        />
      </section>
    );
  }

  return (
    <section data-device={device} className='slcn-inspection-register'>
      <p className='slcn-inspection-property-edit__breadcrumb'>
        <Link to={buildDeviceInspectionAreaDetailPath(device, areaId)}>
          {detail.area.name}
        </Link>
      </p>
      <h1 className='slcn-inspection-register__title'>임장 기록 수정</h1>

      <Card className='slcn-inspection-register__card'>
        <RegisterStepBasicInfo
          values={values}
          onFieldChange={(key, value) =>
            setValues((current) =>
              current ? { ...current, [key]: value } : current
            )
          }
          photos={photos}
          onAddPhotoFiles={(files) => void photoUploader.addFiles(files)}
          onCaptionChange={photoUploader.updateCaption}
          onRemovePhoto={(key) => photoUploader.removeFile(key, photos)}
          onReorderPhotos={handleReorderPhotos}
          photoUploadProgress={photoUploader.progress}
          savedAtLabel={formatSavedAtLabel(lastSavedAt)}
          errors={{}}
        />

        {saveError ? (
          <p className='slcn-inspection-register__error' role='alert'>
            {saveError}
          </p>
        ) : null}
        {statusError ? (
          <p className='slcn-inspection-register__error' role='alert'>
            {statusError}
          </p>
        ) : null}

        {detail.status === 'DRAFT' ? (
          <p className='slcn-inspection-register-step__hint' role='status'>
            {buildVisitDraftReason(detail.incompleteSummary) ||
              '완료 조건은 이미 채워져 있어요 — 아래 버튼으로 완료할 수 있어요.'}
          </p>
        ) : null}

        <div className='slcn-inspection-property-edit__actions'>
          <Button variant='danger' onClick={() => setIsDeleteConfirmOpen(true)}>
            임장 기록 삭제
          </Button>
          <span className='slcn-inspection-property-edit__actions-spacer' />
          <Button
            variant='secondary'
            loading={statusMutation.isPending}
            onClick={() => void handleToggleStatus()}
          >
            {detail.status === 'COMPLETED'
              ? '작성 중으로 되돌리기'
              : '지금 상태로 완료 시도'}
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title='이 임장 기록을 삭제할까요?'
        description={`매물 ${detail.properties.length}건과 사진 ${detail.photos.length}장이 함께 삭제돼요.`}
        confirmLabel='삭제'
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        isConfirming={deleteMutation.isPending}
      />
    </section>
  );
}
