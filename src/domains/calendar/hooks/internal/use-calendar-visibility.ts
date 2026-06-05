import { useCallback, useMemo, useState } from 'react';
import type { CalendarMeta, ScheduleEvent } from '../../types';
import {
  getCreateDisabled,
  getDefaultEditableCalendarId,
  getVisibleCalendarIds,
  getVisibleCalendars,
  getVisibleSchedules,
  mapSchedulesToCalendarEvents,
} from '../../utils/calendar-controller-helpers';

type UseCalendarVisibilityOptions = {
  calendars: CalendarMeta[];
  schedules: ScheduleEvent[];
};

export function useCalendarVisibility({
  calendars,
  schedules,
}: UseCalendarVisibilityOptions) {
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<
    string[] | null
  >(null);

  const calendarById = useMemo(
    () => new Map(calendars.map((calendar) => [calendar.id, calendar])),
    [calendars]
  );

  const visibleCalendarIds = useMemo(
    () => getVisibleCalendarIds(calendars, selectedCalendarIds),
    [calendars, selectedCalendarIds]
  );

  const visibleCalendars = useMemo(
    () => getVisibleCalendars(calendars, visibleCalendarIds),
    [calendars, visibleCalendarIds]
  );

  const defaultEditableCalendarId = useMemo(
    () => getDefaultEditableCalendarId(visibleCalendars),
    [visibleCalendars]
  );

  const visibleSchedules = useMemo(
    () => getVisibleSchedules(schedules, visibleCalendarIds),
    [schedules, visibleCalendarIds]
  );

  const events = useMemo(
    () => mapSchedulesToCalendarEvents(visibleSchedules, calendarById),
    [visibleSchedules, calendarById]
  );

  const createDisabled = useMemo(
    () => getCreateDisabled(visibleCalendars),
    [visibleCalendars]
  );

  const onToggleCalendar = useCallback(
    (calendarId: string) => {
      setSelectedCalendarIds((current) => {
        const baseIds = current ?? calendars.map((calendar) => calendar.id);

        return baseIds.includes(calendarId)
          ? baseIds.filter((id) => id !== calendarId)
          : [...baseIds, calendarId];
      });
    },
    [calendars]
  );

  return {
    calendarById,
    visibleCalendarIds,
    visibleCalendars,
    defaultEditableCalendarId,
    events,
    createDisabled,
    onToggleCalendar,
  };
}
