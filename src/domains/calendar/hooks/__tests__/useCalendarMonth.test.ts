import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createTestQueryClient } from '../../../../test/helpers/query-client';
import { useCalendarMonth } from '../useCalendarMonth';

const { getCalendars, getSchedulesInRange } = vi.hoisted(() => ({
  getCalendars: vi.fn(),
  getSchedulesInRange: vi.fn(),
}));

vi.mock('../../api/calendar-api', () => ({
  calendarApi: {
    getCalendars,
  },
}));

vi.mock('../../api/schedule-api', () => ({
  scheduleApi: {
    getSchedulesInRange,
  },
}));

function createWrapper() {
  const client = createTestQueryClient();

  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(QueryClientProvider, { client }, children);
  };
}

describe('useCalendarMonth', () => {
  it('loads month range data using the new range API', async () => {
    getCalendars.mockResolvedValueOnce([
      {
        id: 'cal-1',
        name: '아영',
        backgroundColor: '#fe9fc8',
        borderColor: '#fe9fc8',
        textColor: '#111111',
        visible: true,
        editable: true,
        startEditable: true,
        durationEditable: true,
        defaultSelected: true,
        sortOrder: 1,
      },
    ]);
    getSchedulesInRange.mockResolvedValueOnce([
      {
        id: 'schedule-1',
        calendarId: 'cal-1',
        title: '봄 산책',
        body: '',
        start: '2026-04-10T10:00:00+09:00',
        end: '2026-04-10T12:00:00+09:00',
        allDay: false,
        location: '서울',
      },
    ]);

    const { result } = renderHook(() => useCalendarMonth('2026-04-14'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getSchedulesInRange).toHaveBeenCalledWith({
      start: '2026-04-01T00:00:00+09:00',
      end: '2026-05-01T00:00:00+09:00',
    });
    expect(result.current.label).toBe('2026년 4월');
    expect(result.current.schedules).toHaveLength(1);
  });
});
