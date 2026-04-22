import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '../api/calendar-api';
import { calendarQueryKeys, calendarScheduleQueryKeys } from '../query-keys';
import type { CalendarCreatePayload, CalendarUpdatePayload } from '../types';

export function useCalendarMutations() {
  const queryClient = useQueryClient();
  const invalidateCalendarData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.all }),
      queryClient.invalidateQueries({
        queryKey: calendarScheduleQueryKeys.all,
      }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: (payload: CalendarCreatePayload) =>
      calendarApi.createCalendar(payload),
    onSuccess: invalidateCalendarData,
  });
  const updateMutation = useMutation({
    mutationFn: (payload: CalendarUpdatePayload) =>
      calendarApi.updateCalendar(payload),
    onSuccess: invalidateCalendarData,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarApi.deleteCalendar(id),
    onSuccess: invalidateCalendarData,
  });

  return {
    createCalendar: createMutation.mutateAsync,
    updateCalendar: updateMutation.mutateAsync,
    deleteCalendar: deleteMutation.mutateAsync,
    isSubmitting:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
