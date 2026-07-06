import { z } from 'zod';
import { parseOrThrow } from '../../../lib/api/errors';

// ── Shared ────────────────────────────────────────────────────────────────────

const placeCategorySchema = z.enum([
  'TOURIST_SPOT',
  'RESTAURANT',
  'CAFE',
  'ACCOMMODATION',
  'SHOPPING',
  'TRANSPORT',
  'ACTIVITY',
  'ETC',
]);

// ── CDO / UDO schemas (request payloads) ───────────────────────────────────────

export const travelPhotoCdoSchema = z.object({
  travelDayId: z.string().optional(),
  travelPlaceId: z.string().optional(),
  photoFileId: z.string(),
  caption: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const travelReviewUdoSchema = z.object({
  content: z.string().optional(),
  oneLineSummary: z.string().optional(),
  goodPoint: z.string().optional(),
  badPoint: z.string().optional(),
  revisitPlace: z.string().optional(),
  finalReview: z.string().optional(),
});

export const travelPlaceUdoSchema = z.object({
  name: z.string(),
  category: placeCategorySchema,
  address: z.string().optional(),
  memo: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int(),
  coverPhotoId: z.string().optional(),
  photos: z.array(travelPhotoCdoSchema),
});

export const travelDayUdoSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  title: z.string().optional(),
  memo: z.string().optional(),
  coverPhotoId: z.string().optional(),
  sortOrder: z.number().int(),
  photos: z.array(travelPhotoCdoSchema),
  places: z.array(travelPlaceUdoSchema),
});

export const travelCdoSchema = z.object({
  title: z.string(),
  region: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  coverPhotoId: z.string().optional(),
  tags: z.array(z.string()),
  travelDays: z.array(travelDayUdoSchema),
  photos: z.array(travelPhotoCdoSchema),
  review: travelReviewUdoSchema,
});

export const travelUdoSchema = z.object({
  title: z.string(),
  region: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  coverPhotoId: z.string().optional(),
  tags: z.array(z.string()),
  confirmDeleteDays: z.boolean(),
  travelDays: z.array(travelDayUdoSchema),
  photos: z.array(travelPhotoCdoSchema),
  review: travelReviewUdoSchema,
});

// ── RDO schemas ───────────────────────────────────────────────────────────────

const fileAssetSchema = z.object({
  fileId: z.string(),
  type: z.string(),
  filename: z.string(),
  path: z.string(),
});

const fileBoxItemRdoSchema = z.object({
  id: z.string(),
  fileAssetId: z.string(),
  targetType: z.enum(['TRAVEL', 'TRAVEL_DAY', 'TRAVEL_PLACE', 'TRIP']),
  targetId: z.string().nullable(),
  role: z.enum(['COVER', 'GALLERY', 'LOGO', 'FIRST_MAP', 'SECOND_MAP']),
  caption: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  sortOrder: z.number().int(),
  file: fileAssetSchema.optional(),
});

const travelPlaceRdoSchema = z.object({
  placeKey: z.string(),
  name: z.string(),
  category: placeCategorySchema,
  address: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  memo: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  description: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  cover: fileBoxItemRdoSchema.nullish().transform((v) => v ?? null),
  sortOrder: z.number().int(),
  photos: z.array(fileBoxItemRdoSchema).default([]),
});

const travelDayRdoSchema = z.object({
  id: z.string().optional(),
  travelId: z.string().optional(),
  date: z.string(),
  title: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  memo: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  cover: fileBoxItemRdoSchema.nullish().transform((v) => v ?? null),
  dayNumber: z.number().int(),
  sortOrder: z.number().int(),
  places: z.array(travelPlaceRdoSchema).default([]),
  photos: z.array(fileBoxItemRdoSchema).default([]),
});

const travelReviewRdoSchema = z.object({
  oneLineSummary: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  goodPoint: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  badPoint: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  revisitPlace: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  finalReview: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
});

export const travelRdoSchema = z.object({
  id: z.string(),
  travelId: z.string(),
  title: z.string(),
  region: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  cover: fileBoxItemRdoSchema.nullish().transform((v) => v ?? null),
  oneLineReview: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  nights: z.number().int(),
  days: z.number().int(),
  tags: z.array(z.string()).default([]),
});

export const travelDetailRdoSchema = z.object({
  id: z.string(),
  travelId: z.string(),
  title: z.string(),
  region: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  cover: fileBoxItemRdoSchema.nullish().transform((v) => v ?? null),
  oneLineReview: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  nights: z.number().int(),
  days: z.number().int(),
  travelDays: z.array(travelDayRdoSchema).default([]),
  files: z.array(fileBoxItemRdoSchema).default([]),
  tags: z.array(z.string()).default([]),
  review: travelReviewRdoSchema.nullish().transform((v) => v ?? null),
});

// ── Inferred DTO types ────────────────────────────────────────────────────────

export type TravelRdoDto = z.infer<typeof travelRdoSchema>;
export type TravelDetailRdoDto = z.infer<typeof travelDetailRdoSchema>;
export type TravelDayRdoDto = z.infer<typeof travelDayRdoSchema>;
export type TravelPlaceRdoDto = z.infer<typeof travelPlaceRdoSchema>;
export type FileBoxItemRdoDto = z.infer<typeof fileBoxItemRdoSchema>;
export type TravelReviewRdoDto = z.infer<typeof travelReviewRdoSchema>;

// ── Parse helpers ─────────────────────────────────────────────────────────────

export function parseTravelListResponse(payload: unknown): TravelRdoDto[] {
  return parseOrThrow(z.array(travelRdoSchema), payload, 'Travel list');
}

export function parseTravelDetailResponse(
  payload: unknown,
  context: 'detail' | 'create' | 'update'
): TravelDetailRdoDto {
  return parseOrThrow(travelDetailRdoSchema, payload, `Travel ${context}`);
}

export function parseTravelRdoResponse(payload: unknown): TravelRdoDto {
  return parseOrThrow(travelRdoSchema, payload, 'Travel rdo');
}
