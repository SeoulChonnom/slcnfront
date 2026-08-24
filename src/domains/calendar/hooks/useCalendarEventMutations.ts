import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/domains/calendar/api/schedule-api';
import { calendarScheduleQueryKeys } from '@/domains/calendar/query-keys';
import type { ScheduleMutationPayload } from '@/domains/calendar/types';

export function useCalendarEventMutations() {
  const queryClient = useQueryClient();
  const invalidateSchedules = () =>
    queryClient.invalidateQueries({ queryKey: calendarScheduleQueryKeys.all });

  const createMutation = useMutation({
    mutationFn: (payload: ScheduleMutationPayload) =>
      scheduleApi.createSchedule(payload),
    onSuccess: invalidateSchedules,
  });
  const updateMutation = useMutation({
    mutationFn: (payload: ScheduleMutationPayload) =>
      scheduleApi.updateSchedule(payload),
    onSuccess: invalidateSchedules,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduleApi.deleteSchedule(id),
    onSuccess: invalidateSchedules,
  });

  return {
    createSchedule: createMutation.mutateAsync,
    updateSchedule: updateMutation.mutateAsync,
    deleteSchedule: deleteMutation.mutateAsync,
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
