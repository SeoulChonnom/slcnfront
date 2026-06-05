import { RadioGroup } from '../../../components/ui/RadioGroup';
import { TextField } from '../../../components/ui/TextField';
import type { TripRegisterWizardValues } from '../utils/trip-form-data';
import type { TripValidationErrors } from '../utils/trip-validation';

const quizOptionFieldKeys = [
  'quiz-option-1',
  'quiz-option-2',
  'quiz-option-3',
  'quiz-option-4',
] as const;

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
};

export function TripRegisterStepQuiz({
  values,
  errors,
  onFieldChange,
  onQuizOptionChange,
}: TripRegisterStepQuizProps) {
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
        <TextField
          key={quizOptionFieldKeys[index]}
          label={`정답${index + 1}`}
          placeholder={`정답${index + 1}`}
          value={option}
          onChange={(event) => onQuizOptionChange(index, event.target.value)}
        />
      ))}
      {errors.quizOptions ? (
        <p className='slcn-trip-register-step__error'>{errors.quizOptions}</p>
      ) : null}
      <RadioGroup
        name='quiz-answer'
        value={values.quizAnswer}
        options={[
          { label: '1번', value: '1' },
          { label: '2번', value: '2' },
          { label: '3번', value: '3' },
          { label: '4번', value: '4' },
        ]}
        onChange={(value) => onFieldChange('quizAnswer', value)}
      />
      {errors.quizAnswer ? (
        <p className='slcn-trip-register-step__error'>{errors.quizAnswer}</p>
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
