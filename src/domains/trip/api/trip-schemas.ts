import { z } from 'zod';
import { parseOrThrow } from '../../../lib/api/errors';

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
  date: z.string(),
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
  return parseOrThrow(z.array(tripListItemSchema), payload, 'Trip list');
}

export function parseTripDetailResponse(
  payload: unknown,
  context: 'detail' | 'register'
) {
  return parseOrThrow(
    tripDetailSchema,
    payload,
    context === 'detail' ? 'Trip detail' : 'Trip register'
  );
}

export function parseTripQuizResponse(payload: unknown) {
  return parseOrThrow(quizRdoSchema, payload, 'Trip quiz');
}

export function parseTripQuizCheckResponse(payload: unknown) {
  return parseOrThrow(quizResultRdoSchema, payload, 'Trip quiz check');
}
