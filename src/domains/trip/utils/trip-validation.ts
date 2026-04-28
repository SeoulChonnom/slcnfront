import type { TripRegisterWizardValues } from './trip-form-data';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type TripRegisterStep = 1 | 2 | 3;
export type TripValidationErrorKey =
  | 'type'
  | 'date'
  | 'info2'
  | 'logo'
  | 'map1'
  | 'map2'
  | 'button1'
  | 'button2'
  | 'drive'
  | 'quizTitle'
  | 'quizOptions'
  | 'quizAnswer'
  | 'quizAnswerTitle'
  | 'quizAnswerText'
  | 'quizErrorTitle'
  | 'quizErrorText';

export type TripValidationErrors = Partial<
  Record<TripValidationErrorKey, string>
>;

export function validateTripFile(file: File | null | undefined) {
  if (!file) {
    return '파일을 선택해주세요.';
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (
    !IMAGE_EXTENSIONS.includes(extension) ||
    !IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])
  ) {
    return '허용되지 않은 파일 형식입니다. 이미지 파일만 업로드해주세요.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return '파일 크기는 10MB를 초과할 수 없습니다.';
  }

  return null;
}

export function validateTripRegisterStep(
  step: TripRegisterStep,
  values: TripRegisterWizardValues
) {
  const errors: TripValidationErrors = {};

  if (step === 1) {
    if (!values.type) {
      errors.type = '유형을 선택해주세요.';
    }

    if (!values.date) {
      errors.date = '날짜를 입력해주세요.';
    }

    if (!values.info2.trim()) {
      errors.info2 = '나들이 이름을 입력해주세요.';
    }

    const logoError = validateTripFile(values.logo);

    if (logoError) {
      errors.logo = logoError;
    }
  }

  if (step === 2) {
    const map1Error = validateTripFile(values.map1);

    if (map1Error) {
      errors.map1 = map1Error;
    }

    if (!values.drive.trim()) {
      errors.drive = '드라이브 링크를 입력해주세요.';
    }

    if (values.hasSecondMap) {
      const map2Error = validateTripFile(values.map2);

      if (map2Error) {
        errors.map2 = map2Error;
      }

      if (!values.button1.trim()) {
        errors.button1 = '첫 번째 버튼 라벨을 입력해주세요.';
      }

      if (!values.button2.trim()) {
        errors.button2 = '두 번째 버튼 라벨을 입력해주세요.';
      }
    }
  }

  if (step === 3) {
    if (!values.quizTitle.trim()) {
      errors.quizTitle = '퀴즈 제목을 입력해주세요.';
    }

    if (!values.quizAnswerTitle.trim()) {
      errors.quizAnswerTitle = '정답 제목을 입력해주세요.';
    }

    if (!values.quizAnswerText.trim()) {
      errors.quizAnswerText = '정답 텍스트를 입력해주세요.';
    }

    if (!values.quizErrorTitle.trim()) {
      errors.quizErrorTitle = '오답 제목을 입력해주세요.';
    }

    if (!values.quizErrorText.trim()) {
      errors.quizErrorText = '오답 텍스트를 입력해주세요.';
    }

    const filledOptions = values.quizOptions.filter(
      (option) => option.trim() !== ''
    );

    if (filledOptions.length < 2) {
      errors.quizOptions = '보기는 최소 2개 이상 입력해주세요.';
    }

    if (!values.quizAnswer) {
      errors.quizAnswer = '정답 번호를 선택해주세요.';
    }

    const selectedAnswerIndex = Number(values.quizAnswer) - 1;
    const selectedOption = values.quizOptions[selectedAnswerIndex];

    if (
      values.quizAnswer &&
      (!Number.isInteger(selectedAnswerIndex) ||
        selectedAnswerIndex < 0 ||
        selectedOption === undefined ||
        selectedOption.trim() === '')
    ) {
      errors.quizAnswer = '정답 번호가 입력한 보기 수를 초과했습니다.';
    }
  }

  return errors;
}
