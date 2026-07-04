import { z } from 'zod';
import { createInvalidResponseError } from '../../../lib/api/errors';

const fileAssetSchema = z.object({
  fileId: z.string(),
  type: z.string(),
  originalFilename: z.string(),
  filename: z.string(),
  path: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

const tripListItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  logo: fileAssetSchema,
});

const tripDetailShape = {
  id: z.string(),
  date: z.string(),
  type: z.string(),
  name: z.string(),
  logo: fileAssetSchema,
  firstMap: fileAssetSchema,
  secondMap: fileAssetSchema.nullable().default(null),
  nextButtonText: z
    .string()
    .nullish()
    .transform((v) => v ?? ''),
  previousButtonText: z
    .string()
    .nullish()
    .transform((v) => v ?? ''),
  driveUrl: z.string(),
};

const tripDetailSchema = z.object(tripDetailShape);

const optionRdoSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const quizRdoSchema = z.object({
  title: z.string(),
  options: z.array(optionRdoSchema),
});

const quizResultRdoSchema = z.object({
  correct: z.boolean(),
  title: z.string(),
  text: z.string(),
});

export type TripListItemDto = z.infer<typeof tripListItemSchema>;
export type TripDetailDto = z.infer<typeof tripDetailSchema>;

export function parseTripListResponse(payload: unknown) {
  const result = z.array(tripListItemSchema).safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError('Trip list', {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}

export function parseTripDetailResponse(
  payload: unknown,
  context: 'detail' | 'register'
) {
  const result = tripDetailSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(
      context === 'detail' ? 'Trip detail' : 'Trip register',
      {
        issues: result.error.issues,
        payload,
      }
    );
  }

  return result.data;
}

export function parseTripQuizResponse(payload: unknown) {
  const result = quizRdoSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError('Trip quiz', {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}

export function parseTripQuizCheckResponse(payload: unknown) {
  const result = quizResultRdoSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError('Trip quiz check', {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}
