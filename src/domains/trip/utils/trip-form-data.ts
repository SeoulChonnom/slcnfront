import dayjs from 'dayjs';
import type { TripRegisterPayload } from '../types';

export type TripRegisterWizardValues = {
  type: string;
  date: string;
  info2: string;
  logo: File | null;
  map1: File | null;
  hasSecondMap: boolean;
  map2: File | null;
  button1: string;
  button2: string;
  drive: string;
  quizTitle: string;
  quizOptions: [string, string, string, string];
  quizAnswer: string;
  quizAnswerTitle: string;
  quizAnswerText: string;
  quizErrorTitle: string;
  quizErrorText: string;
};

export function createInitialTripRegisterValues(): TripRegisterWizardValues {
  return {
    type: '',
    date: '',
    info2: '',
    logo: null,
    map1: null,
    hasSecondMap: false,
    map2: null,
    button1: '',
    button2: '',
    drive: '',
    quizTitle: '',
    quizOptions: ['', '', '', ''],
    quizAnswer: '',
    quizAnswerTitle: '',
    quizAnswerText: '',
    quizErrorTitle: '',
    quizErrorText: '',
  };
}

export function buildTripRegisterPayload(
  values: TripRegisterWizardValues,
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
