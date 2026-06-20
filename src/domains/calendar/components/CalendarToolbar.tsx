import { Button } from '../../../components/ui/Button';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { cn } from '../../../lib/utils/cn';
import type {
  CalendarFiltersModel,
  CalendarNavigationModel,
} from '../hooks/useCalendarSectionController';

type CalendarToolbarProps = {
  navigation: CalendarNavigationModel;
  filters: CalendarFiltersModel;
  onManageCalendars: () => void;
  className?: string;
};

export function CalendarToolbar({
  navigation,
  filters,
  onManageCalendars,
  className,
}: CalendarToolbarProps) {
  return (
    <div className={cn('slcn-calendar-toolbar', className)}>
      <div className='slcn-calendar-toolbar__heading'>
        <p className='slcn-calendar-toolbar__eyebrow'>서울 촌놈 나들이 일정</p>
        <h1 className='slcn-calendar-toolbar__title'>{navigation.label}</h1>
      </div>
      <div className='slcn-calendar-toolbar__controls'>
        <div className='slcn-calendar-toolbar__nav'>
          <Button
            variant='ghost'
            size='sm'
            className='slcn-calendar-toolbar__nav-arrow'
            onClick={navigation.onPrev}
            aria-label='이전 달'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              aria-hidden='true'
            >
              <path d='M15 18l-6-6 6-6' />
            </svg>
          </Button>
          <Button variant='secondary' size='sm' onClick={navigation.onToday}>
            오늘
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='slcn-calendar-toolbar__nav-arrow'
            onClick={navigation.onNext}
            aria-label='다음 달'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              aria-hidden='true'
            >
              <path d='M9 18l6-6-6-6' />
            </svg>
          </Button>
        </div>
        <SegmentedControl
          className='slcn-calendar-toolbar__view-toggle'
          value={navigation.activeView}
          options={[
            { label: '월', value: 'month' },
            { label: '주', value: 'week' },
          ]}
          onChange={(value) =>
            navigation.onViewChange(value as typeof navigation.activeView)
          }
        />
        <Button
          variant='primary'
          size='sm'
          disabled={filters.createDisabled}
          onClick={filters.onCreate}
        >
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            aria-hidden='true'
          >
            <path d='M12 5v14M5 12h14' />
          </svg>
          일정 추가
        </Button>
      </div>
      <div className='slcn-calendar-toolbar__legend-row'>
        <p className='slcn-calendar-toolbar__legend-label'>캘린더 필터</p>
        <div className='slcn-calendar-toolbar__legend'>
          {filters.calendars.map((calendar) => {
            const active = filters.visibleCalendarIds.includes(calendar.id);

            return (
              <button
                key={calendar.id}
                type='button'
                className='slcn-calendar-toolbar__chip'
                data-active={active}
                onClick={() => filters.onToggleCalendar(calendar.id)}
              >
                <span
                  className='slcn-calendar-toolbar__chip-dot'
                  style={{ backgroundColor: calendar.backgroundColor }}
                  aria-hidden='true'
                />
                <span>{calendar.name}</span>
              </button>
            );
          })}
        </div>
        <Button variant='secondary' size='sm' onClick={onManageCalendars}>
          <svg
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            aria-hidden='true'
          >
            <path d='M12 15a3 3 0 100-6 3 3 0 000 6z' />
            <path d='M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' />
          </svg>
          캘린더 관리
        </Button>
      </div>
    </div>
  );
}
