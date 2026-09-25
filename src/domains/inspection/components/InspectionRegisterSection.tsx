import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { CompletionChecklist } from '@/domains/inspection/components/register/CompletionChecklist';
import { RegisterStepArea } from '@/domains/inspection/components/register/RegisterStepArea';
import { RegisterStepBasicInfo } from '@/domains/inspection/components/register/RegisterStepBasicInfo';
import { RegisterStepProperties } from '@/domains/inspection/components/register/RegisterStepProperties';
import {
  useInspectionVisit,
  useReorderInspectionVisitImages,
} from '@/domains/inspection/hooks/inspection-queries';
import { useInspectionPhotoUploader } from '@/domains/inspection/hooks/useInspectionPhotoUploader';
import {
  type RegisterWizardStep,
  useInspectionRegisterWizard,
} from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import {
  buildDeviceInspectionAreaDetailPath,
  buildDeviceInspectionAreaListPath,
} from '@/lib/routing/route-builders';

type InspectionRegisterSectionProps = {
  device: DeviceType;
};

const STEP_LABELS: { step: RegisterWizardStep; label: string }[] = [
  { step: 1, label: '지역' },
  { step: 2, label: '기본 정보' },
  { step: 3, label: '확인 매물' },
];

function formatSavedAtLabel(date: Date | null): string {
  if (!date) {
    return '';
  }

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${hh}:${mm}에 임시 저장됨`;
}

/**
 * 3단계 마법사(①지역 → ②기본 정보 → ③확인 매물) + ④완료 검증.
 * screen_design.md §5.4 / fe_implementation_decisions.md §5.
 */
export function InspectionRegisterSection({
  device,
}: InspectionRegisterSectionProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftVisitId = searchParams.get('draft');
  const [completionResult, setCompletionResult] = useState<{
    message: string | null;
  } | null>(null);

  const wizard = useInspectionRegisterWizard({ draftVisitId });
  const photoUploader = useInspectionPhotoUploader(wizard.setPhotos);
  const visitDetailQuery = useInspectionVisit(wizard.visitId ?? undefined);
  const reorderImagesMutation = useReorderInspectionVisitImages(
    wizard.visitId ?? ''
  );

  /**
   * Pure drag-reorder goes through the dedicated endpoint (cheaper than a
   * full visit PUT) once every photo has a persisted FileBoxItem id; before
   * that (still local-only, or mid-upload) it just reorders in memory and
   * the next autosave PUT carries the new order.
   */
  function handleReorderPhotos(next: typeof wizard.photos) {
    photoUploader.reorder(next);

    const canPersistOrderDirectly =
      wizard.visitId && next.every((photo) => photo.id);

    if (canPersistOrderDirectly) {
      reorderImagesMutation.mutate(
        next.map((photo, index) => ({
          id: photo.id as string,
          sortOrder: index,
        }))
      );
    }
  }

  if (wizard.isDraftLoading) {
    return (
      <section data-device={device} className='slcn-inspection-register'>
        <Skeleton className='slcn-inspection-register-skeleton' />
      </section>
    );
  }

  if (wizard.draftLoadError) {
    return (
      <section data-device={device} className='slcn-inspection-register'>
        <ErrorState
          title='이어서 쓸 기록을 불러오지 못했어요'
          description='링크가 잘못됐거나 삭제된 기록일 수 있어요.'
          onRetry={() => navigate(buildDeviceInspectionAreaListPath(device))}
        />
      </section>
    );
  }

  async function handleAttemptComplete() {
    const result = await wizard.attemptComplete();

    if (result.ok) {
      const areaId = visitDetailQuery.data?.area.areaId;

      navigate(
        areaId
          ? buildDeviceInspectionAreaDetailPath(device, areaId)
          : buildDeviceInspectionAreaListPath(device)
      );

      return;
    }

    setCompletionResult({ message: result.message });
  }

  const draftProperties = (visitDetailQuery.data?.properties ?? []).filter(
    (property) => property.status === 'DRAFT'
  );

  return (
    <section data-device={device} className='slcn-inspection-register'>
      {device === 'main' ? (
        <h1 className='slcn-inspection-register__title'>임장 기록하기</h1>
      ) : (
        <h1 className='slcn-visually-hidden'>임장 기록하기</h1>
      )}

      <Card className='slcn-inspection-register__card'>
        <ol
          className='slcn-inspection-register__step-indicator'
          aria-label='임장 기록 단계'
        >
          {STEP_LABELS.map(({ step, label }) => {
            const state =
              step < wizard.step
                ? 'complete'
                : step === wizard.step
                  ? 'current'
                  : 'upcoming';

            return (
              <li
                key={step}
                data-state={state}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <button
                  type='button'
                  disabled={state === 'upcoming' && !wizard.visitId}
                  onClick={() => wizard.setStep(step)}
                >
                  <span aria-hidden='true'>{step}</span> {label}
                </button>
              </li>
            );
          })}
        </ol>

        {wizard.step === 1 ? (
          <RegisterStepArea
            value={wizard.areaChoice}
            onChange={wizard.setAreaChoice}
            error={wizard.stepErrors.area}
          />
        ) : null}

        {wizard.step === 2 ? (
          <RegisterStepBasicInfo
            values={wizard.basicValues}
            onFieldChange={wizard.updateBasicField}
            photos={wizard.photos}
            onAddPhotoFiles={(files) => void photoUploader.addFiles(files)}
            onCaptionChange={photoUploader.updateCaption}
            onRemovePhoto={(key) =>
              photoUploader.removeFile(key, wizard.photos)
            }
            onReorderPhotos={handleReorderPhotos}
            photoUploadProgress={photoUploader.progress}
            photoUploadError={photoUploader.error}
            savedAtLabel={formatSavedAtLabel(wizard.lastSavedAt)}
            errors={wizard.stepErrors}
          />
        ) : null}

        {wizard.step === 3 && wizard.visitId ? (
          <RegisterStepProperties device={device} visitId={wizard.visitId} />
        ) : null}

        {wizard.saveErrorMessage ? (
          <p className='slcn-inspection-register__error' role='alert'>
            {wizard.saveErrorMessage}
          </p>
        ) : null}

        <div className='slcn-inspection-register__actions'>
          <Button
            variant='ghost'
            onClick={() => navigate(buildDeviceInspectionAreaListPath(device))}
          >
            나가기
          </Button>
          {wizard.step > 1 ? (
            <Button variant='secondary' onClick={wizard.goPrev}>
              이전
            </Button>
          ) : null}
          {wizard.step < 3 ? (
            <span className='slcn-inspection-register__next-group'>
              {!wizard.canAdvance && wizard.advanceBlockedReason ? (
                <span
                  className='slcn-inspection-register__next-reason'
                  role='status'
                >
                  {wizard.advanceBlockedReason}
                </span>
              ) : null}
              <Button disabled={!wizard.canAdvance} onClick={wizard.goNext}>
                다음
              </Button>
            </span>
          ) : (
            <Button
              loading={wizard.isCompleting}
              onClick={() => void handleAttemptComplete()}
            >
              임장 완료
            </Button>
          )}
        </div>
      </Card>

      {completionResult ? (
        <CompletionChecklist
          device={device}
          areaId={visitDetailQuery.data?.area.areaId ?? ''}
          visitId={wizard.visitId ?? ''}
          areaName={wizard.areaName}
          visitedAt={
            visitDetailQuery.data?.visitedAt ??
            `${wizard.basicValues.visitedAtDate}T${wizard.basicValues.visitedAtTime}`
          }
          revisitIntent={wizard.basicValues.revisitIntent}
          draftProperties={draftProperties}
          serverMessage={completionResult.message}
          onDismiss={() => setCompletionResult(null)}
        />
      ) : null}
    </section>
  );
}
