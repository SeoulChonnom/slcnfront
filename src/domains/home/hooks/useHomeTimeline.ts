import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { scheduleApi } from '@/domains/calendar/api/schedule-api';
import { calendarScheduleQueryKeys } from '@/domains/calendar/query-keys';
import {
  getNearestSchedules,
  getTravelYears,
  sortTravelsNewestFirst,
} from '@/domains/home/retrieval';
import type { HomeRetrievalModel, HomeSourceState } from '@/domains/home/types';
import { useTravelList } from '@/domains/travel/hooks/useTravelList';
import { useTripList } from '@/domains/trip/hooks/useTripList';

const UPCOMING_LIMIT = 3;

function isQueryLoading(query: { isLoading?: boolean; isPending?: boolean }) {
  return Boolean(query.isLoading || query.isPending);
}

function sourceStatus({
  isLoading,
  isError,
}: {
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) return 'loading' as const;
  if (isError) return 'error' as const;
  return 'ready' as const;
}

function createSourceState<T>(
  query: {
    data?: T[];
    isLoading?: boolean;
    isPending?: boolean;
    isError: boolean;
    error?: unknown;
    refetch: () => unknown;
  },
  data: T[]
): HomeSourceState<T> {
  const isLoading = isQueryLoading(query);

  return {
    data,
    status: sourceStatus({ isLoading, isError: query.isError }),
    isLoading,
    isError: query.isError,
    error: query.error ?? null,
    retry: () => {
      void query.refetch();
    },
  };
}

export function useHomeTimeline(): HomeRetrievalModel {
  const trips = useTripList();
  const travels = useTravelList();
  const schedules = useQuery({
    queryKey: calendarScheduleQueryKeys.now(),
    queryFn: () => scheduleApi.getCurrentSchedules(),
  });

  const travelData = travels.data ?? [];
  const scheduleData = schedules.data ?? [];
  const dayOutData = trips.data ?? [];
  const nearestSchedules = useMemo(
    () => getNearestSchedules(scheduleData, new Date(), UPCOMING_LIMIT),
    [scheduleData]
  );
  const sortedTravels = useMemo(
    () => sortTravelsNewestFirst(travelData),
    [travelData]
  );
  const years = useMemo(() => getTravelYears(travelData), [travelData]);
  const sources = useMemo(
    () => ({
      travels: createSourceState(travels, travelData),
      schedules: createSourceState(schedules, scheduleData),
      dayOuts: createSourceState(trips, dayOutData),
    }),
    [travelData, scheduleData, dayOutData, travels, schedules, trips]
  );
  const sourceStates = [sources.travels, sources.schedules, sources.dayOuts];
  const failedSources = sourceStates.filter((source) => source.isError).length;

  function retry() {
    sources.travels.retry();
    sources.schedules.retry();
    sources.dayOuts.retry();
  }

  function retrySource(source: 'travels' | 'schedules' | 'dayOuts') {
    sources[source].retry();
  }

  return {
    travels: sortedTravels,
    nearestSchedules,
    dayOuts: dayOutData,
    years,
    sources,
    isPartialFailure: failedSources > 0 && failedSources < sourceStates.length,
    isError: failedSources === sourceStates.length,
    isLoading: sourceStates.some((source) => source.isLoading),
    retry,
    retrySource,
  };
}
