import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import { CalendarToolbar } from '../CalendarToolbar';

describe('CalendarToolbar', () => {
  it('renders navigation, view toggle and create action', async () => {
    const onPrev = vi.fn();
    const onToday = vi.fn();
    const onNext = vi.fn();
    const onCreate = vi.fn();
    const onManageCalendars = vi.fn();
    const onViewChange = vi.fn();
    const onToggleCalendar = vi.fn();
    const { user } = renderWithProviders(
      <CalendarToolbar
        navigation={{
          label: '2026년 4월',
          currentDate: '2026-04-01',
          activeView: 'month',
          onViewChange,
          onPrev,
          onToday,
          onNext,
        }}
        filters={{
          calendars: [
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
          ],
          visibleCalendarIds: ['cal-1'],
          createDisabled: false,
          onToggleCalendar,
          onCreate,
        }}
        onManageCalendars={onManageCalendars}
      />
    );

    expect(screen.getByText('2026년 4월')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '이전 달' }));
    await user.click(screen.getByRole('button', { name: '오늘' }));
    await user.click(screen.getByRole('button', { name: '다음 달' }));
    await user.click(screen.getByRole('tab', { name: '주' }));
    await user.click(screen.getByRole('button', { name: '일정 추가' }));
    await user.click(screen.getByRole('button', { name: '캘린더 관리' }));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onToday).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onViewChange).toHaveBeenCalledWith('week');
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onManageCalendars).toHaveBeenCalledTimes(1);
  });
});
