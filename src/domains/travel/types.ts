export type PlaceCategory =
  | 'TOURIST_SPOT'
  | 'RESTAURANT'
  | 'CAFE'
  | 'ACCOMMODATION'
  | 'SHOPPING'
  | 'TRANSPORT'
  | 'ACTIVITY'
  | 'ETC';

export const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  TOURIST_SPOT: '관광지',
  RESTAURANT: '음식점',
  CAFE: '카페',
  ACCOMMODATION: '숙소',
  SHOPPING: '쇼핑',
  TRANSPORT: '이동',
  ACTIVITY: '체험',
  ETC: '기타',
};

// ── View-model types ──────────────────────────────────────────────────────────

export type TravelTag = {
  name: string;
};

export type TravelPhoto = {
  id: string;
  travelId: string;
  travelDayId: string | null;
  travelPlaceId: string | null;
  photoFileId: string;
  caption: string | null;
  sortOrder: number;
};

export type FileBoxItem = {
  id: string;
  fileAssetId: string;
  targetType: 'TRAVEL' | 'TRAVEL_DAY' | 'TRAVEL_PLACE' | 'TRIP';
  targetId: string | null;
  role: 'COVER' | 'GALLERY' | 'LOGO' | 'FIRST_MAP' | 'SECOND_MAP';
  caption: string | null;
  sortOrder: number;
  file?: {
    fileId: string;
    type: string;
    filename: string;
    path: string;
  };
};

export type TravelPlace = {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string | null;
  memo: string | null;
  description: string | null;
  coverPhotoId: string | null;
  sortOrder: number;
  photos: TravelPhoto[];
};

export type TravelDay = {
  id: string;
  travelId: string;
  date: string;
  displayDate: string;
  title: string | null;
  memo: string | null;
  coverPhotoId: string | null;
  dayNumber: number;
  sortOrder: number;
  places: TravelPlace[];
  photos: TravelPhoto[];
};

export type TravelReview = {
  oneLineSummary: string | null;
  goodPoint: string | null;
  badPoint: string | null;
  revisitPlace: string | null;
  finalReview: string | null;
};

export type TravelListItem = {
  id: string;
  travelId: string;
  title: string;
  region: string;
  startDate: string;
  endDate: string;
  displayStartDate: string;
  displayEndDate: string;
  dateRangeLabel: string;
  nightsDaysLabel: string;
  coverPhotoId: string | null;
  oneLineReview: string | null;
  nights: number;
  days: number;
  tags: TravelTag[];
};

export type TravelDetail = {
  id: string;
  travelId: string;
  title: string;
  region: string;
  startDate: string;
  endDate: string;
  displayStartDate: string;
  displayEndDate: string;
  dateRangeLabel: string;
  nightsDaysLabel: string;
  coverPhotoId: string | null;
  oneLineReview: string | null;
  nights: number;
  days: number;
  travelDays: TravelDay[];
  places: TravelPlace[];
  photos: TravelPhoto[];
  files: FileBoxItem[];
  tags: TravelTag[];
  review: TravelReview | null;
};

// ── CDO / UDO view types (passed to mutation hooks) ──────────────────────────

export type TravelPhotoCdo = {
  travelDayId?: string;
  travelPlaceId?: string;
  photoFileId: string;
  caption?: string;
  sortOrder?: number;
};

export type TravelReviewUdo = {
  content?: string;
  oneLineSummary?: string;
  goodPoint?: string;
  badPoint?: string;
  revisitPlace?: string;
  finalReview?: string;
};

export type TravelPlaceUdo = {
  name: string;
  category: PlaceCategory;
  address?: string;
  memo?: string;
  description?: string;
  sortOrder: number;
  coverPhotoId?: string;
  photos: TravelPhotoCdo[];
};

export type TravelDayUdo = {
  id?: string;
  date: string;
  title?: string;
  memo?: string;
  coverPhotoId?: string;
  sortOrder: number;
  photos: TravelPhotoCdo[];
  places: TravelPlaceUdo[];
};

export type TravelCdo = {
  title: string;
  region: string;
  startDate: string;
  endDate: string;
  coverPhotoId?: string;
  tags: string[];
  travelDays: TravelDayUdo[];
  photos: TravelPhotoCdo[];
  review: TravelReviewUdo;
};

export type TravelUdo = {
  title: string;
  region: string;
  startDate: string;
  endDate: string;
  coverPhotoId?: string;
  tags: string[];
  confirmDeleteDays: boolean;
  travelDays: TravelDayUdo[];
  photos: TravelPhotoCdo[];
  review: TravelReviewUdo;
};

export type TravelPlaceCdo = {
  travelDayId: string;
  name: string;
  category?: PlaceCategory;
  address?: string;
  memo?: string;
  description?: string;
  coverPhotoId?: string;
  photoFileIds?: string[];
  sortOrder?: number;
};

export type TravelTagCdo = {
  name: string;
};
