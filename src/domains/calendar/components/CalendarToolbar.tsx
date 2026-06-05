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
        <p className='slcn-calendar-toolbar__eyebrow'>서울촌놈 나들이 일정 🗓️</p>
        <h1 className='slcn-calendar-toolbar__title display-hand'>
          {navigation.label}
        </h1>
      </div>
      <div className='slcn-calendar-toolbar__controls'>
        <div className='slcn-calendar-toolbar__nav'>
          <Button variant='ghost' size='sm' onClick={navigation.onPrev}>
            이전
          </Button>
          <Button variant='secondary' size='sm' onClick={navigation.onToday}>
            Today
          </Button>
          <Button variant='ghost' size='sm' onClick={navigation.onNext}>
            다음
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
          일정 추가
        </Button>
      </div>
      <div className='slcn-calendar-toolbar__legend-wrap'>
        <div className='slcn-calendar-toolbar__legend-header'>
          <p className='slcn-calendar-toolbar__legend-label'>캘린더 필터</p>
          <Button variant='secondary' size='sm' onClick={onManageCalendars}>
            캘린더 관리
          </Button>
        </div>
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
      </div>
    </div>
  );
}
