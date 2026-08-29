import type { ScheduleEvent } from '@/domains/calendar/types';
import type { TravelListItem } from '@/domains/travel/types';
import type { TripListItem } from '@/domains/trip/types';

type HomeSourceStatus = 'loading' | 'ready' | 'error';

export type HomeSourceState<T> = {
  data: T[];
  status: HomeSourceStatus;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
};

type HomeSourceName = 'travels' | 'schedules' | 'dayOuts';

export type HomeRetrievalModel = {
  travels: TravelListItem[];
  nearestSchedules: ScheduleEvent[];
  dayOuts: TripListItem[];
  years: string[];
  sources: {
    travels: HomeSourceState<TravelListItem>;
    schedules: HomeSourceState<ScheduleEvent>;
    dayOuts: HomeSourceState<TripListItem>;
  };
  /** True when at least one source failed while another source is usable. */
  isPartialFailure: boolean;
  /** True only when every independent source failed. */
  isError: boolean;
  isLoading: boolean;
  retry: () => void;
  retrySource: (source: HomeSourceName) => void;
};
