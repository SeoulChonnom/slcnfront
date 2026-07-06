import type {
  FileBoxItemRdoDto,
  TravelDayRdoDto,
  TravelDetailRdoDto,
  TravelPlaceRdoDto,
  TravelRdoDto,
  TravelReviewRdoDto,
} from '../api/travel-schemas';
import type {
  TravelDay,
  TravelDetail,
  TravelListItem,
  TravelPhoto,
  TravelPlace,
  TravelReview,
  TravelTag,
} from '../types';

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Converts YYYY-MM-DD → YYYY.MM.DD */
export function formatDisplayDate(isoDate: string): string {
  return isoDate.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1.$2.$3');
}

/** Returns "YYYY.MM.DD – YYYY.MM.DD" */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
}

/** Returns e.g. "2박 3일" from nights/days integers */
export function formatNightsDays(nights: number, days: number): string {
  return `${nights}박 ${days}일`;
}

// ── Individual mappers ────────────────────────────────────────────────────────

function mapTravelTagString(tag: string): TravelTag {
  return { name: tag };
}

function mapFileBoxItemToPhoto(dto: FileBoxItemRdoDto): TravelPhoto {
  return {
    id: dto.id,
    travelId: '',
    travelDayId: dto.targetType === 'TRAVEL_DAY' ? dto.targetId : null,
    travelPlaceId: dto.targetType === 'TRAVEL_PLACE' ? dto.targetId : null,
    photoFileId: dto.fileAssetId,
    caption: dto.caption,
    sortOrder: dto.sortOrder,
  };
}

function mapTravelPlaceDto(dto: TravelPlaceRdoDto): TravelPlace {
  return {
    id: dto.placeKey,
    name: dto.name,
    category: dto.category,
    address: dto.address,
    memo: dto.memo,
    description: dto.description,
    coverPhotoId: dto.cover?.fileAssetId ?? null,
    sortOrder: dto.sortOrder,
    photos: dto.photos.map(mapFileBoxItemToPhoto),
  };
}

function mapTravelDayDto(dto: TravelDayRdoDto): TravelDay {
  return {
    id: dto.id ?? dto.date,
    travelId: dto.travelId ?? '',
    date: dto.date,
    displayDate: formatDisplayDate(dto.date),
    title: dto.title,
    memo: dto.memo,
    coverPhotoId: dto.cover?.fileAssetId ?? null,
    dayNumber: dto.dayNumber,
    sortOrder: dto.sortOrder,
    places: dto.places.map(mapTravelPlaceDto),
    photos: dto.photos.map(mapFileBoxItemToPhoto),
  };
}

function mapTravelReviewDto(dto: TravelReviewRdoDto): TravelReview {
  return {
    oneLineSummary: dto.oneLineSummary,
    goodPoint: dto.goodPoint,
    badPoint: dto.badPoint,
    revisitPlace: dto.revisitPlace,
    finalReview: dto.finalReview,
  };
}

export function mapTravelListItemDto(dto: TravelRdoDto): TravelListItem {
  return {
    id: dto.id,
    travelId: dto.travelId,
    title: dto.title,
    region: dto.region,
    startDate: dto.startDate,
    endDate: dto.endDate,
    displayStartDate: formatDisplayDate(dto.startDate),
    displayEndDate: formatDisplayDate(dto.endDate),
    dateRangeLabel: formatDateRange(dto.startDate, dto.endDate),
    nightsDaysLabel: formatNightsDays(dto.nights, dto.days),
    coverPhotoId: dto.cover?.fileAssetId ?? null,
    oneLineReview: dto.oneLineReview,
    nights: dto.nights,
    days: dto.days,
    tags: dto.tags.map(mapTravelTagString),
  };
}

export function mapTravelDetailDto(dto: TravelDetailRdoDto): TravelDetail {
  const travelDays = dto.travelDays.map(mapTravelDayDto);
  return {
    id: dto.id,
    travelId: dto.travelId,
    title: dto.title,
    region: dto.region,
    startDate: dto.startDate,
    endDate: dto.endDate,
    displayStartDate: formatDisplayDate(dto.startDate),
    displayEndDate: formatDisplayDate(dto.endDate),
    dateRangeLabel: formatDateRange(dto.startDate, dto.endDate),
    nightsDaysLabel: formatNightsDays(dto.nights, dto.days),
    coverPhotoId: dto.cover?.fileAssetId ?? null,
    oneLineReview: dto.oneLineReview,
    nights: dto.nights,
    days: dto.days,
    travelDays,
    places: travelDays.flatMap((day) => day.places),
    photos: dto.files.map(mapFileBoxItemToPhoto),
    files: dto.files,
    tags: dto.tags.map(mapTravelTagString),
    review: dto.review ? mapTravelReviewDto(dto.review) : null,
  };
}
