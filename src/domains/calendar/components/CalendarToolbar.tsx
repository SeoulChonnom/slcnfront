import type { CalendarMeta, CalendarViewMode } from '../types';
import { Button } from '../../../components/ui/Button';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { cn } from '../../../lib/utils/cn';

type CalendarToolbarProps = {
  label: string;
  activeView: CalendarViewMode;
  calendars: CalendarMeta[];
  visibleCalendarIds: string[];
  onToggleCalendar: (calendarId: string) => void;
  onViewChange: (view: CalendarViewMode) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  onCreate: () => void;
  createDisabled?: boolean;
  className?: string;
};

export function CalendarToolbar({
  label,
  activeView,
  calendars,
  visibleCalendarIds,
  onToggleCalendar,
  onViewChange,
  onPrev,
  onToday,
  onNext,
  onCreate,
  createDisabled = false,
  className,
}: CalendarToolbarProps) {
  return (
    <div className={cn('slcn-calendar-toolbar', className)}>
      <div className="slcn-calendar-toolbar__heading">
        <p className="slcn-calendar-toolbar__eyebrow">서울촌놈 나들이 일정 🗓️</p>
        <h1 className="slcn-calendar-toolbar__title display-hand">{label}</h1>
      </div>
      <div className="slcn-calendar-toolbar__controls">
        <div className="slcn-calendar-toolbar__nav">
          <Button variant="ghost" size="sm" onClick={onPrev}>
            이전
          </Button>
          <Button variant="secondary" size="sm" onClick={onToday}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={onNext}>
            다음
          </Button>
        </div>
        <SegmentedControl
          className="slcn-calendar-toolbar__view-toggle"
          value={activeView}
          options={[
            { label: '월', value: 'month' },
            { label: '주', value: 'week' },
          ]}
          onChange={(value) => onViewChange(value as CalendarViewMode)}
        />
        <Button
          variant="primary"
          size="sm"
          disabled={createDisabled}
          onClick={onCreate}
        >
          일정 추가
        </Button>
      </div>
      <div className="slcn-calendar-toolbar__legend" aria-label="캘린더 필터">
        {calendars.map((calendar) => {
          const active = visibleCalendarIds.includes(calendar.id);

          return (
            <button
              key={calendar.id}
              type="button"
              className="slcn-calendar-toolbar__chip"
              data-active={active}
              onClick={() => onToggleCalendar(calendar.id)}
            >
              <span
                className="slcn-calendar-toolbar__chip-dot"
                style={{ backgroundColor: calendar.backgroundColor }}
                aria-hidden="true"
              />
              <span>{calendar.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
