export type FileAsset = {
  fileId: string;
  type: string;
  originalFilename: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
};

export function fileAssetKey(asset: FileAsset): string {
  return asset.fileId;
}

export type TripListItemDto = {
  id: string;
  date: string;
  type: string;
  name: string;
  description?: string;
  logo: FileAsset;
};

export type TripDetailDto = {
  date: string;
  firstMap: FileAsset;
  secondMap: FileAsset | null;
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
  description?: string;
  displayDate: string;
  logo: FileAsset;
};

export type TripDetail = {
  date: string;
  firstMap: FileAsset;
  secondMap: FileAsset | null;
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
  logoFileId: string;
  firstMapFileId: string;
  secondMapFileId?: string;
  nextButtonText?: string;
  previousButtonText?: string;
  driveUrl: string;
  quiz: QuizCdo;
};

export type TripRegisterAssetIds = {
  logoFileId: string;
  firstMapFileId: string;
  secondMapFileId?: string;
};
