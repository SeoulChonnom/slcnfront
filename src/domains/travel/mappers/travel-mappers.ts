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
  TravelPhotoCdo,
  TravelPlace,
  TravelReview,
  TravelTag,
  TravelUdo,
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

export function mapTravelTagString(tag: string): TravelTag {
  return { name: tag };
}

export function mapFileBoxItemToPhoto(dto: FileBoxItemRdoDto): TravelPhoto {
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

function toPhotoCdo(photo: TravelPhoto): TravelPhotoCdo {
  return {
    photoFileId: photo.photoFileId,
    travelDayId: photo.travelDayId ?? undefined,
    travelPlaceId: photo.travelPlaceId ?? undefined,
    caption: photo.caption ?? undefined,
    sortOrder: photo.sortOrder,
  };
}

export function buildTravelUdoFromDetail(travel: TravelDetail): TravelUdo {
  return {
    title: travel.title,
    region: travel.region,
    startDate: travel.startDate,
    endDate: travel.endDate,
    coverPhotoId: travel.coverPhotoId ?? undefined,
    tags: travel.tags.map((t) => t.name),
    confirmDeleteDays: false,
    travelDays: travel.travelDays.map((day) => ({
      id: day.id,
      date: day.date,
      title: day.title ?? undefined,
      memo: day.memo ?? undefined,
      coverPhotoId: day.coverPhotoId ?? undefined,
      sortOrder: day.sortOrder,
      photos: day.photos.map(toPhotoCdo),
      places: day.places.map((place) => ({
        name: place.name,
        category: place.category,
        address: place.address ?? undefined,
        memo: place.memo ?? undefined,
        description: place.description ?? undefined,
        sortOrder: place.sortOrder,
        coverPhotoId: place.coverPhotoId ?? undefined,
        photos: place.photos.map(toPhotoCdo),
      })),
    })),
    photos: travel.photos.map(toPhotoCdo),
    review: travel.review
      ? {
          oneLineSummary: travel.review.oneLineSummary ?? undefined,
          goodPoint: travel.review.goodPoint ?? undefined,
          badPoint: travel.review.badPoint ?? undefined,
          revisitPlace: travel.review.revisitPlace ?? undefined,
          finalReview: travel.review.finalReview ?? undefined,
        }
      : {},
  };
}
