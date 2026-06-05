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

type OptionRdo = {
  id: string;
  text: string;
};

export type QuizRdo = {
  title: string;
  options: OptionRdo[];
};

export type QuizResultRdo = {
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

type TripQuizOption = {
  id: string;
  text: string;
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

export type OptionCdo = {
  text: string;
  isCorrect?: boolean;
};

type QuizCdo = {
  title: string;
  answerTitle: string;
  answerText: string;
  errorTitle: string;
  errorText: string;
  options: OptionCdo[];
};

export type TripCdo = {
  date: string;
  type: string;
  name: string;
  logo: string;
  firstMap: string;
  secondMap?: string;
  nextButtonText?: string;
  previousButtonText?: string;
  driveUrl: string;
  quiz: QuizCdo;
};

export type TripRegisterAssetPaths = {
  logo: string;
  firstMap: string;
  secondMap?: string;
};
