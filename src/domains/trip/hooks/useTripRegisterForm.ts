import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { tripApi } from '@/domains/trip/api/trip-api';
import { tripFilesApi } from '@/domains/trip/api/trip-files-api';
import { buildTripRegisterPayload } from '@/domains/trip/mappers/trip-mappers';
import {
  createInitialTripRegisterValues,
  MAX_TRIP_QUIZ_OPTIONS,
  MIN_TRIP_QUIZ_OPTIONS,
  type TripRegisterWizardValues,
} from '@/domains/trip/utils/trip-form-data';
import {
  type TripRegisterStep,
  type TripValidationErrors,
  validateTripRegisterStep,
} from '@/domains/trip/utils/trip-validation';
import { AppError } from '@/lib/api/errors';
import { tripQueryKeys } from '@/lib/api/query-keys';

type UseTripRegisterFormOptions = {
  onSubmit?: (values: TripRegisterWizardValues) => Promise<void> | void;
  onSuccess?: () => void;
};

const DRAFT_STORAGE_KEY = 'slcn:trip-register-draft';
const DRAFT_VERSION = 1;

type TripRegisterDraftFileNames = {
  logo?: string;
  map1?: string;
  map2?: string;
};

type SerializableTripRegisterValues = Omit<
  TripRegisterWizardValues,
  'logo' | 'map1' | 'map2'
>;

type TripRegisterDraft = {
  version: typeof DRAFT_VERSION;
  step: TripRegisterStep;
  values: SerializableTripRegisterValues;
  fileNames: TripRegisterDraftFileNames;
};

function isTripRegisterStep(value: unknown): value is TripRegisterStep {
  return value === 1 || value === 2 || value === 3;
}

function isDraftShape(value: unknown): value is TripRegisterDraft {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.version === DRAFT_VERSION &&
    isTripRegisterStep(candidate.step) &&
    typeof candidate.values === 'object' &&
    candidate.values !== null &&
    typeof candidate.fileNames === 'object' &&
    candidate.fileNames !== null
  );
}

function readDraft(): TripRegisterDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isDraftShape(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(draft: TripRegisterDraft) {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage may be unavailable (e.g. Safari private mode quota) — degrade silently.
  }
}

function clearDraftStorage() {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function toSerializableValues(
  values: TripRegisterWizardValues
): SerializableTripRegisterValues {
  const { logo, map1, map2, ...rest } = values;

  return rest;
}

function isValuesEqual(
  a: TripRegisterWizardValues,
  b: TripRegisterWizardValues
): boolean {
  return (
    a.type === b.type &&
    a.date === b.date &&
    a.info2 === b.info2 &&
    (a.logo !== null) === (b.logo !== null) &&
    (a.map1 !== null) === (b.map1 !== null) &&
    a.hasSecondMap === b.hasSecondMap &&
    (a.map2 !== null) === (b.map2 !== null) &&
    a.button1 === b.button1 &&
    a.button2 === b.button2 &&
    a.drive === b.drive &&
    a.quizTitle === b.quizTitle &&
    a.quizOptions.length === b.quizOptions.length &&
    a.quizOptions.every((option, index) => option === b.quizOptions[index]) &&
    a.quizAnswer === b.quizAnswer &&
    a.quizAnswerTitle === b.quizAnswerTitle &&
    a.quizAnswerText === b.quizAnswerText &&
    a.quizErrorTitle === b.quizErrorTitle &&
    a.quizErrorText === b.quizErrorText
  );
}

function canAddQuizOption(currentValues: TripRegisterWizardValues) {
  const lastOption =
    currentValues.quizOptions[currentValues.quizOptions.length - 1];

  return !(
    currentValues.quizOptions.length < MIN_TRIP_QUIZ_OPTIONS ||
    currentValues.quizOptions.length >= MAX_TRIP_QUIZ_OPTIONS ||
    (currentValues.quizOptions.length > MIN_TRIP_QUIZ_OPTIONS &&
      (lastOption === undefined || lastOption.trim() === ''))
  );
}

function canRemoveQuizOption(
  currentValues: TripRegisterWizardValues,
  index: number
) {
  return !(
    index < MIN_TRIP_QUIZ_OPTIONS || index >= currentValues.quizOptions.length
  );
}

function deriveSubmitErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof AppError) {
    if (error.code === 'NETWORK_ERROR') {
      return '네트워크에 연결할 수 없어요. 연결을 확인하고 다시 저장해 주세요.';
    }

    if (error.code === 'HTTP_ERROR') {
      if (error.status === 401) {
        return '로그인이 풀렸어요. 다시 로그인한 뒤 저장해 주세요.';
      }

      if (error.status === 403) {
        return '이 기록을 저장할 권한이 없어요.';
      }

      if (error.status === 413) {
        return '파일이 너무 커서 업로드하지 못했어요. 10MB 이하 이미지로 다시 시도해 주세요.';
      }

      if (error.status === 429) {
        return '요청이 너무 많아요. 잠시 뒤 다시 저장해 주세요.';
      }

      if (typeof error.status === 'number' && error.status >= 500) {
        return '서버에 문제가 생겨 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.';
      }

      return '저장하지 못했어요. 입력을 확인하고 다시 시도해 주세요.';
    }

    if (error.code === 'INVALID_RESPONSE') {
      return '저장은 됐지만 응답을 읽지 못했어요. 목록에서 확인해 주세요.';
    }
  }

  return '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.';
}

export function useTripRegisterForm(options: UseTripRegisterFormOptions = {}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<TripRegisterStep>(1);
  const [values, setValues] = useState<TripRegisterWizardValues>(
    createInitialTripRegisterValues
  );
  const [errors, setErrors] = useState<TripValidationErrors>({});
  const [errorToken, setErrorToken] = useState(0);
  const [persistedFileNames, setPersistedFileNames] =
    useState<TripRegisterDraftFileNames>({});
  const [restoredDraft, setRestoredDraft] = useState<{
    fileNames: TripRegisterDraftFileNames;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: async (nextValues: TripRegisterWizardValues) => {
      if (options.onSubmit) {
        await options.onSubmit(nextValues);

        return;
      }

      if (!nextValues.logo || !nextValues.map1) {
        throw new Error('Trip registration requires logo and first map files.');
      }

      const logoAsset = await tripFilesApi.uploadTripFile(
        'logo',
        nextValues.logo
      );
      const firstMapAsset = await tripFilesApi.uploadTripFile(
        'map1',
        nextValues.map1
      );
      const secondMapAsset =
        nextValues.hasSecondMap && nextValues.map2
          ? await tripFilesApi.uploadTripFile('map2', nextValues.map2)
          : undefined;

      await tripApi.registerTrip(
        buildTripRegisterPayload(nextValues, {
          logoFileId: logoAsset.fileId,
          firstMapFileId: firstMapAsset.fileId,
          secondMapFileId: secondMapAsset?.fileId,
        })
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tripQueryKeys.list(),
      });
      options.onSuccess?.();
    },
  });

  // Restore a previously abandoned draft once, on mount.
  useEffect(() => {
    const draft = readDraft();

    if (!draft) {
      return;
    }

    setValues((current) => ({
      ...current,
      ...draft.values,
      logo: null,
      map1: null,
      map2: null,
    }));
    /* Files never survive serialization, and reaching step 2 or 3 always
       requires a logo file, so a restored draft always names at least one
       missing file. Always land on step 1 so the user re-picks files before
       the later steps mean anything, rather than dropping them into the quiz
       with an empty logo behind it. */
    const draftFileNames = draft.fileNames ?? {};

    setStep(1);
    setPersistedFileNames(draftFileNames);
    setRestoredDraft({ fileNames: draftFileNames });
    // Intentionally runs once on mount only.
  }, []);

  // Persist the draft whenever values or step change, unless the form is still pristine.
  useEffect(() => {
    const initialValues = createInitialTripRegisterValues();
    const isPristine = step === 1 && isValuesEqual(values, initialValues);

    if (isPristine) {
      return;
    }

    const fileNames: TripRegisterDraftFileNames = {
      logo: values.logo ? values.logo.name : persistedFileNames.logo,
      map1: values.map1 ? values.map1.name : persistedFileNames.map1,
      map2: values.map2 ? values.map2.name : persistedFileNames.map2,
    };

    writeDraft({
      version: DRAFT_VERSION,
      step,
      values: toSerializableValues(values),
      fileNames,
    });
  }, [values, step, persistedFileNames]);

  function clearFieldErrors(keys: readonly string[]) {
    setErrors((currentErrors) => {
      let changed = false;
      const nextErrors: TripValidationErrors = { ...currentErrors };

      for (const key of keys) {
        if (key in nextErrors) {
          delete (nextErrors as Record<string, string | undefined>)[key];
          changed = true;
        }
      }

      return changed ? nextErrors : currentErrors;
    });
  }

  function updateField<Key extends keyof TripRegisterWizardValues>(
    key: Key,
    value: TripRegisterWizardValues[Key]
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));

    if (key === 'logo' || key === 'map1' || key === 'map2') {
      const fileKey: 'logo' | 'map1' | 'map2' = key;

      setPersistedFileNames((current) => {
        if (!(fileKey in current)) {
          return current;
        }

        const next = { ...current };

        delete next[fileKey];

        return next;
      });
    }

    const keysToClear: string[] = [key];

    if (key === 'hasSecondMap' && value === false) {
      keysToClear.push('map2', 'button1', 'button2');
    }

    clearFieldErrors(keysToClear);
  }

  function updateQuizOption(index: number, value: string) {
    if (index < 0 || index >= values.quizOptions.length) {
      return;
    }

    setValues((currentValues) => {
      if (index < 0 || index >= currentValues.quizOptions.length) {
        return currentValues;
      }

      const nextQuizOptions = [...currentValues.quizOptions];

      nextQuizOptions[index] = value;

      return {
        ...currentValues,
        quizOptions: nextQuizOptions,
      };
    });

    clearFieldErrors(['quizOptions']);
  }

  function addQuizOption() {
    const canAdd = canAddQuizOption(values);

    setValues((currentValues) => {
      if (!canAddQuizOption(currentValues)) {
        return currentValues;
      }

      return {
        ...currentValues,
        quizOptions: [...currentValues.quizOptions, ''],
      };
    });

    if (canAdd) {
      clearFieldErrors(['quizOptions', 'quizAnswer']);
    }
  }

  function removeQuizOption(index: number) {
    const canRemove = canRemoveQuizOption(values, index);

    setValues((currentValues) => {
      if (
        index < MIN_TRIP_QUIZ_OPTIONS ||
        index >= currentValues.quizOptions.length
      ) {
        return currentValues;
      }

      const nextQuizOptions = currentValues.quizOptions.filter(
        (_, optionIndex) => optionIndex !== index
      );
      const selectedAnswerIndex = Number(currentValues.quizAnswer) - 1;
      let nextQuizAnswer = currentValues.quizAnswer;

      if (Number.isInteger(selectedAnswerIndex)) {
        if (selectedAnswerIndex === index) {
          nextQuizAnswer = '';
        } else if (selectedAnswerIndex > index) {
          nextQuizAnswer = String(selectedAnswerIndex);
        }
      }

      return {
        ...currentValues,
        quizOptions: nextQuizOptions,
        quizAnswer: nextQuizAnswer,
      };
    });

    if (canRemove) {
      clearFieldErrors(['quizOptions', 'quizAnswer']);
    }
  }

  function validateCurrentStep(nextStep: TripRegisterStep) {
    const nextErrors = validateTripRegisterStep(nextStep, values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setErrorToken((token) => token + 1);
    }

    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep(step)) {
      return false;
    }

    setStep((currentStep) =>
      currentStep < 3 ? ((currentStep + 1) as TripRegisterStep) : currentStep
    );

    return true;
  }

  function goPrev() {
    setErrors({});
    setStep((currentStep) =>
      currentStep > 1 ? ((currentStep - 1) as TripRegisterStep) : currentStep
    );
  }

  function dismissRestoredDraft() {
    setRestoredDraft(null);
  }

  function discardDraft() {
    clearDraftStorage();
    setValues(createInitialTripRegisterValues());
    setErrors({});
    setStep(1);
    setPersistedFileNames({});
    setRestoredDraft(null);
  }

  async function submit() {
    if (mutation.isPending) {
      return false;
    }

    const nextErrors = validateTripRegisterStep(3, values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setErrorToken((token) => token + 1);

      return false;
    }

    try {
      await mutation.mutateAsync(values);
      clearDraftStorage();

      return true;
    } catch {
      return false;
    }
  }

  const isDirty = !isValuesEqual(values, createInitialTripRegisterValues());
  const submitErrorMessage = deriveSubmitErrorMessage(mutation.error);

  return {
    step,
    values,
    errors,
    errorToken,
    isSubmitting: mutation.isPending,
    submitError: mutation.error,
    submitErrorMessage,
    isDirty,
    restoredDraft,
    dismissRestoredDraft,
    discardDraft,
    updateField,
    updateQuizOption,
    addQuizOption,
    removeQuizOption,
    goNext,
    goPrev,
    submit,
  };
}
