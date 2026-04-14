import { useQuery } from '@tanstack/react-query';
import { scheduleQueryKeys } from '../../../lib/api/query-keys';
import { calendarApi } from '../api/calendar-api';
import { scheduleApi } from '../api/schedule-api';
import {
  doesScheduleOverlapRange,
  formatWeekLabel,
  getWeekRange,
} from '../utils/calendar-date';

export function useCalendarWeek(dateKey: string) {
  const range = getWeekRange(dateKey);
  const calendarsQuery = useQuery({
    queryKey: scheduleQueryKeys.calendars(),
    queryFn: () => calendarApi.getCalendars(),
  });
  const schedulesQuery = useQuery({
    queryKey: scheduleQueryKeys.week(dateKey),
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
    label: formatWeekLabel(dateKey),
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
