import { z } from 'zod';
import { createInvalidResponseError } from '../../../lib/api/errors';

const tripQuizChoiceSchema = z.object({
  quizIndex: z.string(),
  answer: z.string(),
});

const tripListItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  name: z.string(),
  logo: z.string(),
  quizTitle: z.string(),
  quizAnswer: z.string(),
  quizAnswerTitle: z.string(),
  quizAnswerText: z.string(),
  quizErrorTitle: z.string(),
  quizErrorText: z.string(),
  quizList: z.array(tripQuizChoiceSchema),
});

const tripDetailShape = {
  date: z.string(),
  firstMap: z.string(),
  secondMap: z.string().optional().default(''),
  nextButtonText: z.string().optional().default(''),
  previousButtonText: z.string().optional().default(''),
};

const tripDetailSchema = z
  .object({
    ...tripDetailShape,
    drive: z.string(),
  })
  .or(
    z
      .object({
        ...tripDetailShape,
        driveUrl: z.string(),
      })
      .transform(({ driveUrl, ...rest }) => ({
        ...rest,
        drive: driveUrl,
      }))
  );

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
