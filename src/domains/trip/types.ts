export type TripQuizChoiceDto = {
  quizIndex: string;
  answer: string;
};

export type TripListItemDto = {
  id: string;
  date: string;
  type: string;
  name: string;
  logo: string;
};

export type TripDetailDto = {
  date: string;
  firstMap: string;
  secondMap: string;
  nextButtonText: string;
  previousButtonText: string;
  driveUrl: string;
};

export type TripQuizOptionDto = {
  id: string;
  text: string;
  sortOrder: number;
};

export type TripQuizDto = {
  title: string;
  options: TripQuizOptionDto[];
};

export type TripQuizCheckDto = {
  correct: boolean;
  title: string;
  text: string;
};

export type TripListItem = {
  id: string;
  date: string;
  type: string;
  name: string;
  displayDate: string;
  logoPath: string;
};

export type TripDetail = {
  date: string;
  firstMapPath: string;
  secondMapPath: string;
  nextButtonText: string;
  previousButtonText: string;
  driveUrl: string;
};

export type TripQuizOption = {
  id: string;
  text: string;
  sortOrder: number;
};

export type TripQuiz = {
  title: string;
  options: TripQuizOption[];
};

export type TripQuizFeedback = {
  isCorrect: boolean;
  title: string;
  description: string;
};

export type TripRegisterRequest = {
  date: string;
  type: string;
  info1: string;
  info2: string;
  button1: string;
  button2: string;
  drive: string;
  quizTitle: string;
  quizAnswer: string;
  quizAnswerTitle: string;
  quizAnswerText: string;
  quizErrorTitle: string;
  quizErrorText: string;
  quizRegisterRequestList: TripQuizChoiceDto[];
};

export type TripRegisterPayload = {
  request: TripRegisterRequest;
  files: {
    logo?: File | null;
    map1?: File | null;
    map2?: File | null;
  };
};
