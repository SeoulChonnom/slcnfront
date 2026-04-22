import { z } from 'zod';
import { createInvalidResponseError } from '../../../lib/api/errors';

const calendarMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  backgroundColor: z.string(),
  borderColor: z.string(),
  textColor: z.string(),
  visible: z.boolean(),
  editable: z.boolean(),
  startEditable: z.boolean(),
  durationEditable: z.boolean(),
  defaultSelected: z.boolean(),
  sortOrder: z.number(),
});

const scheduleEventSchema = z.object({
  id: z.string(),
  calendarId: z.string(),
  title: z.string(),
  body: z.string(),
  start: z.string(),
  end: z.string(),
  allDay: z.boolean(),
  location: z.string(),
});

export type CalendarMetaDto = z.infer<typeof calendarMetaSchema>;
export type ScheduleEventDto = z.infer<typeof scheduleEventSchema>;

export function parseCalendarListResponse(payload: unknown) {
  const result = z.array(calendarMetaSchema).safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError('Calendar list', {
      issues: result.error.issues,
      payload,
    });
  }

  return result.data;
}

export function parseCalendarResponse(
  payload: unknown,
  context: 'create' | 'update'
) {
  const result = calendarMetaSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(
      context === 'create' ? 'Calendar create' : 'Calendar update',
      {
        issues: result.error.issues,
        payload,
      }
    );
  }

  return result.data;
}

export function parseScheduleListResponse(
  payload: unknown,
  context: 'current' | 'range'
) {
  const result = z.array(scheduleEventSchema).safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(
      context === 'current' ? 'Current schedules' : 'Schedule range',
      {
        issues: result.error.issues,
        payload,
      }
    );
  }

  return result.data;
}

export function parseScheduleResponse(
  payload: unknown,
  context: 'create' | 'update'
) {
  const result = scheduleEventSchema.safeParse(payload);

  if (!result.success) {
    throw createInvalidResponseError(
      context === 'create' ? 'Schedule create' : 'Schedule update',
      {
        issues: result.error.issues,
        payload,
      }
    );
  }

  return result.data;
}
