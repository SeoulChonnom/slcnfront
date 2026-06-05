import { calendarScheduleQueryKeys } from '../query-keys';
import { formatWeekLabel, getWeekRange } from '../utils/calendar-date';
import { useCalendarRangeData } from './useCalendarRangeData';

export function useCalendarWeek(dateKey: string) {
  return useCalendarRangeData({
    dateKey,
    getRange: getWeekRange,
    getLabel: formatWeekLabel,
    getScheduleQueryKey: (key) => calendarScheduleQueryKeys.week(key),
  });
}
