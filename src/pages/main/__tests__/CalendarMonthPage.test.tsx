import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { QueryProvider } from '../../../app/providers/QueryProvider';
import { createTestQueryClient } from '../../../test/helpers/query-client';
import { CalendarMonthPage } from '../CalendarMonthPage';

const { useCalendarMonth } = vi.hoisted(() => ({
  useCalendarMonth: vi.fn(),
}));

vi.mock('../../../domains/calendar/hooks/useCalendarMonth', () => ({
  useCalendarMonth,
}));

vi.mock('../../../domains/calendar/components/CalendarSection', () => ({
  CalendarSection: ({
    state,
  }: {
    state: { label: string };
  }) => <div>{state.label}</div>,
}));

describe('CalendarMonthPage', () => {
  it('passes loaded month state into the shared section', () => {
    useCalendarMonth.mockReturnValue({
      label: '2026년 4월',
      calendars: [],
      schedules: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const queryClient = createTestQueryClient();

    function Wrapper({ children }: PropsWithChildren) {
      return (
        <QueryProvider client={queryClient}>
          <MemoryRouter initialEntries={['/main/calendar?date=2026-04-14']}>
            {children}
          </MemoryRouter>
        </QueryProvider>
      );
    }

    render(<CalendarMonthPage />, { wrapper: Wrapper });

    expect(screen.getByText('2026년 4월')).toBeTruthy();
    expect(useCalendarMonth).toHaveBeenCalledWith('2026-04-14');
  });
});
