export type TripQuizChoiceDto = {
  quizIndex: string;
  answer: string;
};

export type TripListItemDto = {
  id: string;
  date: string;
  name: string;
  logo: string;
  quizTitle: string;
  quizAnswer: string;
  quizAnswerTitle: string;
  quizAnswerText: string;
  quizErrorTitle: string;
  quizErrorText: string;
  quizList: TripQuizChoiceDto[];
};

export type TripDetailDto = {
  date: string;
  firstMap: string;
  secondMap: string;
  nextButtonText: string;
  previousButtonText: string;
  drive: string;
};

export type TripListItem = {
  id: string;
  date: string;
  name: string;
  displayDate: string;
  logoPath: string;
  quizTitle: string;
  quizAnswerIndex: number;
  quizAnswerTitle: string;
  quizAnswerText: string;
  quizErrorTitle: string;
  quizErrorText: string;
  quizResponses: TripQuizChoiceDto[];
};

export type TripDetail = {
  date: string;
  firstMapPath: string;
  secondMapPath: string | null;
  nextButtonText: string | null;
  previousButtonText: string | null;
  driveUrl: string;
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
