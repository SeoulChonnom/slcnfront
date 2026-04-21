import { useCallback, useMemo, useState, startTransition } from 'react';
import type { EventApi, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceCalendarWeekPath,
} from '../../../lib/routing/route-builders';
import type { CalendarViewMode, ScheduleEvent } from '../types';
import { useCalendarEventMutations } from './useCalendarEventMutations';
import {
  createDraftFromRange,
  createDraftFromSchedule,
  createEmptyCalendarEventDraft,
  mapDraftToSchedulePayload,
  mapScheduleToCalendarEventInput,
  validateCalendarEventDraft,
  type CalendarEventDraft,
} from '../mappers/schedule-event-mappers';
import { mapEventApiToSchedulePayload } from '../mappers/fullcalendar-event-mappers';
import {
  getTodayDateKey,
  normalizeCalendarDateKey,
  shiftMonth,
  shiftWeek,
} from '../utils/calendar-date';
import type { CalendarEventInput, CalendarMeta } from '../types';

export type CalendarSectionState = {
  label: string;
  calendars: CalendarMeta[];
  schedules: ScheduleEvent[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
};

type CalendarEditorState = {
  isOpen: boolean;
  draft: CalendarEventDraft;
  event: ScheduleEvent | null;
  error: string | null;
};

type CalendarSectionControllerProps = {
  device: DeviceType;
  view: CalendarViewMode;
  state: CalendarSectionState;
};

type CalendarSectionControllerResult = {
  currentDate: string;
  label: string;
  calendars: CalendarMeta[];
  visibleCalendarIds: string[];
  events: CalendarEventInput[];
  createDisabled: boolean;
  isLoading: boolean;
  isError: boolean;
  isSubmitting: boolean;
  editor: CalendarEditorState;
  onToggleCalendar: (calendarId: string) => void;
  onViewChange: (nextView: CalendarViewMode) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  onCreate: () => void;
  onRetry: () => void;
  onDraftChange: (patch: Partial<CalendarEventDraft>) => void;
  onCloseEditor: () => void;
  onSubmitEditor: () => Promise<void>;
  onDeleteEditor: () => Promise<void>;
  onSelectRange: (selection: {
    start: Date;
    end: Date;
    allDay: boolean;
  }) => void;
  onDateClick: (selection: { date: Date; allDay: boolean }) => void;
  onEventClick: (event: EventApi) => void;
  onEventDrop: (arg: EventDropArg) => Promise<void>;
  onEventResize: (arg: EventResizeDoneArg) => Promise<void>;
};

function createClosedEditorState(calendarId: string): CalendarEditorState {
  return {
    isOpen: false,
    draft: createEmptyCalendarEventDraft(calendarId),
    event: null,
    error: null,
  };
}

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function buildQuickCreateSelection(date: Date, allDay: boolean) {
  const start = new Date(date);
  const end = new Date(date);

  if (allDay) {
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
  } else {
    end.setHours(end.getHours() + 1);
  }

  return {
    start,
    end,
    allDay,
  };
}

export function useCalendarSectionController({
  device,
  view,
  state,
}: CalendarSectionControllerProps): CalendarSectionControllerResult {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDate = normalizeCalendarDateKey(searchParams.get('date'));
  const calendars = state.calendars.filter((calendar) => calendar.visible);
  const schedules = state.schedules;
  const calendarById = useMemo(
    () => new Map(calendars.map((calendar) => [calendar.id, calendar])),
    [calendars]
  );
  const defaultCalendarId =
    calendars.find((calendar) => calendar.defaultSelected)?.id ??
    calendars[0]?.id ??
    '';
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<
    string[] | null
  >(null);
  const [editorState, setEditorState] = useState<CalendarEditorState>(() =>
    createClosedEditorState('')
  );
  const { createSchedule, updateSchedule, deleteSchedule, isSubmitting } =
    useCalendarEventMutations();

  const visibleCalendarIds = useMemo(() => {
    const nextIds = calendars.map((calendar) => calendar.id);

    if (nextIds.length === 0) {
      return [];
    }

    if (selectedCalendarIds === null) {
      return nextIds;
    }

    return selectedCalendarIds.filter((id) => nextIds.includes(id));
  }, [calendars, selectedCalendarIds]);
  const visibleCalendars = useMemo(
    () =>
      calendars.filter((calendar) => visibleCalendarIds.includes(calendar.id)),
    [calendars, visibleCalendarIds]
  );
  const defaultEditableCalendarId =
    visibleCalendars.find((calendar) => calendar.editable)?.id ?? '';

  const visibleSchedules = useMemo(
    () =>
      schedules.filter((schedule) =>
        visibleCalendarIds.includes(schedule.calendarId)
      ),
    [schedules, visibleCalendarIds]
  );
  const events = useMemo(
    () =>
      visibleSchedules.map((schedule) =>
        mapScheduleToCalendarEventInput(
          schedule,
          calendarById.get(schedule.calendarId) ?? null
        )
      ),
    [calendarById, visibleSchedules]
  );

  const updateDateParam = useCallback(
    (nextDate: string) => {
      startTransition(() => {
        setSearchParams({ date: nextDate });
      });
    },
    [setSearchParams]
  );

  const moveDate = useCallback(
    (direction: -1 | 1) => {
      updateDateParam(
        view === 'month'
          ? shiftMonth(currentDate, direction)
          : shiftWeek(currentDate, direction)
      );
    },
    [currentDate, updateDateParam, view]
  );

  const closeEditor = useCallback(() => {
    setEditorState(createClosedEditorState(defaultCalendarId));
  }, [defaultCalendarId]);

  const openEditor = useCallback(
    (draft: CalendarEventDraft, event: ScheduleEvent | null) => {
      setEditorState({
        isOpen: true,
        draft,
        event,
        error: null,
      });
    },
    []
  );

  const handleEventMutationFromCalendar = useCallback(
    async (event: EventApi, revert: () => void) => {
      try {
        await updateSchedule(mapEventApiToSchedulePayload(event));
      } catch {
        revert();
      }
    },
    [updateSchedule]
  );

  const onDraftChange = useCallback(
    (patch: Partial<CalendarEventDraft>) => {
      setEditorState((current) => {
        if (
          patch.calendarId !== undefined &&
          !calendarById.get(patch.calendarId)?.editable
        ) {
          return current;
        }

        return {
          ...current,
          draft: {
            ...current.draft,
            ...patch,
          },
          error: null,
        };
      });
    },
    [calendarById]
  );

  const onSubmitEditor = useCallback(async () => {
    const error = validateCalendarEventDraft(editorState.draft);

    if (error) {
      setEditorState((current) => ({
        ...current,
        error,
      }));

      return;
    }

    if (!calendarById.get(editorState.draft.calendarId)?.editable) {
      setEditorState((current) => ({
        ...current,
        error: '선택한 캘린더에는 일정을 저장할 수 없어요.',
      }));

      return;
    }

    const payload = mapDraftToSchedulePayload(
      editorState.draft,
      editorState.event?.id
    );

    try {
      if (editorState.event) {
        await updateSchedule(payload);
      } else {
        await createSchedule(payload);
      }

      closeEditor();
    } catch (submitError) {
      setEditorState((current) => ({
        ...current,
        error: getMutationErrorMessage(
          submitError,
          '일정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.'
        ),
      }));
    }
  }, [
    calendarById,
    closeEditor,
    createSchedule,
    editorState.draft,
    editorState.event,
    updateSchedule,
  ]);

  const onDeleteEditor = useCallback(async () => {
    if (!editorState.event) {
      return;
    }

    try {
      await deleteSchedule(editorState.event.id);
      closeEditor();
    } catch (deleteError) {
      setEditorState((current) => ({
        ...current,
        error: getMutationErrorMessage(
          deleteError,
          '일정을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.'
        ),
      }));
    }
  }, [closeEditor, deleteSchedule, editorState.event]);

  const openCreateEditor = useCallback(
    (selection?: { start: Date; end: Date; allDay: boolean }) => {
      if (!defaultEditableCalendarId) {
        return;
      }

      openEditor(
        selection
          ? createDraftFromRange(selection, defaultEditableCalendarId)
          : createEmptyCalendarEventDraft(defaultEditableCalendarId),
        null
      );
    },
    [defaultEditableCalendarId, openEditor]
  );

  const onSelectRange = useCallback(
    (selection: { start: Date; end: Date; allDay: boolean }) => {
      openCreateEditor(selection);
    },
    [openCreateEditor]
  );

  const onDateClick = useCallback(
    (selection: { date: Date; allDay: boolean }) => {
      openCreateEditor(
        buildQuickCreateSelection(selection.date, selection.allDay)
      );
    },
    [openCreateEditor]
  );

  const onEventClick = useCallback(
    (event: EventApi) => {
      const selectedEvent = schedules.find(
        (schedule) => schedule.id === event.id
      );

      if (!selectedEvent) {
        return;
      }

      if (!calendarById.get(selectedEvent.calendarId)?.editable) {
        return;
      }

      openEditor(createDraftFromSchedule(selectedEvent), selectedEvent);
    },
    [calendarById, openEditor, schedules]
  );

  const onCreate = useCallback(() => {
    openCreateEditor();
  }, [openCreateEditor]);

  const onViewChange = useCallback(
    (nextView: CalendarViewMode) => {
      const nextPath =
        nextView === 'month'
          ? buildDeviceCalendarMonthPath(device)
          : buildDeviceCalendarWeekPath(device);

      startTransition(() => {
        navigate(`${nextPath}?date=${currentDate}`);
      });
    },
    [currentDate, device, navigate]
  );

  const onToggleCalendar = useCallback(
    (calendarId: string) => {
      setSelectedCalendarIds((current) => {
        const baseIds = current ?? calendars.map((calendar) => calendar.id);

        return baseIds.includes(calendarId)
          ? baseIds.filter((id) => id !== calendarId)
          : [...baseIds, calendarId];
      });
    },
    [calendars]
  );

  return {
    currentDate,
    label: state.label,
    calendars,
    visibleCalendarIds,
    events,
    createDisabled:
      visibleCalendars.length === 0 ||
      !visibleCalendars.some((calendar) => calendar.editable),
    isLoading: state.isLoading,
    isError: state.isError,
    isSubmitting,
    editor: editorState,
    onToggleCalendar,
    onViewChange,
    onPrev: () => moveDate(-1),
    onToday: () => updateDateParam(getTodayDateKey()),
    onNext: () => moveDate(1),
    onCreate,
    onRetry: () => {
      void state.refetch();
    },
    onDraftChange,
    onCloseEditor: closeEditor,
    onSubmitEditor,
    onDeleteEditor,
    onSelectRange,
    onDateClick,
    onEventClick,
    onEventDrop: async (arg: EventDropArg) => {
      const calendarId = String(arg.event.extendedProps['calendarId'] ?? '');
      const calendar = calendarById.get(calendarId);

      if (!calendar?.editable || !calendar.startEditable) {
        arg.revert();
        return;
      }

      await handleEventMutationFromCalendar(arg.event, arg.revert);
    },
    onEventResize: async (arg: EventResizeDoneArg) => {
      const calendarId = String(arg.event.extendedProps['calendarId'] ?? '');
      const calendar = calendarById.get(calendarId);

      if (!calendar?.editable || !calendar.durationEditable) {
        arg.revert();
        return;
      }

      await handleEventMutationFromCalendar(arg.event, arg.revert);
    },
  };
}
