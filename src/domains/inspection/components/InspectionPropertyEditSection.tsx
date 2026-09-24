import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { InterestStarsInput } from '@/domains/inspection/components/InterestStars';
import { PhotoManager } from '@/domains/inspection/components/register/PhotoManager';
import { PropertyAnswerFields } from '@/domains/inspection/components/register/PropertyAnswerFields';
import {
  useDeleteInspectionProperty,
  useInspectionComplexNames,
  useInspectionVisitProperty,
  useSaveInspectionPropertyAnswers,
  useUpdateInspectionProperty,
  useUpdateInspectionPropertyStatus,
} from '@/domains/inspection/hooks/inspection-queries';
import { useInspectionPhotoUploader } from '@/domains/inspection/hooks/useInspectionPhotoUploader';
import {
  buildVisitFilesPayload,
  type LocalPhotoItem,
} from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import { buildPropertyAnswerPayload } from '@/domains/inspection/mappers/inspection-mappers';
import type {
  PropertyAnswer,
  PropertyAnswerInput,
} from '@/domains/inspection/types';
import { formatVisitedAt } from '@/domains/inspection/utils/inspection-format';
import { AppError } from '@/lib/api/errors';
import {
  buildDeviceInspectionAreaDetailPath,
  buildDeviceInspectionRegisterPath,
} from '@/lib/routing/route-builders';

type InspectionPropertyEditSectionProps = {
  device: DeviceType;
  areaId: string;
  visitId: string;
  propertyId: string;
};

type BasicFields = {
  complexName: string;
  name: string;
  interestLevel: number | null;
  oneLineReview: string;
  memo: string;
  pros: string;
  cons: string;
  tags: string[];
};

function isAnswerFilled(answer: PropertyAnswer): boolean {
  return answer.answered;
}

/**
 * ③-1 매물 편집 — screen_design.md §5.4. Also reached directly via
 * `buildDeviceInspectionPropertyEditPath`, so it does not assume it was
 * opened from the register wizard.
 */
export function InspectionPropertyEditSection({
  device,
  areaId,
  visitId,
  propertyId,
}: InspectionPropertyEditSectionProps) {
  const navigate = useNavigate();
  const propertyQuery = useInspectionVisitProperty(visitId, propertyId);
  const updateMutation = useUpdateInspectionProperty(visitId, propertyId);
  const statusMutation = useUpdateInspectionPropertyStatus(visitId, propertyId);
  const deleteMutation = useDeleteInspectionProperty(visitId);
  const answersMutation = useSaveInspectionPropertyAnswers(visitId, propertyId);
  const complexNamesQuery = useInspectionComplexNames(visitId, 'AREA');

  const hydratedRef = useRef(false);
  const [fields, setFields] = useState<BasicFields | null>(null);
  const [photos, setPhotos] = useState<LocalPhotoItem[]>([]);
  const [answers, setAnswers] = useState<PropertyAnswer[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const photoUploader = useInspectionPhotoUploader(setPhotos);

  const detail = propertyQuery.data;

  useEffect(() => {
    if (hydratedRef.current || !detail) {
      return;
    }

    hydratedRef.current = true;
    setFields({
      complexName: detail.complexName,
      name: detail.name,
      interestLevel: detail.interestLevel,
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
    setAnswers(detail.answers);
  }, [detail]);

  const pendingSnapshotRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!fields) {
      return;
    }

    const snapshot = JSON.stringify({ fields, photos });

    if (pendingSnapshotRef.current === snapshot) {
      return;
    }

    pendingSnapshotRef.current = snapshot;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void save(fields, photos);
    }, 800);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, photos]);

  async function save(next: BasicFields, nextPhotos: LocalPhotoItem[]) {
    setSaveError(null);

    try {
      const response = await updateMutation.mutateAsync({
        complexName: next.complexName.trim(),
        name: next.name.trim(),
        interestLevel: next.interestLevel ?? undefined,
        oneLineReview: next.oneLineReview.trim() || undefined,
        memo: next.memo.trim() || undefined,
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
    } catch (error) {
      setSaveError(
        error instanceof AppError
          ? error.message
          : '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.'
      );
    }
  }

  const answerTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  function handleAnswerChange(questionId: string, input: PropertyAnswerInput) {
    setAnswers((current) =>
      current.map((answer) => {
        if (answer.questionId !== questionId) {
          return answer;
        }

        const next: PropertyAnswer = {
          ...answer,
          textValue:
            input.answerType === 'TEXT' || input.answerType === 'LONG_TEXT'
              ? input.value
              : answer.textValue,
          booleanValue:
            input.answerType === 'BOOLEAN' ? input.value : answer.booleanValue,
          numberValue:
            input.answerType === 'NUMBER' ? input.value : answer.numberValue,
          ratingValue:
            input.answerType === 'RATING' ? input.value : answer.ratingValue,
          selectedCodes:
            input.answerType === 'SINGLE_SELECT' ||
            input.answerType === 'MULTI_SELECT'
              ? (input.value ?? [])
              : answer.selectedCodes,
          answered: input.value !== null,
        };

        return next;
      })
    );

    const payload = buildPropertyAnswerPayload(questionId, input);
    const immediate =
      input.answerType !== 'TEXT' && input.answerType !== 'LONG_TEXT';

    if (answerTimersRef.current[questionId]) {
      clearTimeout(answerTimersRef.current[questionId]);
    }

    if (immediate) {
      answersMutation.mutate([payload]);

      return;
    }

    answerTimersRef.current[questionId] = setTimeout(() => {
      answersMutation.mutate([payload]);
    }, 700);
  }

  const canComplete = useMemo(() => {
    if (!fields) {
      return false;
    }

    const requiredOk =
      Boolean(fields.complexName.trim()) &&
      Boolean(fields.name.trim()) &&
      fields.interestLevel !== null;
    const answersOk = answers
      .filter((answer) => answer.required)
      .every(isAnswerFilled);

    return requiredOk && answersOk;
  }, [fields, answers]);

  function addTag(nameRaw: string) {
    const name = nameRaw.trim();

    if (!fields || !name || fields.tags.includes(name)) {
      return;
    }

    setFields({ ...fields, tags: [...fields.tags, name] });
  }

  function removeTag(name: string) {
    if (!fields) {
      return;
    }

    setFields({ ...fields, tags: fields.tags.filter((tag) => tag !== name) });
  }

  function backToRegister() {
    navigate(`${buildDeviceInspectionRegisterPath(device)}?draft=${visitId}`);
  }

  async function handleSaveAsDraft() {
    if (fields) {
      await save(fields, photos);
    }

    if (detail?.status === 'COMPLETED') {
      await statusMutation.mutateAsync('DRAFT');
    }
  }

  async function handleComplete() {
    setCompleteError(null);

    if (fields) {
      await save(fields, photos);
    }

    try {
      await statusMutation.mutateAsync('COMPLETED');
      backToRegister();
    } catch (error) {
      setCompleteError(
        error instanceof AppError
          ? error.message
          : '완료할 수 없어요. 잠시 뒤 다시 시도해 주세요.'
      );
    }
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(propertyId);
    setIsDeleteConfirmOpen(false);
    backToRegister();
  }

  if (propertyQuery.isLoading || !fields) {
    return (
      <section data-device={device} className='slcn-inspection-property-edit'>
        <Skeleton className='slcn-inspection-register-skeleton' />
      </section>
    );
  }

  if (propertyQuery.isError || !detail) {
    return (
      <section data-device={device} className='slcn-inspection-property-edit'>
        <ErrorState
          title='매물을 불러오지 못했어요'
          description='삭제됐거나 잘못된 링크일 수 있어요.'
          onRetry={() => propertyQuery.refetch()}
        />
      </section>
    );
  }

  return (
    <section data-device={device} className='slcn-inspection-property-edit'>
      <p className='slcn-inspection-property-edit__breadcrumb'>
        <Link to={buildDeviceInspectionAreaDetailPath(device, areaId)}>
          {detail.areaName}
        </Link>{' '}
        · {formatVisitedAt(detail.visitedAt)}
      </p>
      <h1 className='slcn-inspection-register__title'>매물 편집</h1>

      <Card className='slcn-inspection-register__card'>
        <TextField
          label='단지/건물명'
          required
          list='property-edit-complex-name-options'
          hint='같은 이름이어야 회차 간 매물이 연결됩니다.'
          value={fields.complexName}
          onChange={(event) =>
            setFields({ ...fields, complexName: event.target.value })
          }
        />
        <datalist id='property-edit-complex-name-options'>
          {(complexNamesQuery.data ?? []).map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        <TextField
          label='매물명'
          required
          value={fields.name}
          onChange={(event) =>
            setFields({ ...fields, name: event.target.value })
          }
        />

        <div>
          <span className='slcn-field__label'>
            관심도 <span aria-hidden='true'>*</span>
          </span>
          <InterestStarsInput
            value={fields.interestLevel}
            onChange={(value) => setFields({ ...fields, interestLevel: value })}
          />
        </div>

        <TextField
          label='한줄평'
          hint='선택 입력'
          value={fields.oneLineReview}
          onChange={(event) =>
            setFields({ ...fields, oneLineReview: event.target.value })
          }
        />

        <label className='slcn-field'>
          <span className='slcn-field__label'>메모</span>
          <textarea
            className='slcn-field__textarea slcn-inspection-register-textarea'
            value={fields.memo}
            onChange={(event) =>
              setFields({ ...fields, memo: event.target.value })
            }
          />
        </label>

        <div className='slcn-inspection-register-pros-cons'>
          <label className='slcn-field'>
            <span className='slcn-field__label'>장점</span>
            <textarea
              className='slcn-field__textarea slcn-inspection-register-textarea'
              value={fields.pros}
              onChange={(event) =>
                setFields({ ...fields, pros: event.target.value })
              }
            />
          </label>
          <label className='slcn-field'>
            <span className='slcn-field__label'>단점</span>
            <textarea
              className='slcn-field__textarea slcn-inspection-register-textarea'
              value={fields.cons}
              onChange={(event) =>
                setFields({ ...fields, cons: event.target.value })
              }
            />
          </label>
        </div>

        <div className='slcn-inspection-register-tags'>
          <span className='slcn-field__label'>태그</span>
          <TextField
            value={tagInput}
            placeholder='태그를 입력하고 Enter'
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTag(tagInput);
                setTagInput('');
              }
            }}
          />
          {fields.tags.length > 0 ? (
            <ul className='slcn-inspection-register-tags__list'>
              {fields.tags.map((tag) => (
                <li key={tag}>
                  <button
                    type='button'
                    className='slcn-inspection-tag-chip'
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <PhotoManager
          label='매물 사진'
          photos={photos}
          onAddFiles={(files) => void photoUploader.addFiles(files)}
          onCaptionChange={photoUploader.updateCaption}
          onRemove={(key) => photoUploader.removeFile(key, photos)}
          onReorder={photoUploader.reorder}
          uploadProgress={photoUploader.progress}
        />

        <PropertyAnswerFields
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />

        {saveError ? (
          <p className='slcn-inspection-register__error' role='alert'>
            {saveError}
          </p>
        ) : null}

        {!canComplete ? (
          <p
            className='slcn-inspection-register-completion__server-message'
            role='status'
          >
            단지명·매물명·관심도와 필수 문답을 모두 채우면 완료할 수 있어요.
          </p>
        ) : null}

        {completeError ? (
          <p className='slcn-inspection-register__error' role='alert'>
            {completeError}
          </p>
        ) : null}

        <div className='slcn-inspection-property-edit__actions'>
          <Button variant='danger' onClick={() => setIsDeleteConfirmOpen(true)}>
            매물 삭제
          </Button>
          <span className='slcn-inspection-property-edit__actions-spacer' />
          <Button variant='secondary' onClick={() => void handleSaveAsDraft()}>
            작성 중으로 저장
          </Button>
          <Button
            disabled={!canComplete}
            loading={statusMutation.isPending}
            onClick={() => void handleComplete()}
          >
            매물 완료
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title='이 매물을 삭제할까요?'
        description='적어 둔 메모, 사진, 문답이 모두 함께 사라져요.'
        confirmLabel='삭제'
        onConfirm={() => void handleDelete()}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        isConfirming={deleteMutation.isPending}
      />
    </section>
  );
}
