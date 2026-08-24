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
  type: TripType;
  name: string;
  description?: string;
  logo: FileAsset;
};

export type TripDetailDto = {
  id: string;
  date: string;
  type: TripType;
  name: string;
  logo: FileAsset;
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
  type: TripType;
  name: string;
  description?: string;
  displayDate: string;
  logo: FileAsset;
};

export type TripDetail = {
  id: string;
  date: string;
  type: TripType;
  name: string;
  logo: FileAsset;
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

const tripTypes = ['AYO', 'RYU'] as const;

export type TripType = (typeof tripTypes)[number];

export function isTripType(value: string): value is TripType {
  return tripTypes.some((tripType) => tripType === value);
}

type FileBoxTargetType = 'TRAVEL' | 'TRAVEL_DAY' | 'TRAVEL_PLACE' | 'TRIP';
type FileBoxRole = 'COVER' | 'GALLERY' | 'LOGO' | 'FIRST_MAP' | 'SECOND_MAP';
type TripFileBoxRole = 'LOGO' | 'FIRST_MAP' | 'SECOND_MAP';

export type FileBoxItemCdo = {
  fileAssetId?: string;
  targetType?: FileBoxTargetType;
  targetId?: string;
  role?: FileBoxRole;
  caption?: string;
  sortOrder?: number;
};

export type TripFileBoxItemCdo = FileBoxItemCdo & {
  fileAssetId: string;
  targetType: 'TRIP';
  role: TripFileBoxRole;
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
  type: TripType;
  name: string;
  files: TripFileBoxItemCdo[];
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
