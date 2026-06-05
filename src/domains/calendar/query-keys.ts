export const calendarQueryKeys = {
  all: ['calendar'] as const,
  calendars: () => [...calendarQueryKeys.all, 'calendars'] as const,
};

export const calendarScheduleQueryKeys = {
  all: ['calendar', 'schedule'] as const,
  range: (start: string, end: string) =>
    [...calendarScheduleQueryKeys.all, 'range', start, end] as const,
  month: (year: number, month: number) =>
    [...calendarScheduleQueryKeys.all, 'month', year, month] as const,
  week: (startDate: string) =>
    [...calendarScheduleQueryKeys.all, 'week', startDate] as const,
};
