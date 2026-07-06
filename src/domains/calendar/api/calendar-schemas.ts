import { z } from 'zod';
import { parseOrThrow } from '../../../lib/api/errors';

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
  return parseOrThrow(z.array(calendarMetaSchema), payload, 'Calendar list');
}

export function parseCalendarResponse(
  payload: unknown,
  context: 'create' | 'update'
) {
  return parseOrThrow(
    calendarMetaSchema,
    payload,
    context === 'create' ? 'Calendar create' : 'Calendar update'
  );
}

export function parseScheduleListResponse(
  payload: unknown,
  context: 'current' | 'range'
) {
  return parseOrThrow(
    z.array(scheduleEventSchema),
    payload,
    context === 'current' ? 'Current schedules' : 'Schedule range'
  );
}

export function parseScheduleResponse(
  payload: unknown,
  context: 'create' | 'update'
) {
  return parseOrThrow(
    scheduleEventSchema,
    payload,
    context === 'create' ? 'Schedule create' : 'Schedule update'
  );
}
