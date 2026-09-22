import type { DragEvent } from 'react';
import { useState } from 'react';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { QuestionFormModal } from '@/domains/inspection/components/questions/QuestionFormModal';
import { QuestionListSkeleton } from '@/domains/inspection/components/questions/QuestionListSkeleton';
import { QuestionRow } from '@/domains/inspection/components/questions/QuestionRow';
import {
  useInspectionQuestions,
  useReorderInspectionQuestions,
} from '@/domains/inspection/hooks/inspection-queries';
import type { InspectionQuestion } from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';

type InspectionQuestionsSectionProps = {
  device: DeviceType;
};

type FormModalState =
  | { mode: 'create' }
  | { mode: 'edit'; question: InspectionQuestion }
  | null;

const REORDER_CONFLICT_MESSAGE =
  '순서를 저장하지 못했습니다. 새로고침 후 다시 시도하세요.';

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || to >= items.length) {
    return items;
  }
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  if (moved === undefined) {
    return items;
  }
  next.splice(to, 0, moved);
  return next;
}

/**
 * screen_design.md §5.5 — the admin question-management screen. Route entry
 * is already gated to `admin` by `RequireRole`
 * (fe_implementation_decisions.md §2); this component assumes that only an
 * admin ever mounts it.
 */
export function InspectionQuestionsSection({
  device,
}: InspectionQuestionsSectionProps) {
  const {
    data: questions,
    isPending,
    isError,
    refetch,
  } = useInspectionQuestions({ includeDisabled: true, withAnswerCount: true });

  const reorderMutation = useReorderInspectionQuestions();

  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [draftOrder, setDraftOrder] = useState<InspectionQuestion[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const sortedQuestions = (questions ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const visibleRows = isReordering ? draftOrder : sortedQuestions;
  const nextSortOrder =
    sortedQuestions.reduce(
      (max, question) => Math.max(max, question.sortOrder),
      0
    ) + 1;

  function startReorder() {
    setReorderError(null);
    setDraftOrder(sortedQuestions);
    setIsReordering(true);
  }

  function cancelReorder() {
    setReorderError(null);
    setIsReordering(false);
    setDraftOrder([]);
  }

  async function saveReorder() {
    setReorderError(null);
    try {
      await reorderMutation.mutateAsync(
        draftOrder.map((question, index) => ({
          id: question.questionId,
          sortOrder: index + 1,
        }))
      );
      setIsReordering(false);
      setDraftOrder([]);
    } catch (error) {
      setReorderError(
        error instanceof AppError && error.status === 409
          ? REORDER_CONFLICT_MESSAGE
          : '순서를 저장하지 못했습니다. 다시 시도해 주세요.'
      );
    }
  }

  function handleDragStart(index: number) {
    return (event: DragEvent<HTMLDivElement>) => {
      setDraggedIndex(index);
      event.dataTransfer.effectAllowed = 'move';
    };
  }

  function handleDragOver(index: number) {
    return (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (draggedIndex === null || draggedIndex === index) {
        return;
      }
      setDraftOrder((prev) => moveItem(prev, draggedIndex, index));
      setDraggedIndex(index);
    };
  }

  function handleDrop(_index: number) {
    return (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    };
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  function handleMove(index: number, direction: -1 | 1) {
    setDraftOrder((prev) => moveItem(prev, index, index + direction));
  }

  return (
    <section data-device={device} className='slcn-inspection-questions-section'>
      <div className='slcn-inspection-questions-section__head'>
        <div>
          <h1 className='slcn-inspection-questions-section__title display-type'>
            질문 관리
          </h1>
          <p className='slcn-inspection-questions-section__subtitle'>
            매물마다 묻는 질문입니다. 여기서 바꾼 내용은{' '}
            <b>앞으로 만드는 매물</b>부터 적용되고, 이미 저장된 답변은 그대로
            남습니다.
          </p>
        </div>
        <div className='slcn-inspection-questions-section__actions'>
          {isReordering ? (
            <>
              <Button
                type='button'
                variant='secondary'
                onClick={cancelReorder}
                disabled={reorderMutation.isPending}
              >
                취소
              </Button>
              <Button
                type='button'
                onClick={() => void saveReorder()}
                loading={reorderMutation.isPending}
              >
                순서 저장
              </Button>
            </>
          ) : (
            <>
              <Button
                type='button'
                variant='secondary'
                onClick={startReorder}
                disabled={!questions || questions.length < 2}
              >
                순서 변경
              </Button>
              <Button
                type='button'
                onClick={() => setFormModal({ mode: 'create' })}
              >
                + 질문 추가
              </Button>
            </>
          )}
        </div>
      </div>

      {reorderError ? (
        <p className='slcn-inspection-questions-section__error' role='alert'>
          {reorderError}
        </p>
      ) : null}

      {isPending ? (
        <QuestionListSkeleton />
      ) : isError ? (
        <ErrorState
          title='질문 목록을 불러오지 못했습니다'
          description='네트워크 상태를 확인한 뒤 다시 시도해 주세요.'
          onRetry={() => void refetch()}
        />
      ) : visibleRows.length === 0 ? (
        <p className='slcn-inspection-questions-section__empty'>
          아직 등록된 질문이 없습니다. [+ 질문 추가]로 첫 질문을 만들어 보세요.
        </p>
      ) : (
        <>
          <div
            className='slcn-inspection-qhead'
            aria-hidden='true'
            data-hidden-in-reorder={isReordering || undefined}
          >
            <span />
            <span>질문</span>
            <span>타입</span>
            <span>필수</span>
            <span>사용</span>
            <span />
          </div>
          <ul className='slcn-inspection-qlist'>
            {visibleRows.map((question, index) => (
              <li key={question.questionId}>
                <QuestionRow
                  question={question}
                  reorderMode={isReordering}
                  isFirst={index === 0}
                  isLast={index === visibleRows.length - 1}
                  onMoveUp={() => handleMove(index, -1)}
                  onMoveDown={() => handleMove(index, 1)}
                  onEdit={() => setFormModal({ mode: 'edit', question })}
                  draggableProps={
                    isReordering
                      ? {
                          onDragStart: handleDragStart(index),
                          onDragOver: handleDragOver(index),
                          onDrop: handleDrop(index),
                          onDragEnd: handleDragEnd,
                          isDragging: draggedIndex === index,
                        }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {formModal?.mode === 'create' ? (
        <QuestionFormModal
          mode='create'
          isOpen
          nextSortOrder={nextSortOrder}
          onClose={() => setFormModal(null)}
        />
      ) : null}
      {formModal?.mode === 'edit' ? (
        <QuestionFormModal
          mode='edit'
          isOpen
          question={formModal.question}
          onClose={() => setFormModal(null)}
        />
      ) : null}
    </section>
  );
}
