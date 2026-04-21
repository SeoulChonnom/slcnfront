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
    const onViewChange = vi.fn();
    const onToggleCalendar = vi.fn();
    const { user } = renderWithProviders(
      <CalendarToolbar
        label="2026년 4월"
        activeView="month"
        calendars={[
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
        ]}
        visibleCalendarIds={['cal-1']}
        onToggleCalendar={onToggleCalendar}
        onViewChange={onViewChange}
        onPrev={onPrev}
        onToday={onToday}
        onNext={onNext}
        onCreate={onCreate}
      />,
    );

    expect(screen.getByText('2026년 4월')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '이전' }));
    await user.click(screen.getByRole('button', { name: 'Today' }));
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.click(screen.getByRole('tab', { name: '주' }));
    await user.click(screen.getByRole('button', { name: '일정 추가' }));

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onToday).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onViewChange).toHaveBeenCalledWith('week');
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
