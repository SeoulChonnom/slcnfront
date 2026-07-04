import dayjs from 'dayjs';
import type {
  OptionCdo,
  QuizRdo,
  QuizResultRdo,
  TripCdo,
  TripDetail,
  TripDetailDto,
  TripListItem,
  TripListItemDto,
  TripQuiz,
  TripRegisterAssetIds,
} from '../types';
import type { TripRegisterWizardValues } from '../utils/trip-form-data';

export function mapTripListItemDto(dto: TripListItemDto): TripListItem {
  return {
    id: dto.id,
    date: dto.date,
    type: dto.type,
    name: dto.name,
    description: dto.description,
    displayDate: dto.date
      .replace(/(\d{4})-(\d{2})-(\d{2})/, '$1.$2.$3')
      .replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3'),
    logo: dto.logo,
  };
}

export function mapTripDetailDto(dto: TripDetailDto): TripDetail {
  return {
    id: dto.id,
    date: dto.date,
    type: dto.type,
    name: dto.name,
    logo: dto.logo,
    firstMap: dto.firstMap,
    secondMap: dto.secondMap,
    nextButtonText: dto.nextButtonText,
    previousButtonText: dto.previousButtonText,
    driveUrl: dto.driveUrl,
  };
}

export function mapTripQuizDto(dto: QuizRdo): TripQuiz {
  return {
    title: dto.title,
    options: dto.options,
  };
}

export function mapTripQuizCheckDto(dto: QuizResultRdo) {
  return {
    isCorrect: dto.correct,
    title: dto.title,
    description: dto.text,
  };
}

export function buildTripRegisterPayload(
  values: TripRegisterWizardValues,
  assetIds: TripRegisterAssetIds
): TripCdo {
  const selectedAnswerIndex =
    values.quizAnswer.trim() === '' ? null : Number(values.quizAnswer) - 1;
  const filteredQuizOptions = values.quizOptions
    .map((option, index) => ({
      text: option.trim(),
      originalIndex: index,
    }))
    .filter((option) => option.text !== '');

  return {
    date: dayjs(values.date).format('YYYY-MM-DD'),
    type: values.type,
    name: values.info2.trim(),
    logoFileId: assetIds.logoFileId,
    firstMapFileId: assetIds.firstMapFileId,
    ...(assetIds.secondMapFileId !== undefined
      ? { secondMapFileId: assetIds.secondMapFileId }
      : {}),
    ...(values.hasSecondMap
      ? {
          ...(toOptionalTrimmedEntry('nextButtonText', values.button1) ?? {}),
          ...(toOptionalTrimmedEntry('previousButtonText', values.button2) ??
            {}),
        }
      : {}),
    driveUrl: values.drive.trim(),
    quiz: {
      title: values.quizTitle.trim(),
      answerTitle: values.quizAnswerTitle.trim(),
      answerText: values.quizAnswerText.trim(),
      errorTitle: values.quizErrorTitle.trim(),
      errorText: values.quizErrorText.trim(),
      options: filteredQuizOptions.map<OptionCdo>((option) => ({
        text: option.text,
        isCorrect:
          selectedAnswerIndex === null
            ? false
            : option.originalIndex === selectedAnswerIndex,
      })),
    },
  };
}

function toOptionalTrimmedEntry<Key extends string>(
  key: Key,
  value: string | undefined | null
): Record<Key, string> | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return {
    [key]: trimmedValue,
  } as Record<Key, string>;
}
