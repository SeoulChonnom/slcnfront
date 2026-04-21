import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { DeviceType } from '../../../app/router/route-constants';
import type { CalendarViewMode } from '../types';
import { CalendarEventModal } from './CalendarEventModal';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarWeekView } from './CalendarWeekView';
import {
  type CalendarSectionState,
  useCalendarSectionController,
} from '../hooks/useCalendarSectionController';

type CalendarSectionProps = {
  device: DeviceType;
  view: CalendarViewMode;
  state: CalendarSectionState;
};

export function CalendarSection({ device, view, state }: CalendarSectionProps) {
  const controller = useCalendarSectionController({ device, view, state });

  return (
    <section className="slcn-calendar-page">
      <CalendarToolbar
        label={controller.label}
        activeView={view}
        calendars={controller.calendars}
        visibleCalendarIds={controller.visibleCalendarIds}
        createDisabled={controller.createDisabled}
        onToggleCalendar={controller.onToggleCalendar}
        onViewChange={controller.onViewChange}
        onPrev={controller.onPrev}
        onToday={controller.onToday}
        onNext={controller.onNext}
        onCreate={controller.onCreate}
      />

      {controller.isLoading ? (
        <div className="slcn-calendar-loading">
          <Skeleton className="slcn-calendar-loading__panel" />
          <Skeleton className="slcn-calendar-loading__panel" />
        </div>
      ) : null}

      {!controller.isLoading && controller.isError ? (
        <ErrorState
          title="일정을 불러오지 못했어요."
          description="잠시 후 다시 시도하거나, 네트워크 상태를 확인해주세요."
          onRetry={() => {
            controller.onRetry();
          }}
        />
      ) : null}

      {!controller.isLoading &&
      !controller.isError &&
      controller.calendars.length === 0 ? (
        <EmptyState
          title="캘린더가 아직 없어요."
          description="표시 가능한 캘린더가 준비되면 일정 화면을 바로 사용할 수 있어요."
        />
      ) : null}

      {!controller.isLoading &&
      !controller.isError &&
      controller.calendars.length > 0 &&
      controller.visibleCalendarIds.length === 0 ? (
        <EmptyState
          title="표시 중인 캘린더가 없어요."
          description="상단 필터에서 하나 이상의 캘린더를 다시 켜주세요."
        />
      ) : null}

      {!controller.isLoading &&
      !controller.isError &&
      controller.calendars.length > 0 &&
      controller.visibleCalendarIds.length > 0 ? (
        <>
          {view === 'month' ? (
            <CalendarMonthView
              currentDate={controller.currentDate}
              events={controller.events}
              onSelect={controller.onSelectRange}
              onEventClick={controller.onEventClick}
              onEventDrop={controller.onEventDrop}
              onEventResize={controller.onEventResize}
            />
          ) : (
            <CalendarWeekView
              currentDate={controller.currentDate}
              events={controller.events}
              onSelect={controller.onSelectRange}
              onEventClick={controller.onEventClick}
              onEventDrop={controller.onEventDrop}
              onEventResize={controller.onEventResize}
            />
          )}
        </>
      ) : null}

      <CalendarEventModal
        isOpen={controller.editor.isOpen}
        calendars={controller.calendars}
        draft={controller.editor.draft}
        event={controller.editor.event}
        errorMessage={controller.editor.error}
        isSubmitting={controller.isSubmitting}
        onClose={controller.onCloseEditor}
        onDraftChange={controller.onDraftChange}
        onSubmit={controller.onSubmitEditor}
        onDelete={
          controller.editor.event ? controller.onDeleteEditor : undefined
        }
      />
    </section>
  );
}
