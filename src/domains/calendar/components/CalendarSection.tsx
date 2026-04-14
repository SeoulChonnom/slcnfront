import { startTransition, useEffect, useMemo, useState } from 'react';
import type { EventApi, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { DeviceType } from '../../../app/router/route-constants';
import {
  createDraftFromRange,
  createEmptyCalendarEventDraft,
  mapEventApiToSchedulePayload,
  mapScheduleToCalendarEventInput,
  type CalendarEventDraft,
} from '../mappers/schedule-event-mappers';
import type { CalendarMeta, CalendarViewMode, ScheduleEvent } from '../types';
import { useCalendarEventMutations } from '../hooks/useCalendarEventMutations';
import {
  getTodayDateKey,
  normalizeCalendarDateKey,
  shiftMonth,
  shiftWeek,
} from '../utils/calendar-date';
import { CalendarEventModal } from './CalendarEventModal';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarWeekView } from './CalendarWeekView';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceCalendarWeekPath,
} from '../../../lib/routing/route-builders';

type CalendarSectionProps = {
  device: DeviceType;
  view: CalendarViewMode;
  state: {
    label: string;
    calendars: CalendarMeta[];
    schedules: ScheduleEvent[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<unknown>;
  };
};

type CalendarEditorState = {
  isOpen: boolean;
  draft: CalendarEventDraft;
  event: ScheduleEvent | null;
};

function createClosedEditorState(calendarId: string): CalendarEditorState {
  return {
    isOpen: false,
    draft: createEmptyCalendarEventDraft(calendarId),
    event: null,
  };
}

export function CalendarSection({ device, view, state }: CalendarSectionProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDate = normalizeCalendarDateKey(searchParams.get('date'));
  const calendars = state.calendars.filter((calendar) => calendar.visible);
  const schedules = state.schedules;
  const calendarById = useMemo(
    () => new Map(calendars.map((calendar) => [calendar.id, calendar])),
    [calendars],
  );
  const defaultCalendarId =
    calendars.find((calendar) => calendar.defaultSelected)?.id ??
    calendars[0]?.id ??
    '';
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<string[]>([]);
  const [editorState, setEditorState] = useState<CalendarEditorState>(() =>
    createClosedEditorState(defaultCalendarId),
  );
  const { createSchedule, updateSchedule, deleteSchedule, isSubmitting } =
    useCalendarEventMutations();

  useEffect(() => {
    setVisibleCalendarIds((current) => {
      const nextIds = calendars.map((calendar) => calendar.id);

      if (nextIds.length === 0) {
        return [];
      }

      if (current.length === 0) {
        return nextIds;
      }

      const filtered = current.filter((id) => nextIds.includes(id));

      return filtered.length > 0 ? filtered : nextIds;
    });
  }, [calendars]);

  useEffect(() => {
    if (
      !editorState.isOpen &&
      defaultCalendarId &&
      editorState.draft.calendarId !== defaultCalendarId
    ) {
      setEditorState(createClosedEditorState(defaultCalendarId));
    }
  }, [defaultCalendarId, editorState.draft.calendarId, editorState.isOpen]);

  const visibleSchedules = schedules.filter((schedule) =>
    visibleCalendarIds.includes(schedule.calendarId),
  );
  const events = visibleSchedules.map((schedule) =>
    mapScheduleToCalendarEventInput(
      schedule,
      calendarById.get(schedule.calendarId) ?? null,
    ),
  );

  const updateDateParam = (nextDate: string) => {
    startTransition(() => {
      setSearchParams({ date: nextDate });
    });
  };

  const moveDate = (direction: -1 | 1) => {
    updateDateParam(
      view === 'month'
        ? shiftMonth(currentDate, direction)
        : shiftWeek(currentDate, direction),
    );
  };

  const openEditor = (draft: CalendarEventDraft, event: ScheduleEvent | null) => {
    setEditorState({
      isOpen: true,
      draft,
      event,
    });
  };

  const handleEventMutationFromCalendar = async (
    event: EventApi,
    revert: () => void,
  ) => {
    try {
      await updateSchedule(mapEventApiToSchedulePayload(event));
    } catch {
      revert();
    }
  };

  const createDisabled =
    calendars.length === 0 || !calendars.some((calendar) => calendar.editable);

  return (
    <section className="slcn-calendar-page">
      <CalendarToolbar
        label={state.label}
        activeView={view}
        calendars={calendars}
        visibleCalendarIds={visibleCalendarIds}
        createDisabled={createDisabled}
        onToggleCalendar={(calendarId) => {
          setVisibleCalendarIds((current) =>
            current.includes(calendarId)
              ? current.filter((id) => id !== calendarId)
              : [...current, calendarId],
          );
        }}
        onViewChange={(nextView) => {
          const nextPath =
            nextView === 'month'
              ? buildDeviceCalendarMonthPath(device)
              : buildDeviceCalendarWeekPath(device);

          startTransition(() => {
            navigate(`${nextPath}?date=${currentDate}`);
          });
        }}
        onPrev={() => moveDate(-1)}
        onToday={() => updateDateParam(getTodayDateKey())}
        onNext={() => moveDate(1)}
        onCreate={() => {
          openEditor(createEmptyCalendarEventDraft(defaultCalendarId), null);
        }}
      />

      {state.isLoading ? (
        <div className="slcn-calendar-loading">
          <Skeleton className="slcn-calendar-loading__panel" />
          <Skeleton className="slcn-calendar-loading__panel" />
        </div>
      ) : null}

      {!state.isLoading && state.isError ? (
        <ErrorState
          title="일정을 불러오지 못했어요."
          description="잠시 후 다시 시도하거나, 네트워크 상태를 확인해주세요."
          onRetry={() => {
            void state.refetch();
          }}
        />
      ) : null}

      {!state.isLoading && !state.isError && calendars.length === 0 ? (
        <EmptyState
          title="캘린더가 아직 없어요."
          description="표시 가능한 캘린더가 준비되면 일정 화면을 바로 사용할 수 있어요."
        />
      ) : null}

      {!state.isLoading &&
      !state.isError &&
      calendars.length > 0 &&
      visibleCalendarIds.length === 0 ? (
        <EmptyState
          title="표시 중인 캘린더가 없어요."
          description="상단 필터에서 하나 이상의 캘린더를 다시 켜주세요."
        />
      ) : null}

      {!state.isLoading &&
      !state.isError &&
      calendars.length > 0 &&
      visibleCalendarIds.length > 0 ? (
        <>
          {view === 'month' ? (
            <CalendarMonthView
              currentDate={currentDate}
              events={events}
              onSelect={(selection) => {
                openEditor(
                  createDraftFromRange(selection, defaultCalendarId),
                  null,
                );
              }}
              onEventClick={(event) => {
                const selectedEvent = schedules.find(
                  (schedule) => schedule.id === event.id,
                );

                if (!selectedEvent) {
                  return;
                }

                openEditor(
                  createEmptyCalendarEventDraft(selectedEvent.calendarId),
                  selectedEvent,
                );
              }}
              onEventDrop={async (arg: EventDropArg) => {
                await handleEventMutationFromCalendar(arg.event, arg.revert);
              }}
              onEventResize={async (arg: EventResizeDoneArg) => {
                await handleEventMutationFromCalendar(arg.event, arg.revert);
              }}
            />
          ) : (
            <CalendarWeekView
              currentDate={currentDate}
              events={events}
              onSelect={(selection) => {
                openEditor(
                  createDraftFromRange(selection, defaultCalendarId),
                  null,
                );
              }}
              onEventClick={(event) => {
                const selectedEvent = schedules.find(
                  (schedule) => schedule.id === event.id,
                );

                if (!selectedEvent) {
                  return;
                }

                openEditor(
                  createEmptyCalendarEventDraft(selectedEvent.calendarId),
                  selectedEvent,
                );
              }}
              onEventDrop={async (arg: EventDropArg) => {
                await handleEventMutationFromCalendar(arg.event, arg.revert);
              }}
              onEventResize={async (arg: EventResizeDoneArg) => {
                await handleEventMutationFromCalendar(arg.event, arg.revert);
              }}
            />
          )}
        </>
      ) : null}

      <CalendarEventModal
        isOpen={editorState.isOpen}
        calendars={calendars}
        defaultDraft={editorState.draft}
        event={editorState.event}
        isSubmitting={isSubmitting}
        onClose={() => {
          setEditorState(createClosedEditorState(defaultCalendarId));
        }}
        onSubmit={async (payload) => {
          if (editorState.event) {
            await updateSchedule(payload);
            return;
          }

          await createSchedule(payload);
        }}
        onDelete={
          editorState.event
            ? async (id) => {
                await deleteSchedule(id);
              }
            : undefined
        }
      />
    </section>
  );
}
