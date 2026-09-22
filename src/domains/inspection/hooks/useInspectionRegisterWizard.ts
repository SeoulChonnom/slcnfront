import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useCreateInspectionVisit,
  useInspectionVisitForEdit,
  useUpdateInspectionVisit,
  useUpdateInspectionVisitStatus,
} from '@/domains/inspection/hooks/inspection-queries';
import type {
  FileBoxItem,
  InspectionFileBoxItemUdo,
  InspectionVisitCdo,
  InspectionVisitDetail,
  InspectionVisitUdo,
  RevisitIntent,
} from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';

export type RegisterWizardStep = 1 | 2 | 3;

export type AreaChoice =
  | { kind: 'existing'; areaId: string; name: string }
  | { kind: 'new'; name: string; description: string };

export type LocalPhotoItem = {
  /** Stable local key — never sent to the server. */
  key: string;
  /** Set once this item has an FileBoxItem id from a saved visit. */
  id?: string;
  /** Set once the underlying file finished uploading. */
  fileAssetId?: string;
  /** Present while the file is still local / uploading. */
  file?: File;
  previewUrl?: string;
  caption: string;
  uploading?: boolean;
};

export type VisitBasicFormValues = {
  visitedAtDate: string;
  visitedAtTime: string;
  revisitIntent: RevisitIntent | null;
  oneLineReview: string;
  memo: string;
  pros: string;
  cons: string;
  tags: string[];
};

function createInitialBasicValues(): VisitBasicFormValues {
  return {
    visitedAtDate: '',
    visitedAtTime: '',
    revisitIntent: null,
    oneLineReview: '',
    memo: '',
    pros: '',
    cons: '',
    tags: [],
  };
}

function fileBoxItemToLocalPhoto(item: FileBoxItem): LocalPhotoItem {
  return {
    key: item.id,
    id: item.id,
    fileAssetId: item.fileAssetId,
    caption: item.caption ?? '',
  };
}

/** Builds the `files` replacement group in current on-screen order — first item is always the cover (screen_design.md doesn't call out a separate cover picker for this flow). */
export function buildVisitFilesPayload(
  photos: LocalPhotoItem[]
): InspectionFileBoxItemUdo[] {
  return photos
    .filter((photo): photo is LocalPhotoItem & { fileAssetId: string } =>
      Boolean(photo.fileAssetId)
    )
    .map((photo, index) => ({
      ...(photo.id ? { id: photo.id } : {}),
      fileAssetId: photo.fileAssetId,
      role: index === 0 ? ('COVER' as const) : ('GALLERY' as const),
      caption: photo.caption.trim() || undefined,
    }));
}

export function combineVisitedAt(date: string, time: string): string {
  if (!date || !time) {
    return '';
  }

  return `${date}T${time}`;
}

function splitVisitedAt(visitedAt: string): { date: string; time: string } {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(visitedAt);

  if (!match) {
    return { date: '', time: '' };
  }

  return { date: match[1], time: match[2] };
}

const AUTOSAVE_DEBOUNCE_MS = 900;

type UseInspectionRegisterWizardOptions = {
  draftVisitId: string | null;
};

/**
 * Owns the whole register-flow state machine: ①지역 선택(로컬) → ②기본 정보
 * (visitedAt이 채워지기 전까지는 로컬 초안만 유지 — fe_implementation_decisions.md
 * §5) → ③확인 매물(뒤에서 서버 데이터를 직접 구독). 완료 검증(④)은 이 훅이
 * 노출하는 `attemptComplete`가 그대로 서버에 물어보고 결과를 돌려준다.
 */
export function useInspectionRegisterWizard({
  draftVisitId,
}: UseInspectionRegisterWizardOptions) {
  const [step, setStep] = useState<RegisterWizardStep>(draftVisitId ? 3 : 1);
  const [areaChoice, setAreaChoice] = useState<AreaChoice | null>(null);
  const [visitId, setVisitId] = useState<string | null>(null);
  const [basicValues, setBasicValues] = useState<VisitBasicFormValues>(
    createInitialBasicValues
  );
  const [photos, setPhotos] = useState<LocalPhotoItem[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const hydratedRef = useRef(false);
  const savingRef = useRef(false);
  const pendingSnapshotRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftVisitQuery = useInspectionVisitForEdit(draftVisitId ?? undefined);
  const createVisitMutation = useCreateInspectionVisit();
  const updateVisitMutation = useUpdateInspectionVisit(visitId ?? '');
  const updateVisitStatusMutation = useUpdateInspectionVisitStatus(
    visitId ?? ''
  );

  // Hydrate once from a `?draft=` visit — never again, so autosave edits are
  // never clobbered by a background refetch of the same query.
  useEffect(() => {
    if (hydratedRef.current || !draftVisitQuery.data) {
      return;
    }

    hydratedRef.current = true;

    const detail = draftVisitQuery.data;
    const { date, time } = splitVisitedAt(detail.visitedAt);

    setAreaChoice({
      kind: 'existing',
      areaId: detail.area.areaId,
      name: detail.area.name,
    });
    setVisitId(detail.visitId);
    setBasicValues({
      visitedAtDate: date,
      visitedAtTime: time,
      revisitIntent: detail.revisitIntent,
      oneLineReview: detail.oneLineReview ?? '',
      memo: detail.memo ?? '',
      pros: detail.pros ?? '',
      cons: detail.cons ?? '',
      tags: detail.tags,
    });
    setPhotos(detail.photos.map(fileBoxItemToLocalPhoto));
    setLastSavedAt(new Date());
    setStep(3);
  }, [draftVisitQuery.data]);

  const visitedAt = combineVisitedAt(
    basicValues.visitedAtDate,
    basicValues.visitedAtTime
  );
  const hasStartedSaving = visitId !== null || lastSavedAt !== null;

  const flush = useCallback(async () => {
    if (!visitedAt) {
      // §5: nothing is sent to the server until visitedAt is filled in.
      return;
    }

    if (savingRef.current) {
      // A save is already in flight — it will pick up the latest snapshot
      // once `pendingSnapshotRef` is re-checked by the caller's own retry.
      return;
    }

    if (!areaChoice) {
      return;
    }

    savingRef.current = true;
    setSaveErrorMessage(null);

    const commonFields = {
      visitedAt,
      memo: basicValues.memo.trim() || undefined,
      revisitIntent: basicValues.revisitIntent ?? undefined,
      oneLineReview: basicValues.oneLineReview.trim() || undefined,
      pros: basicValues.pros.trim() || undefined,
      cons: basicValues.cons.trim() || undefined,
      tags: basicValues.tags,
      files: buildVisitFilesPayload(photos),
    };

    try {
      let detail: InspectionVisitDetail;

      if (!visitId) {
        const payload: InspectionVisitCdo = {
          ...(areaChoice.kind === 'existing'
            ? { areaId: areaChoice.areaId }
            : {
                area: {
                  name: areaChoice.name,
                  description: areaChoice.description.trim() || undefined,
                },
              }),
          ...commonFields,
        };

        detail = await createVisitMutation.mutateAsync(payload);
        setVisitId(detail.visitId);
      } else {
        const payload: InspectionVisitUdo = commonFields;

        detail = await updateVisitMutation.mutateAsync(payload);
      }

      // Adopt server-assigned file ids so later saves send `id` and don't
      // create duplicate FileBoxItem rows.
      setPhotos((current) =>
        current.map((photo) => {
          const matched = detail.photos.find(
            (item) => item.fileAssetId === photo.fileAssetId
          );

          return matched ? { ...photo, id: matched.id } : photo;
        })
      );
      setLastSavedAt(new Date());
    } catch (error) {
      setSaveErrorMessage(
        error instanceof AppError
          ? error.message
          : '자동 저장에 실패했어요. 잠시 뒤 다시 시도해 주세요.'
      );
    } finally {
      savingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitedAt, areaChoice, visitId, basicValues, photos]);

  // Debounced autosave: any change to the snapshot below schedules a save.
  useEffect(() => {
    const snapshot = JSON.stringify({
      visitedAt,
      areaChoice,
      basicValues,
      photos,
    });

    if (pendingSnapshotRef.current === snapshot) {
      return;
    }

    pendingSnapshotRef.current = snapshot;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      void flush();
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitedAt, areaChoice, basicValues, photos]);

  function updateBasicField<Key extends keyof VisitBasicFormValues>(
    key: Key,
    value: VisitBasicFormValues[Key]
  ) {
    setBasicValues((current) => ({ ...current, [key]: value }));
    setStepErrors((current) => {
      if (!(key in current)) {
        return current;
      }

      const next = { ...current };
      delete next[key];

      return next;
    });
  }

  function validateStep1(): boolean {
    if (!areaChoice) {
      setStepErrors({ area: '먼저 지역을 고르거나 새로 만들어 주세요.' });

      return false;
    }

    if (areaChoice.kind === 'new' && !areaChoice.name.trim()) {
      setStepErrors({ area: '지역명을 입력해 주세요.' });

      return false;
    }

    setStepErrors({});

    return true;
  }

  function validateStep2(): boolean {
    const errors: Record<string, string> = {};

    if (!visitedAt) {
      errors.visitedAt = '임장 일시를 입력해 주세요.';
    }

    if (!basicValues.revisitIntent) {
      errors.revisitIntent = '재방문 의사를 선택해 주세요.';
    }

    setStepErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (step === 1 && !validateStep1()) {
      return;
    }

    if (step === 2 && !validateStep2()) {
      return;
    }

    setStep((current) =>
      current < 3 ? ((current + 1) as RegisterWizardStep) : current
    );
  }

  function goToStep(target: RegisterWizardStep) {
    // Backward navigation is always allowed; forward jumps still validate.
    if (target <= step) {
      setStep(target);

      return;
    }

    if (target === 2) {
      goNext();

      return;
    }

    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  }

  function goPrev() {
    setStep((current) =>
      current > 1 ? ((current - 1) as RegisterWizardStep) : current
    );
  }

  /**
   * §5.4 ①: "다음" stays disabled — with a one-line reason — until an area
   * is chosen; ②'s two required fields gate the same way so a user can't
   * carry an incomplete record into ③.
   */
  const advanceGate = useMemo((): {
    canAdvance: boolean;
    reason: string | null;
  } => {
    if (step === 1) {
      return areaChoice
        ? { canAdvance: true, reason: null }
        : {
            canAdvance: false,
            reason: '먼저 지역을 고르거나 새로 만들어 주세요.',
          };
    }

    if (step === 2) {
      if (!visitedAt) {
        return {
          canAdvance: false,
          reason: '임장 일시를 입력해야 다음으로 갈 수 있어요.',
        };
      }

      if (!basicValues.revisitIntent) {
        return {
          canAdvance: false,
          reason: '재방문 의사를 선택해야 다음으로 갈 수 있어요.',
        };
      }

      return { canAdvance: true, reason: null };
    }

    return { canAdvance: true, reason: null };
  }, [step, areaChoice, visitedAt, basicValues.revisitIntent]);

  const completionChecks = useMemo(() => {
    return {
      areaOk: Boolean(areaChoice),
      visitedAtOk: Boolean(visitedAt),
      revisitIntentOk: Boolean(basicValues.revisitIntent),
    };
  }, [areaChoice, visitedAt, basicValues.revisitIntent]);

  async function attemptComplete(): Promise<
    { ok: true } | { ok: false; message: string }
  > {
    await flush();

    if (!visitId) {
      return {
        ok: false,
        message: '임장 일시를 먼저 입력해서 저장을 시작해 주세요.',
      };
    }

    try {
      await updateVisitStatusMutation.mutateAsync('COMPLETED');

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof AppError
            ? error.message
            : '완료할 수 없어요. 잠시 뒤 다시 시도해 주세요.',
      };
    }
  }

  return {
    step,
    setStep: goToStep,
    goNext,
    goPrev,
    areaChoice,
    setAreaChoice,
    areaName: areaChoice?.name ?? draftVisitQuery.data?.area.name ?? '',
    visitId,
    basicValues,
    updateBasicField,
    photos,
    setPhotos,
    lastSavedAt,
    hasStartedSaving,
    saveErrorMessage,
    stepErrors,
    canAdvance: advanceGate.canAdvance,
    advanceBlockedReason: advanceGate.reason,
    completionChecks,
    attemptComplete,
    isCompleting: updateVisitStatusMutation.isPending,
    isDraftLoading: Boolean(draftVisitId) && draftVisitQuery.isLoading,
    draftLoadError: draftVisitQuery.isError,
    flushNow: flush,
  };
}
