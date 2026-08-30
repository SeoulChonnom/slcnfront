import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { TextField } from '@/components/ui/TextField';
import {
  MAX_TRIP_QUIZ_OPTIONS,
  MIN_TRIP_QUIZ_OPTIONS,
  type TripRegisterWizardValues,
} from '@/domains/trip/utils/trip-form-data';
import type { TripValidationErrors } from '@/domains/trip/utils/trip-validation';

const quizOptionsHintId = 'quiz-options-hint';
const quizOptionsErrorId = 'quiz-options-error';
const quizAnswerErrorId = 'quiz-answer-error';

type TripRegisterQuizFieldKey =
  | 'quizTitle'
  | 'quizOptions'
  | 'quizAnswer'
  | 'quizAnswerTitle'
  | 'quizAnswerText'
  | 'quizErrorTitle'
  | 'quizErrorText';

type TripRegisterQuizValues = Pick<
  TripRegisterWizardValues,
  TripRegisterQuizFieldKey
>;

type TripRegisterQuizErrors = Pick<
  TripValidationErrors,
  TripRegisterQuizFieldKey
>;

type TripRegisterStepQuizProps = {
  values: TripRegisterQuizValues;
  errors: TripRegisterQuizErrors;
  onFieldChange: <Key extends TripRegisterQuizFieldKey>(
    key: Key,
    value: TripRegisterWizardValues[Key]
  ) => void;
  onQuizOptionChange: (index: number, value: string) => void;
  onAddQuizOption: () => void;
  onRemoveQuizOption: (index: number) => void;
};

export function TripRegisterStepQuiz({
  values,
  errors,
  onFieldChange,
  onQuizOptionChange,
  onAddQuizOption,
  onRemoveQuizOption,
}: TripRegisterStepQuizProps) {
  const firstInvalidOptionRef = useRef<HTMLInputElement | null>(null);
  const firstAnswerRef = useRef<HTMLInputElement | null>(null);
  const lastOption = values.quizOptions[values.quizOptions.length - 1];
  const hasIncompleteAddedOption =
    values.quizOptions.length > MIN_TRIP_QUIZ_OPTIONS &&
    (lastOption === undefined || lastOption.trim() === '');
  const canAddQuizOption =
    values.quizOptions.length < MAX_TRIP_QUIZ_OPTIONS &&
    !hasIncompleteAddedOption;
  const optionHint =
    values.quizOptions.length >= MAX_TRIP_QUIZ_OPTIONS
      ? `보기는 최대 ${MAX_TRIP_QUIZ_OPTIONS}개까지 입력할 수 있어요.`
      : hasIncompleteAddedOption
        ? '마지막 보기를 입력하면 다음 보기를 추가할 수 있어요.'
        : `보기는 ${MIN_TRIP_QUIZ_OPTIONS}개에서 ${MAX_TRIP_QUIZ_OPTIONS}개까지 입력할 수 있어요. 저장하려면 모든 보기를 입력해 주세요.`;
  const firstInvalidOptionIndex = errors.quizOptions
    ? Math.max(
        values.quizOptions.findIndex((option) => option.trim() === ''),
        0
      )
    : -1;
  const quizOptionsDescribedBy = [
    quizOptionsHintId,
    errors.quizOptions ? quizOptionsErrorId : null,
  ]
    .filter(Boolean)
    .join(' ');
  const quizAnswerDescribedBy = [
    errors.quizOptions ? quizOptionsErrorId : null,
    errors.quizAnswer ? quizAnswerErrorId : null,
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    if (errors.quizOptions && firstInvalidOptionRef.current) {
      firstInvalidOptionRef.current.focus();
      return;
    }

    if (errors.quizAnswer) {
      firstAnswerRef.current?.focus();
    }
  }, [errors]);

  return (
    <div className='slcn-trip-register-step'>
      <TextField
        label='퀴즈 제목'
        placeholder='퀴즈 제목'
        value={values.quizTitle}
        error={errors.quizTitle}
        onChange={(event) => onFieldChange('quizTitle', event.target.value)}
      />
      {values.quizOptions.map((option, index) => (
        <div className='slcn-trip-register-step__quiz-option' key={index}>
          <TextField
            label={`정답${index + 1}`}
            placeholder={`정답${index + 1}`}
            value={option}
            required
            name={`quiz-option-${index + 1}`}
            autoComplete='off'
            aria-describedby={quizOptionsDescribedBy}
            aria-invalid={Boolean(
              errors.quizOptions &&
                (option.trim() === '' || index === firstInvalidOptionIndex)
            )}
            ref={
              index === firstInvalidOptionIndex
                ? firstInvalidOptionRef
                : undefined
            }
            onChange={(event) => onQuizOptionChange(index, event.target.value)}
          />
          {index >= MIN_TRIP_QUIZ_OPTIONS ? (
            <Button
              variant='ghost'
              size='sm'
              aria-label={`정답${index + 1} 삭제`}
              onClick={() => onRemoveQuizOption(index)}
            >
              삭제
            </Button>
          ) : null}
        </div>
      ))}
      <div className='slcn-trip-register-step__quiz-options-actions'>
        <p className='slcn-trip-register-step__hint' id={quizOptionsHintId}>
          {optionHint} ({values.quizOptions.length}/{MAX_TRIP_QUIZ_OPTIONS})
        </p>
        <Button
          variant='secondary'
          aria-label='보기 추가'
          aria-describedby='quiz-options-hint'
          disabled={!canAddQuizOption}
          onClick={onAddQuizOption}
        >
          <span aria-hidden='true'>+</span> 보기 추가
        </Button>
      </div>
      {errors.quizOptions ? (
        <p
          id={quizOptionsErrorId}
          className='slcn-trip-register-step__error'
          role='alert'
          aria-live='assertive'
        >
          {errors.quizOptions}
        </p>
      ) : null}
      <RadioGroup
        name='quiz-answer'
        label='정답 선택'
        value={values.quizAnswer}
        ariaDescribedBy={quizAnswerDescribedBy || undefined}
        ariaInvalid={Boolean(errors.quizAnswer)}
        firstInputRef={errors.quizOptions ? undefined : firstAnswerRef}
        options={values.quizOptions.map((_, index) => ({
          label: `${index + 1}번`,
          value: String(index + 1),
        }))}
        onChange={(value) => onFieldChange('quizAnswer', value)}
      />
      {errors.quizAnswer ? (
        <p
          id={quizAnswerErrorId}
          className='slcn-trip-register-step__error'
          role='alert'
          aria-live='assertive'
        >
          {errors.quizAnswer}
        </p>
      ) : null}
      <TextField
        label='정답 제목'
        placeholder='정답 제목'
        value={values.quizAnswerTitle}
        error={errors.quizAnswerTitle}
        onChange={(event) =>
          onFieldChange('quizAnswerTitle', event.target.value)
        }
      />
      <TextField
        label='정답 텍스트'
        placeholder='정답 텍스트'
        value={values.quizAnswerText}
        error={errors.quizAnswerText}
        onChange={(event) =>
          onFieldChange('quizAnswerText', event.target.value)
        }
      />
      <TextField
        label='오답 제목'
        placeholder='오답 제목'
        value={values.quizErrorTitle}
        error={errors.quizErrorTitle}
        onChange={(event) =>
          onFieldChange('quizErrorTitle', event.target.value)
        }
      />
      <TextField
        label='오답 텍스트'
        placeholder='오답 텍스트'
        value={values.quizErrorText}
        error={errors.quizErrorText}
        onChange={(event) => onFieldChange('quizErrorText', event.target.value)}
      />
    </div>
  );
}
