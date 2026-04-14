import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { scheduleQueryKeys } from '../../../lib/api/query-keys';
import { calendarApi } from '../api/calendar-api';
import { scheduleApi } from '../api/schedule-api';
import { doesScheduleOverlapRange, formatMonthLabel, getMonthRange } from '../utils/calendar-date';

export function useCalendarMonth(dateKey: string) {
  const range = getMonthRange(dateKey);
  const anchor = dayjs(dateKey);
  const anchorYear = anchor.year();
  const anchorMonth = anchor.month() + 1;
  const calendarsQuery = useQuery({
    queryKey: scheduleQueryKeys.calendars(),
    queryFn: () => calendarApi.getCalendars(),
  });
  const schedulesQuery = useQuery({
    queryKey: scheduleQueryKeys.month(anchorYear, anchorMonth),
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
    label: formatMonthLabel(dateKey),
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
