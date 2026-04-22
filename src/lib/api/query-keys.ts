export const authQueryKeys = {
  all: ['auth'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
};

export const tripQueryKeys = {
  all: ['trip'] as const,
  list: () => [...tripQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...tripQueryKeys.all, 'detail', id] as const,
  quiz: (tripId: string) => [...tripQueryKeys.all, 'quiz', tripId] as const,
  file: (path: string) => [...tripQueryKeys.all, 'file', path] as const,
};

export const scheduleQueryKeys = {
  all: ['schedule'] as const,
  calendars: () => [...scheduleQueryKeys.all, 'calendars'] as const,
  range: (start: string, end: string) =>
    [...scheduleQueryKeys.all, 'range', start, end] as const,
  month: (year: number, month: number) =>
    [...scheduleQueryKeys.all, 'month', year, month] as const,
  week: (startDate: string) =>
    [...scheduleQueryKeys.all, 'week', startDate] as const,
};

export const shoesQueryKeys = {
  all: ['shoes'] as const,
  catalog: () => [...shoesQueryKeys.all, 'catalog'] as const,
  detail: (brand: string, shoesName: string) =>
    [...shoesQueryKeys.all, 'detail', brand, shoesName] as const,
};
