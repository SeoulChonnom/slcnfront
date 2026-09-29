import type { DragEvent, SubmitEvent } from 'react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PlusIcon } from '@/domains/inspection/components/area-detail/icons';
import { QuestionRow } from '@/domains/inspection/components/questions/QuestionRow';
import {
  CATEGORY_NAME_MAX_LENGTH,
  questionErrorMessage,
} from '@/domains/inspection/components/questions/question-copy';
import {
  useRenameInspectionQuestionCategory,
  useReorderInspectionQuestions,
  useUpdateInspectionQuestionCategoryStatus,
} from '@/domains/inspection/hooks/inspection-queries';
import type {
  InspectionQuestion,
  InspectionQuestionCategory,
} from '@/domains/inspection/types';
import { findCategoryByName } from '@/domains/inspection/utils/question-categories';
import { AppError } from '@/lib/api/errors';

type QuestionCategorySectionProps = {
  category: InspectionQuestionCategory;
  questions: InspectionQuestion[];
  allCategories: InspectionQuestionCategory[];
  /** This section is the one whose questions are being reordered. */
  isReordering: boolean;
  /** Another section (or the category order mode) owns the edit focus. */
  isLocked: boolean;
  onStartReorder: () => void;
  onEndReorder: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (question: InspectionQuestion) => void;
};

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

function errorText(error: unknown, fallback: string) {
  return (
    (error instanceof AppError && questionErrorMessage(error.apiCode)) ||
    fallback
  );
}

/**
 * api.md §9–§10 — one category and the questions inside it. Question order
 * is edited only within a category ("분류 이동은 별도 선택, 순서 변경은 분류
 * 안에서만"), so reorder mode lives here rather than on the whole page.
 */
export function QuestionCategorySection({
  category,
  questions,
  allCategories,
  isReordering,
  isLocked,
  onStartReorder,
  onEndReorder,
  onAddQuestion,
  onEditQuestion,
}: QuestionCategorySectionProps) {
  const headingId = useId();
  const renameInputId = useId();

  const renameMutation = useRenameInspectionQuestionCategory(
    category.categoryId
  );
  const statusMutation = useUpdateInspectionQuestionCategoryStatus(
    category.categoryId
  );
  const reorderMutation = useReorderInspectionQuestions();

  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [draftOrder, setDraftOrder] = useState<InspectionQuestion[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const rows = isReordering ? draftOrder : questions;
  const requiredCount = questions.filter(
    (question) => question.enabled && question.required
  ).length;
  const busy = isLocked || isReordering || isRenaming;

  function startRename() {
    setNameDraft(category.name);
    setRenameError(null);
    setStatusNote(null);
    setIsRenaming(true);
  }

  function cancelRename() {
    setIsRenaming(false);
    setRenameError(null);
  }

  async function submitRename(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = nameDraft.trim();
    if (trimmed === '' || trimmed.length > CATEGORY_NAME_MAX_LENGTH) {
      setRenameError(
        `분류 이름은 1~${CATEGORY_NAME_MAX_LENGTH}자로 입력해 주세요.`
      );
      return;
    }
    if (trimmed === category.name) {
      setIsRenaming(false);
      return;
    }
    const clash = findCategoryByName(
      allCategories,
      trimmed,
      category.categoryId
    );
    if (clash) {
      setRenameError(
        clash.enabled
          ? `'${clash.name}' 분류가 이미 있습니다.`
          : `미사용 분류 중에 '${clash.name}'이 이미 있습니다. 분류 이름은 미사용 분류와도 겹칠 수 없습니다.`
      );
      return;
    }
    try {
      await renameMutation.mutateAsync(trimmed);
      setIsRenaming(false);
    } catch (error) {
      setRenameError(errorText(error, '이름을 바꾸지 못했습니다.'));
    }
  }

  async function toggleStatus() {
    setStatusNote(null);
    // api.md §9 — disabling needs zero active questions. Explain instead of
    // letting the request bounce off a 409.
    if (category.enabled && category.enabledQuestionCount > 0) {
      setStatusNote(
        `사용 중인 질문 ${category.enabledQuestionCount}개를 먼저 미사용 처리하거나 다른 분류로 옮겨야 분류를 내릴 수 있습니다.`
      );
      return;
    }
    try {
      await statusMutation.mutateAsync(!category.enabled);
    } catch (error) {
      setStatusNote(
        errorText(error, '변경하지 못했습니다. 다시 시도해 주세요.')
      );
    }
  }

  function startReorder() {
    setReorderError(null);
    setStatusNote(null);
    setDraftOrder(questions);
    onStartReorder();
  }

  function cancelReorder() {
    setReorderError(null);
    setDraftOrder([]);
    onEndReorder();
  }

  async function saveReorder() {
    setReorderError(null);
    try {
      // One category per request, as api.md §10 recommends.
      await reorderMutation.mutateAsync(
        draftOrder.map((question, index) => ({
          id: question.questionId,
          sortOrder: index + 1,
        }))
      );
      setDraftOrder([]);
      onEndReorder();
    } catch (error) {
      setReorderError(
        error instanceof AppError && error.status === 409
          ? '순서를 저장하지 못했습니다. 새로고침 후 다시 시도하세요.'
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

  function handleMove(index: number, direction: -1 | 1) {
    setDraftOrder((prev) => moveItem(prev, index, index + direction));
  }

  return (
    <section
      className='slcn-inspection-qcat'
      aria-labelledby={headingId}
      data-disabled={!category.enabled || undefined}
      data-reordering={isReordering || undefined}
    >
      <header className='slcn-inspection-qcat__head'>
        {isRenaming ? (
          <form
            className='slcn-inspection-qcat__rename'
            onSubmit={(event) => void submitRename(event)}
            noValidate
          >
            <label htmlFor={renameInputId} className='slcn-visually-hidden'>
              분류 이름
            </label>
            <input
              id={renameInputId}
              className='slcn-inspection-qcat__rename-input'
              value={nameDraft}
              maxLength={CATEGORY_NAME_MAX_LENGTH}
              // biome-ignore lint/a11y/noAutofocus: the input replaces the heading the admin just asked to edit
              autoFocus
              aria-invalid={Boolean(renameError)}
              onChange={(event) => {
                setNameDraft(event.target.value);
                if (renameError) {
                  setRenameError(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  cancelRename();
                }
              }}
            />
            <h2 id={headingId} className='slcn-visually-hidden'>
              {category.name}
            </h2>
            <div className='slcn-inspection-qcat__actions'>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                onClick={cancelRename}
                disabled={renameMutation.isPending}
              >
                취소
              </Button>
              <Button
                type='submit'
                size='sm'
                loading={renameMutation.isPending}
              >
                이름 저장
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className='slcn-inspection-qcat__title-block'>
              <h2 id={headingId} className='slcn-inspection-qcat__title'>
                {category.name}
              </h2>
              <p className='slcn-inspection-qcat__meta'>
                {category.enabled ? (
                  <>
                    질문 {questions.length}
                    {requiredCount > 0 ? ` · 필수 ${requiredCount}` : ''}
                    {questions.length > category.enabledQuestionCount
                      ? ` · 미사용 ${questions.length - category.enabledQuestionCount}`
                      : ''}
                  </>
                ) : (
                  <>미사용 분류 · 질문 {questions.length}</>
                )}
              </p>
            </div>
            <div className='slcn-inspection-qcat__actions'>
              {isReordering ? (
                <>
                  <Button
                    type='button'
                    variant='secondary'
                    size='sm'
                    onClick={cancelReorder}
                    disabled={reorderMutation.isPending}
                  >
                    취소
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    onClick={() => void saveReorder()}
                    loading={reorderMutation.isPending}
                  >
                    순서 저장
                  </Button>
                </>
              ) : (
                <>
                  {category.enabled && questions.length > 1 ? (
                    <button
                      type='button'
                      className='slcn-inspection-qcat__link'
                      onClick={startReorder}
                      disabled={busy}
                    >
                      순서 변경
                    </button>
                  ) : null}
                  <button
                    type='button'
                    className='slcn-inspection-qcat__link'
                    onClick={startRename}
                    disabled={busy}
                  >
                    이름 변경
                  </button>
                  <button
                    type='button'
                    className='slcn-inspection-qcat__link'
                    data-tone={category.enabled ? 'quiet' : undefined}
                    onClick={() => void toggleStatus()}
                    disabled={busy || statusMutation.isPending}
                  >
                    {category.enabled ? '미사용 처리' : '다시 사용'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </header>

      {renameError ? (
        <p
          className='slcn-inspection-qcat__note'
          data-kind='error'
          role='alert'
        >
          {renameError}
        </p>
      ) : null}
      {statusNote ? (
        <p className='slcn-inspection-qcat__note' role='status'>
          {statusNote}
        </p>
      ) : null}
      {reorderError ? (
        <p
          className='slcn-inspection-qcat__note'
          data-kind='error'
          role='alert'
        >
          {reorderError}
        </p>
      ) : null}
      {isReordering ? (
        <p className='slcn-inspection-qcat__note'>
          끌어서 옮기거나 위·아래 버튼으로 순서를 바꾸세요. 다른 분류로 옮기려면
          질문의 [수정]에서 분류를 바꿉니다.
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className='slcn-inspection-qcat__empty'>
          <p>
            {category.enabled
              ? '아직 이 분류에 질문이 없습니다.'
              : '이 분류에는 질문이 없습니다.'}
          </p>
        </div>
      ) : (
        <ul className='slcn-inspection-qlist'>
          {rows.map((question, index) => (
            <li key={question.questionId}>
              <QuestionRow
                question={question}
                reorderMode={isReordering}
                isFirst={index === 0}
                isLast={index === rows.length - 1}
                onMoveUp={() => handleMove(index, -1)}
                onMoveDown={() => handleMove(index, 1)}
                onEdit={() => onEditQuestion(question)}
                draggableProps={
                  isReordering
                    ? {
                        onDragStart: handleDragStart(index),
                        onDragOver: handleDragOver(index),
                        onDrop: (event) => event.preventDefault(),
                        onDragEnd: () => setDraggedIndex(null),
                        isDragging: draggedIndex === index,
                      }
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      {category.enabled && !isReordering ? (
        <button
          type='button'
          className='slcn-inspection-qcat__add'
          onClick={onAddQuestion}
          disabled={isLocked}
        >
          <PlusIcon />
          {category.name}에 질문 추가
        </button>
      ) : null}
    </section>
  );
}
