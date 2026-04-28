import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tripFilesApi } from '../api/trip-files-api';
import { tripApi } from '../api/trip-api';
import { buildTripRegisterPayload } from '../mappers/trip-mappers';
import { tripQueryKeys } from '../../../lib/api/query-keys';
import {
  createInitialTripRegisterValues,
  type TripRegisterWizardValues,
} from '../utils/trip-form-data';
import {
  validateTripRegisterStep,
  type TripRegisterStep,
  type TripValidationErrors,
} from '../utils/trip-validation';

type UseTripRegisterFormOptions = {
  onSubmit?: (values: TripRegisterWizardValues) => Promise<void> | void;
  onSuccess?: () => void;
};

export function useTripRegisterForm(options: UseTripRegisterFormOptions = {}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<TripRegisterStep>(1);
  const [values, setValues] = useState<TripRegisterWizardValues>(
    createInitialTripRegisterValues
  );
  const [errors, setErrors] = useState<TripValidationErrors>({});
  const mutation = useMutation({
    mutationFn: async (nextValues: TripRegisterWizardValues) => {
      if (options.onSubmit) {
        await options.onSubmit(nextValues);

        return;
      }

      if (!nextValues.logo || !nextValues.map1) {
        throw new Error('Trip registration requires logo and first map files.');
      }

      const logoPath = await tripFilesApi.uploadTripFile(
        'logo',
        nextValues.logo
      );
      const firstMapPath = await tripFilesApi.uploadTripFile(
        'map1',
        nextValues.map1
      );
      const secondMapPath =
        nextValues.hasSecondMap && nextValues.map2
          ? await tripFilesApi.uploadTripFile('map2', nextValues.map2)
          : undefined;

      await tripApi.registerTrip(
        buildTripRegisterPayload(nextValues, {
          logo: logoPath,
          firstMap: firstMapPath,
          secondMap: secondMapPath,
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

  function updateField<Key extends keyof TripRegisterWizardValues>(
    key: Key,
    value: TripRegisterWizardValues[Key]
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function updateQuizOption(index: number, value: string) {
    setValues((currentValues) => {
      const nextQuizOptions = [...currentValues.quizOptions] as [
        string,
        string,
        string,
        string,
      ];

      nextQuizOptions[index] = value;

      return {
        ...currentValues,
        quizOptions: nextQuizOptions,
      };
    });
  }

  function validateCurrentStep(nextStep: TripRegisterStep) {
    const nextErrors = validateTripRegisterStep(nextStep, values);
    setErrors(nextErrors);

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

  async function submit() {
    const nextErrors = validateTripRegisterStep(3, values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return false;
    }

    try {
      await mutation.mutateAsync(values);

      return true;
    } catch {
      return false;
    }
  }

  return {
    step,
    values,
    errors,
    isSubmitting: mutation.isPending,
    submitError: mutation.error,
    updateField,
    updateQuizOption,
    goNext,
    goPrev,
    submit,
  };
}
