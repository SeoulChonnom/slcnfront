import dayjs from 'dayjs';
import type {
  TripDetail,
  TripDetailDto,
  TripListItem,
  TripListItemDto,
  TripQuiz,
  TripQuizCheckDto,
  TripQuizDto,
  TripRegisterPayload,
} from '../types';
import type { TripRegisterWizardValues } from '../utils/trip-form-data';

export function mapTripListItemDto(dto: TripListItemDto): TripListItem {
  return {
    id: dto.id,
    date: dto.date,
    type: dto.type,
    name: dto.name,
    displayDate: dto.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3'),
    logoPath: dto.logo,
  };
}

export function mapTripDetailDto(dto: TripDetailDto): TripDetail {
  return {
    date: dto.date,
    firstMapPath: dto.firstMap,
    secondMapPath: dto.secondMap,
    nextButtonText: dto.nextButtonText,
    previousButtonText: dto.previousButtonText,
    driveUrl: dto.driveUrl,
  };
}

export function mapTripQuizDto(dto: TripQuizDto): TripQuiz {
  return {
    title: dto.title,
    options: dto.options.toSorted(
      (left, right) => left.sortOrder - right.sortOrder
    ),
  };
}

export function mapTripQuizCheckDto(dto: TripQuizCheckDto) {
  return {
    isCorrect: dto.correct,
    title: dto.title,
    description: dto.text,
  };
}

export function buildTripRegisterPayload(
  values: TripRegisterWizardValues
): TripRegisterPayload {
  const filteredQuizOptions = values.quizOptions
    .map((answer, index) => ({
      answer: answer.trim(),
      quizIndex: String(index),
    }))
    .filter((option) => option.answer !== '');

  return {
    request: {
      date: dayjs(values.date).format('YYYYMMDD'),
      type: values.type,
      info1: dayjs(values.date).format('YYYY.MM.DD'),
      info2: values.info2.trim(),
      button1: values.hasSecondMap ? values.button1.trim() : '',
      button2: values.hasSecondMap ? values.button2.trim() : '',
      drive: values.drive.trim(),
      quizTitle: values.quizTitle.trim(),
      quizAnswer: String(Number(values.quizAnswer) - 1),
      quizAnswerTitle: values.quizAnswerTitle.trim(),
      quizAnswerText: values.quizAnswerText.trim(),
      quizErrorTitle: values.quizErrorTitle.trim(),
      quizErrorText: values.quizErrorText.trim(),
      quizRegisterRequestList: filteredQuizOptions,
    },
    files: {
      logo: values.logo,
      map1: values.map1,
      map2: values.hasSecondMap ? values.map2 : null,
    },
  };
}
