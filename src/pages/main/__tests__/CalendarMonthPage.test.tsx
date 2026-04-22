import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithMinimalProviders } from '../../../test/helpers/render';
import { CalendarMonthPage } from '../CalendarMonthPage';

const { useCalendarMonth } = vi.hoisted(() => ({
  useCalendarMonth: vi.fn(),
}));

vi.mock('../../../domains/calendar/hooks/useCalendarMonth', () => ({
  useCalendarMonth,
}));

vi.mock('../../../domains/calendar/components/CalendarSection', () => ({
  CalendarSection: ({ state }: { state: { label: string } }) => (
    <div>{state.label}</div>
  ),
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

    renderWithMinimalProviders(<CalendarMonthPage />, {
      route: '/main/calendar?date=2026-04-14',
    });

    expect(screen.getByText('2026년 4월')).toBeTruthy();
    expect(useCalendarMonth).toHaveBeenCalledWith('2026-04-14');
  });
});
