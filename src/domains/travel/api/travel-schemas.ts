import { z } from 'zod';
import { createInvalidResponseError } from '../../../lib/api/errors';

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

const travelTagRdoSchema = z.object({
  id: z.string(),
  travelId: z.string(),
  name: z.string(),
  sortOrder: z.number().int(),
});

const travelPhotoRdoSchema = z.object({
  id: z.string(),
  travelId: z.string(),
  travelDayId: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  travelPlaceId: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  photoFileId: z.string(),
  caption: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  sortOrder: z.number().int(),
});

const travelPlaceRdoSchema = z.object({
  id: z.string(),
  travelId: z.string(),
  travelDayId: z.string(),
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
  coverPhotoId: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  sortOrder: z.number().int(),
  photos: z.array(travelPhotoRdoSchema).default([]),
});

const travelDayRdoSchema = z.object({
  id: z.string(),
  travelId: z.string(),
  date: z.string(),
  title: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  memo: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  coverPhotoId: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  dayNumber: z.number().int(),
  sortOrder: z.number().int(),
  places: z.array(travelPlaceRdoSchema).default([]),
  photos: z.array(travelPhotoRdoSchema).default([]),
});

const travelReviewRdoSchema = z.object({
  id: z.string(),
  travelId: z.string(),
  content: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
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
  coverPhotoId: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  oneLineReview: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  nights: z.number().int(),
  days: z.number().int(),
  tags: z.array(travelTagRdoSchema).default([]),
});

export const travelDetailRdoSchema = z.object({
  id: z.string(),
  travelId: z.string(),
  title: z.string(),
  region: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  coverPhotoId: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  oneLineReview: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  nights: z.number().int(),
  days: z.number().int(),
  travelDays: z.array(travelDayRdoSchema).default([]),
  places: z.array(travelPlaceRdoSchema).default([]),
  photos: z.array(travelPhotoRdoSchema).default([]),
  tags: z.array(travelTagRdoSchema).default([]),
  review: travelReviewRdoSchema.nullish().transform((v) => v ?? null),
});

// ── Inferred DTO types ────────────────────────────────────────────────────────

export type TravelRdoDto = z.infer<typeof travelRdoSchema>;
export type TravelDetailRdoDto = z.infer<typeof travelDetailRdoSchema>;
export type TravelDayRdoDto = z.infer<typeof travelDayRdoSchema>;
export type TravelPlaceRdoDto = z.infer<typeof travelPlaceRdoSchema>;
export type TravelPhotoRdoDto = z.infer<typeof travelPhotoRdoSchema>;
export type TravelTagRdoDto = z.infer<typeof travelTagRdoSchema>;
export type TravelReviewRdoDto = z.infer<typeof travelReviewRdoSchema>;

// ── Parse helpers ─────────────────────────────────────────────────────────────

export function parseTravelListResponse(payload: unknown): TravelRdoDto[] {
  const result = z.array(travelRdoSchema).safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError('Travel list', {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}

export function parseTravelDetailResponse(
  payload: unknown,
  context: 'detail' | 'create' | 'update'
): TravelDetailRdoDto {
  const result = travelDetailRdoSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(`Travel ${context}`, {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}

export function parseTravelRdoResponse(payload: unknown): TravelRdoDto {
  const result = travelRdoSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError('Travel rdo', {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}
