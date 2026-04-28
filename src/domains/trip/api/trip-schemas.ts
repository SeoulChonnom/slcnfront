import { z } from 'zod';
import { createInvalidResponseError } from '../../../lib/api/errors';

const tripListItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.string(),
  name: z.string(),
  logo: z.string(),
});

const tripDetailShape = {
  date: z.string(),
  firstMap: z.string(),
  secondMap: z.string().optional().default(''),
  nextButtonText: z.string().optional().default(''),
  previousButtonText: z.string().optional().default(''),
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
export type OptionRdo = z.infer<typeof optionRdoSchema>;
export type QuizRdo = z.infer<typeof quizRdoSchema>;
export type QuizResultRdo = z.infer<typeof quizResultRdoSchema>;

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
