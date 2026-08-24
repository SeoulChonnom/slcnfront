import { useCalendarRangeData } from '@/domains/calendar/hooks/useCalendarRangeData';
import { calendarScheduleQueryKeys } from '@/domains/calendar/query-keys';
import {
  formatWeekLabel,
  getWeekRange,
} from '@/domains/calendar/utils/calendar-date';

export function useCalendarWeek(dateKey: string) {
  return useCalendarRangeData({
    dateKey,
    getRange: getWeekRange,
    getLabel: formatWeekLabel,
    getScheduleQueryKey: (key) => calendarScheduleQueryKeys.week(key),
  });
}
