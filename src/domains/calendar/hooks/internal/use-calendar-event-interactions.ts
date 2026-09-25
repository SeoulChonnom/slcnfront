import type { EventApi, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { useCallback } from 'react';
import { mapEventApiToSchedulePayload } from '@/domains/calendar/mappers/fullcalendar-event-mappers';
import {
  type CalendarMeta,
  getScheduleKey,
  type ScheduleEvent,
  type ScheduleMutationPayload,
} from '@/domains/calendar/types';
import { buildQuickCreateSelection } from '@/domains/calendar/utils/calendar-controller-helpers';

type UseCalendarEventInteractionsOptions = {
  schedules: ScheduleEvent[];
  calendarById: Map<string, CalendarMeta>;
  openCreateEditor: (selection?: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => void;
  openScheduleEditor: (event: ScheduleEvent) => void;
  updateSchedule: (payload: ScheduleMutationPayload) => Promise<unknown>;
};

export function useCalendarEventInteractions({
  schedules,
  calendarById,
  openCreateEditor,
  openScheduleEditor,
  updateSchedule,
}: UseCalendarEventInteractionsOptions) {
  const handleEventMutationFromCalendar = useCallback(
    async (event: EventApi, revert: () => void) => {
      // Recurring events render non-editable; this guards against a drag that
      // slips through, since saving one would move the whole series.
      if (event.extendedProps.isRecurring) {
        revert();
        return;
      }

      try {
        await updateSchedule(mapEventApiToSchedulePayload(event));
      } catch {
        revert();
      }
    },
    [updateSchedule]
  );

  const onSelectRange = useCallback(
    (selection: { start: Date; end: Date; allDay: boolean }) => {
      openCreateEditor(selection);
    },
    [openCreateEditor]
  );

  const onDateClick = useCallback(
    (selection: { date: Date; allDay: boolean }) => {
      openCreateEditor(
        buildQuickCreateSelection(selection.date, selection.allDay)
      );
    },
    [openCreateEditor]
  );

  const onEventClick = useCallback(
    (event: EventApi) => {
      const selectedEvent = schedules.find(
        (schedule) => getScheduleKey(schedule) === event.id
      );

      if (!selectedEvent) {
        return;
      }

      if (!calendarById.get(selectedEvent.calendarId)?.editable) {
        return;
      }

      openScheduleEditor(selectedEvent);
    },
    [calendarById, openScheduleEditor, schedules]
  );

  const onEventDrop = useCallback(
    async (arg: EventDropArg) => {
      const calendarId = String(arg.event.extendedProps.calendarId ?? '');
      const calendar = calendarById.get(calendarId);

      if (!calendar?.editable || !calendar.startEditable) {
        arg.revert();
        return;
      }

      await handleEventMutationFromCalendar(arg.event, arg.revert);
    },
    [calendarById, handleEventMutationFromCalendar]
  );

  const onEventResize = useCallback(
    async (arg: EventResizeDoneArg) => {
      const calendarId = String(arg.event.extendedProps.calendarId ?? '');
      const calendar = calendarById.get(calendarId);

      if (!calendar?.editable || !calendar.durationEditable) {
        arg.revert();
        return;
      }

      await handleEventMutationFromCalendar(arg.event, arg.revert);
    },
    [calendarById, handleEventMutationFromCalendar]
  );

  return {
    onCreate: () => openCreateEditor(),
    onSelectRange,
    onDateClick,
    onEventClick,
    onEventDrop,
    onEventResize,
  };
}
