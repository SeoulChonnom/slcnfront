import { mapScheduleToCalendarEventInput } from '../mappers/schedule-event-mappers';
import type { CalendarEventInput, CalendarMeta, ScheduleEvent } from '../types';

export function getMutationErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function buildQuickCreateSelection(date: Date, allDay: boolean) {
  const start = new Date(date);
  const end = new Date(date);

  if (allDay) {
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
  } else {
    end.setHours(end.getHours() + 1);
  }

  return {
    start,
    end,
    allDay,
  };
}

export function getVisibleCalendarIds(
  calendars: CalendarMeta[],
  selectedCalendarIds: string[] | null
) {
  const nextIds = calendars.map((calendar) => calendar.id);

  if (nextIds.length === 0) {
    return [];
  }

  if (selectedCalendarIds === null) {
    return nextIds;
  }

  return selectedCalendarIds.filter((id) => nextIds.includes(id));
}

export function getVisibleCalendars(
  calendars: CalendarMeta[],
  visibleCalendarIds: string[]
) {
  return calendars.filter((calendar) =>
    visibleCalendarIds.includes(calendar.id)
  );
}

export function getDefaultEditableCalendarId(visibleCalendars: CalendarMeta[]) {
  return visibleCalendars.find((calendar) => calendar.editable)?.id ?? '';
}

export function getVisibleSchedules(
  schedules: ScheduleEvent[],
  visibleCalendarIds: string[]
) {
  return schedules.filter((schedule) =>
    visibleCalendarIds.includes(schedule.calendarId)
  );
}

export function mapSchedulesToCalendarEvents(
  schedules: ScheduleEvent[],
  calendarById: Map<string, CalendarMeta>
): CalendarEventInput[] {
  return schedules.map((schedule) =>
    mapScheduleToCalendarEventInput(
      schedule,
      calendarById.get(schedule.calendarId) ?? null
    )
  );
}

export function getCreateDisabled(visibleCalendars: CalendarMeta[]) {
  return (
    visibleCalendars.length === 0 ||
    !visibleCalendars.some((calendar) => calendar.editable)
  );
}
