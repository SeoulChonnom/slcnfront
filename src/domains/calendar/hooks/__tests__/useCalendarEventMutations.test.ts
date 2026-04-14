import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createTestQueryClient } from '../../../../test/helpers/query-client';
import { scheduleQueryKeys } from '../../../../lib/api/query-keys';
import { useCalendarEventMutations } from '../useCalendarEventMutations';

const { createSchedule, updateSchedule, deleteSchedule } = vi.hoisted(() => ({
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
}));

vi.mock('../../api/schedule-api', () => ({
  scheduleApi: {
    createSchedule,
    updateSchedule,
    deleteSchedule,
  },
}));

function createWrapper(client = createTestQueryClient()) {
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useCalendarEventMutations', () => {
  it('calls create, update and delete APIs then invalidates schedule queries', async () => {
    const client = createTestQueryClient();
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    createSchedule.mockResolvedValueOnce({
      id: 'schedule-1',
    });
    updateSchedule.mockResolvedValueOnce({
      id: 'schedule-1',
    });
    deleteSchedule.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCalendarEventMutations(), {
      wrapper: createWrapper(client),
    });

    await result.current.createSchedule({
      calendarId: 'cal-1',
      title: '생성',
      body: '',
      start: '2026-04-14T09:00:00+09:00',
      end: '2026-04-14T10:00:00+09:00',
      allDay: false,
      location: '',
    });
    await result.current.updateSchedule({
      id: 'schedule-1',
      calendarId: 'cal-1',
      title: '수정',
      body: '',
      start: '2026-04-14T09:00:00+09:00',
      end: '2026-04-14T10:00:00+09:00',
      allDay: false,
      location: '',
    });
    await result.current.deleteSchedule('schedule-1');

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: scheduleQueryKeys.all,
      });
    });
    expect(createSchedule).toHaveBeenCalledTimes(1);
    expect(updateSchedule).toHaveBeenCalledTimes(1);
    expect(deleteSchedule).toHaveBeenCalledWith('schedule-1');
  });
});
