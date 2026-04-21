import { useQuery } from '@tanstack/react-query';
import {
  doesScheduleOverlapRange,
  type CalendarRange,
} from '../utils/calendar-date';
import { calendarQueryKeys } from '../query-keys';
import { calendarApi } from '../api/calendar-api';
import { scheduleApi } from '../api/schedule-api';
import type { CalendarMeta, ScheduleEvent } from '../types';

type UseCalendarRangeDataOptions = {
  dateKey: string;
  getRange: (dateKey: string) => CalendarRange;
  getLabel: (dateKey: string) => string;
  getScheduleQueryKey: (
    dateKey: string,
    range: CalendarRange,
  ) => readonly unknown[];
};

type CalendarRangeDataState = {
  label: string;
  range: CalendarRange;
  calendars: CalendarMeta[];
  schedules: ScheduleEvent[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

export function useCalendarRangeData({
  dateKey,
  getRange,
  getLabel,
  getScheduleQueryKey,
}: UseCalendarRangeDataOptions): CalendarRangeDataState {
  const range = getRange(dateKey);
  const calendarsQuery = useQuery({
    queryKey: calendarQueryKeys.calendars(),
    queryFn: () => calendarApi.getCalendars(),
  });
  const schedulesQuery = useQuery({
    queryKey: getScheduleQueryKey(dateKey, range),
    queryFn: () => scheduleApi.getSchedulesInRange(range),
  });

  const schedules = (schedulesQuery.data ?? []).filter((schedule) =>
    doesScheduleOverlapRange(
      schedule.start,
      schedule.end,
      range.start,
      range.end,
      schedule.allDay,
    ),
  );

  return {
    label: getLabel(dateKey),
    range,
    calendars: calendarsQuery.data ?? [],
    schedules,
    isLoading: calendarsQuery.isLoading || schedulesQuery.isLoading,
    isError: calendarsQuery.isError || schedulesQuery.isError,
    refetch: async () => {
      await Promise.all([calendarsQuery.refetch(), schedulesQuery.refetch()]);
    },
  };
}
