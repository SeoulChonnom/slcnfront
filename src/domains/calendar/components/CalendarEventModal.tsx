import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { TextField, TextareaField } from '../../../components/ui/TextField';
import type { CalendarEditorModel } from '../hooks/useCalendarSectionController';

type CalendarEventModalProps = {
  editor: CalendarEditorModel;
};

export function CalendarEventModal({ editor }: CalendarEventModalProps) {
  const {
    isOpen,
    calendars,
    draft,
    event,
    errorMessage,
    isSubmitting,
    onClose,
    onSubmit,
    onDelete,
    onDraftChange,
  } = editor;
  const title = event ? '일정 수정' : '일정 만들기';
  const editableCalendars = calendars.filter((calendar) => calendar.editable);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="일정 내용을 입력하고 바로 저장할 수 있어요."
      className="slcn-calendar-modal"
    >
      <form
        className="slcn-calendar-modal__form"
        onSubmit={async (submitEvent) => {
          submitEvent.preventDefault();
          await onSubmit();
        }}
      >
        <label className="slcn-calendar-modal__select-field">
          <span className="slcn-field__label">캘린더</span>
          <select
            value={draft.calendarId}
            className="slcn-calendar-modal__select"
            disabled={isSubmitting || editableCalendars.length === 0}
            onChange={(changeEvent) => {
              onDraftChange({
                calendarId: changeEvent.target.value,
              });
            }}
          >
            {editableCalendars.map((calendar) => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.name}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="제목"
          value={draft.title}
          autoFocus
          onChange={(changeEvent) => {
            onDraftChange({
              title: changeEvent.target.value,
            });
          }}
          required
        />
        <TextareaField
          label="설명"
          value={draft.body}
          onChange={(changeEvent) => {
            onDraftChange({
              body: changeEvent.target.value,
            });
          }}
          rows={4}
        />
        <TextField
          label="장소"
          value={draft.location}
          onChange={(changeEvent) => {
            onDraftChange({
              location: changeEvent.target.value,
            });
          }}
        />
        <label className="slcn-calendar-modal__checkbox">
          <input
            type="checkbox"
            checked={draft.allDay}
            onChange={(changeEvent) => {
              onDraftChange({
                allDay: changeEvent.target.checked,
              });
            }}
          />
          <span>종일 일정</span>
        </label>
        <div className="slcn-calendar-modal__datetime-grid">
          <TextField
            label="시작일"
            type="date"
            value={draft.startDate}
            onChange={(changeEvent) => {
              onDraftChange({
                startDate: changeEvent.target.value,
              });
            }}
            required
          />
          {!draft.allDay ? (
            <TextField
              label="시작 시각"
              type="time"
              value={draft.startTime}
              onChange={(changeEvent) => {
                onDraftChange({
                  startTime: changeEvent.target.value,
                });
              }}
              required
            />
          ) : null}
          <TextField
            label="종료일"
            type="date"
            value={draft.endDate}
            onChange={(changeEvent) => {
              onDraftChange({
                endDate: changeEvent.target.value,
              });
            }}
            required
          />
          {!draft.allDay ? (
            <TextField
              label="종료 시각"
              type="time"
              value={draft.endTime}
              onChange={(changeEvent) => {
                onDraftChange({
                  endTime: changeEvent.target.value,
                });
              }}
              required
            />
          ) : null}
        </div>
        {errorMessage ? (
          <p className="slcn-calendar-modal__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="slcn-calendar-modal__actions">
          {event && onDelete ? (
            <Button
              variant="danger"
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                await onDelete();
              }}
            >
              삭제
            </Button>
          ) : null}
          <Button
            variant="secondary"
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
          >
            취소
          </Button>
          <Button type="submit" loading={isSubmitting}>
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
}
