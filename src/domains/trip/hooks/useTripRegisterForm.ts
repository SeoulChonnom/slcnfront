import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

      await tripApi.registerTrip(buildTripRegisterPayload(nextValues));
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

    await mutation.mutateAsync(values);

    return true;
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
