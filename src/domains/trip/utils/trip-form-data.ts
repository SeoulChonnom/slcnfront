import type { TripType } from '@/domains/trip/types';

export const MIN_TRIP_QUIZ_OPTIONS = 3;
export const MAX_TRIP_QUIZ_OPTIONS = 6;

export type TripRegisterWizardValues = {
  type: TripType | '';
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
  quizOptions: string[];
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
    quizOptions: ['', '', ''],
    quizAnswer: '',
    quizAnswerTitle: '',
    quizAnswerText: '',
    quizErrorTitle: '',
    quizErrorText: '',
  };
}
