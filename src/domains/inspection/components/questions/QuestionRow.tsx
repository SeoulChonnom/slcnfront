import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { QuestionVersionHistory } from '@/domains/inspection/components/questions/QuestionVersionHistory';
import { ANSWER_TYPE_LABELS } from '@/domains/inspection/components/questions/question-copy';
import { useUpdateInspectionQuestionStatus } from '@/domains/inspection/hooks/inspection-queries';
import type { InspectionQuestion } from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';

type QuestionRowProps = {
  question: InspectionQuestion;
  onEdit: () => void;
  reorderMode: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  draggableProps?: {
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    isDragging: boolean;
  };
};

const CONFLICT_MESSAGE =
  '질문이 이미 수정되었습니다. 새로고침 후 다시 시도하세요.';

/**
 * screen_design.md §5.5. §34.4 — there is no delete button. The only
 * lifecycle control is the "사용/미사용" toggle; disabling is the entire
 * removal story (api.md §9: "삭제 API는 없다").
 */
export function QuestionRow({
  question,
  onEdit,
  reorderMode,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  draggableProps,
}: QuestionRowProps) {
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const statusMutation = useUpdateInspectionQuestionStatus(question.questionId);

  const choicesSummary =
    question.choices.length > 0
      ? `보기 ${question.choices.length}개: ${question.choices
          .map((choice) => choice.label)
          .join(' / ')}`
      : null;

  async function handleToggle() {
    setToggleError(null);
    try {
      await statusMutation.mutateAsync(!question.enabled);
    } catch (error) {
      setToggleError(
        error instanceof AppError && error.status === 409
          ? CONFLICT_MESSAGE
          : '변경하지 못했습니다. 다시 시도해 주세요.'
      );
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag reorder is opt-in via [순서 변경]; the row is also a plain list item with a "수정" button and keyboard-reachable ↑/↓ move buttons as the accessible path
    <div
      className='slcn-inspection-qrow slcn-inspection-hairline-row'
      data-unused={!question.enabled}
      data-dragging={draggableProps?.isDragging || undefined}
      draggable={reorderMode}
      onDragStart={draggableProps?.onDragStart}
      onDragOver={draggableProps?.onDragOver}
      onDrop={draggableProps?.onDrop}
      onDragEnd={draggableProps?.onDragEnd}
    >
      {reorderMode ? (
        <div className='slcn-inspection-qrow__reorder-controls'>
          <span
            className='slcn-inspection-qrow__reorder-grab'
            aria-hidden='true'
            title='드래그해서 순서 변경'
          >
            <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
              <circle cx='9' cy='6' r='1.5' />
              <circle cx='9' cy='12' r='1.5' />
              <circle cx='9' cy='18' r='1.5' />
              <circle cx='15' cy='6' r='1.5' />
              <circle cx='15' cy='12' r='1.5' />
              <circle cx='15' cy='18' r='1.5' />
            </svg>
          </span>
          <button
            type='button'
            className='slcn-inspection-qrow__move'
            aria-label={`${question.content} 위로 이동`}
            onClick={onMoveUp}
            disabled={isFirst}
          >
            ↑
          </button>
          <button
            type='button'
            className='slcn-inspection-qrow__move'
            aria-label={`${question.content} 아래로 이동`}
            onClick={onMoveDown}
            disabled={isLast}
          >
            ↓
          </button>
        </div>
      ) : (
        <span className='slcn-inspection-qrow__grab' aria-hidden='true' />
      )}

      <div className='slcn-inspection-qrow__main'>
        <p className='slcn-inspection-qrow__text'>{question.content}</p>
        <p className='slcn-inspection-qrow__sub'>
          v{question.currentVersionNo} · 답변 {question.answerCount ?? '—'}건
          {choicesSummary ? ` · ${choicesSummary}` : ''}
        </p>
        <button
          type='button'
          className='slcn-inspection-qrow__history-toggle'
          aria-expanded={isHistoryOpen}
          onClick={() => setHistoryOpen((prev) => !prev)}
        >
          버전 기록 {isHistoryOpen ? '숨기기' : '보기'}
        </button>
        {isHistoryOpen ? (
          <QuestionVersionHistory questionId={question.questionId} />
        ) : null}
      </div>

      {reorderMode ? null : (
        <>
          <div className='slcn-inspection-qrow__meta'>
            <span className='slcn-inspection-question-type'>
              {ANSWER_TYPE_LABELS[question.answerType]}
            </span>
          </div>
          <div className='slcn-inspection-qrow__meta'>
            {question.required ? (
              <span className='slcn-inspection-question-required'>필수</span>
            ) : (
              <span className='slcn-inspection-qrow__optional'>선택</span>
            )}
          </div>
          <div className='slcn-inspection-qrow__meta'>
            <button
              type='button'
              role='switch'
              aria-checked={question.enabled}
              aria-label={`${question.content} 사용 여부`}
              className='slcn-toggle'
              data-on={question.enabled}
              disabled={statusMutation.isPending}
              onClick={() => void handleToggle()}
            >
              <span className='slcn-toggle__thumb' aria-hidden='true' />
            </button>
            <span className='slcn-inspection-qrow__toggle-label'>
              {question.enabled ? '사용중' : '미사용'}
            </span>
          </div>
          <Button
            variant='secondary'
            size='sm'
            className='slcn-inspection-qrow__edit'
            onClick={onEdit}
          >
            수정
          </Button>
        </>
      )}

      {toggleError ? (
        <p className='slcn-inspection-qrow__error' role='alert'>
          {toggleError}
        </p>
      ) : null}
    </div>
  );
}
