import { useCallback, useMemo, useState } from 'react';
import {
  type CalendarEventDraft,
  createDraftFromRange,
  createDraftFromSchedule,
  createEmptyCalendarEventDraft,
  mapDraftToSchedulePayload,
  validateCalendarEventDraft,
} from '../../mappers/schedule-event-mappers';
import type {
  CalendarMeta,
  ScheduleEvent,
  ScheduleMutationPayload,
} from '../../types';
import { getMutationErrorMessage } from '../../utils/calendar-controller-helpers';

type CalendarEditorState = {
  isOpen: boolean;
  draft: CalendarEventDraft;
  event: ScheduleEvent | null;
  error: string | null;
};

type UseCalendarEditorOptions = {
  calendarById: Map<string, CalendarMeta>;
  defaultEditableCalendarId: string;
  createSchedule: (payload: ScheduleMutationPayload) => Promise<unknown>;
  updateSchedule: (payload: ScheduleMutationPayload) => Promise<unknown>;
  deleteSchedule: (id: string) => Promise<unknown>;
};

function createClosedEditorState(calendarId: string): CalendarEditorState {
  return {
    isOpen: false,
    draft: createEmptyCalendarEventDraft(calendarId),
    event: null,
    error: null,
  };
}

export function useCalendarEditor({
  calendarById,
  defaultEditableCalendarId,
  createSchedule,
  updateSchedule,
  deleteSchedule,
}: UseCalendarEditorOptions) {
  const [editorState, setEditorState] = useState<CalendarEditorState>(() =>
    createClosedEditorState('')
  );

  const closeEditor = useCallback(() => {
    setEditorState(createClosedEditorState(defaultEditableCalendarId));
  }, [defaultEditableCalendarId]);

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

  const openScheduleEditor = useCallback(
    (event: ScheduleEvent) => {
      openEditor(createDraftFromSchedule(event), event);
    },
    [openEditor]
  );

  return useMemo(
    () => ({
      editor: editorState,
      onDraftChange,
      onSubmitEditor,
      onDeleteEditor,
      onCloseEditor: closeEditor,
      openCreateEditor,
      openScheduleEditor,
    }),
    [
      closeEditor,
      editorState,
      onDeleteEditor,
      onDraftChange,
      onSubmitEditor,
      openCreateEditor,
      openScheduleEditor,
    ]
  );
}
