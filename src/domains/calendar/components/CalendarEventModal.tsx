import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { TextareaField, TextField } from '../../../components/ui/TextField';
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
  const title = event ? '일정 수정' : '일정 추가';
  const editableCalendars = calendars.filter((calendar) => calendar.editable);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      align='left'
      titleVariant='heading'
      className='slcn-calendar-modal'
    >
      <form
        className='slcn-calendar-modal__form'
        onSubmit={async (submitEvent) => {
          submitEvent.preventDefault();
          await onSubmit();
        }}
      >
        <TextField
          label='제목'
          value={draft.title}
          placeholder='예) 부암동 나들이'
          autoFocus
          onChange={(changeEvent) => {
            onDraftChange({
              title: changeEvent.target.value,
            });
          }}
          required
        />
        <div className='slcn-calendar-modal__field'>
          <span className='slcn-field__label'>캘린더</span>
          <div className='slcn-calendar-modal__chips'>
            {editableCalendars.map((calendar) => {
              const active = calendar.id === draft.calendarId;

              return (
                <button
                  key={calendar.id}
                  type='button'
                  className='slcn-calendar-modal__chip'
                  data-active={active}
                  aria-pressed={active}
                  disabled={isSubmitting}
                  onClick={() => {
                    onDraftChange({ calendarId: calendar.id });
                  }}
                >
                  <span
                    className='slcn-calendar-modal__chip-dot'
                    style={{ backgroundColor: calendar.backgroundColor }}
                    aria-hidden='true'
                  />
                  <span>{calendar.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <TextareaField
          label='설명'
          value={draft.body}
          onChange={(changeEvent) => {
            onDraftChange({
              body: changeEvent.target.value,
            });
          }}
          rows={4}
        />
        <TextField
          label='장소'
          value={draft.location}
          onChange={(changeEvent) => {
            onDraftChange({
              location: changeEvent.target.value,
            });
          }}
        />
        <label className='slcn-calendar-modal__checkbox'>
          <input
            type='checkbox'
            checked={draft.allDay}
            onChange={(changeEvent) => {
              onDraftChange({
                allDay: changeEvent.target.checked,
              });
            }}
          />
          <span>종일 일정</span>
        </label>
        <div className='slcn-calendar-modal__datetime-grid'>
          <TextField
            label='시작일'
            type='date'
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
              label='시작 시각'
              type='time'
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
            label='종료일'
            type='date'
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
              label='종료 시각'
              type='time'
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
          <p className='slcn-calendar-modal__error' role='alert'>
            {errorMessage}
          </p>
        ) : null}
        <div className='slcn-calendar-modal__actions'>
          {event && onDelete ? (
            <Button
              variant='danger'
              type='button'
              disabled={isSubmitting}
              onClick={async () => {
                await onDelete();
              }}
            >
              삭제
            </Button>
          ) : null}
          <Button
            variant='secondary'
            type='button'
            disabled={isSubmitting}
            onClick={onClose}
          >
            취소
          </Button>
          <Button type='submit' loading={isSubmitting}>
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
}
