import { useState } from 'react';
import type { DeviceType } from '@/app/router/route-constants';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { ChevronIcon } from '@/domains/inspection/components/area-detail/icons';
import { CategoryCreateForm } from '@/domains/inspection/components/questions/CategoryCreateForm';
import { CategoryOrderList } from '@/domains/inspection/components/questions/CategoryOrderList';
import { QuestionCategorySection } from '@/domains/inspection/components/questions/QuestionCategorySection';
import { QuestionFormModal } from '@/domains/inspection/components/questions/QuestionFormModal';
import { QuestionListSkeleton } from '@/domains/inspection/components/questions/QuestionListSkeleton';
import {
  useInspectionQuestionCategories,
  useInspectionQuestions,
  useReorderInspectionQuestionCategories,
} from '@/domains/inspection/hooks/inspection-queries';
import type { InspectionQuestion } from '@/domains/inspection/types';
import {
  groupQuestionsByCategory,
  type QuestionCategoryGroup,
} from '@/domains/inspection/utils/question-categories';
import { AppError } from '@/lib/api/errors';

type InspectionQuestionsSectionProps = {
  device: DeviceType;
};

type FormModalState =
  | { mode: 'create'; categoryId: string | null }
  | { mode: 'edit'; question: InspectionQuestion }
  | null;

/** What currently owns the page's edit focus — only one at a time. */
type EditFocus =
  | { kind: 'questions'; categoryId: string }
  | { kind: 'categories' }
  | { kind: 'create-category' }
  | null;

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
 * screen_design.md §5.5 + api.md §9–§10 — the admin question-management
 * screen, grouped by category. Every question belongs to exactly one
 * category; question order is edited inside a category, category order in
 * its own mode, and moving a question between categories is a field in the
 * question form. Route entry is already gated to `admin` by `RequireRole`
 * (fe_implementation_decisions.md §2).
 */
export function InspectionQuestionsSection({
  device,
}: InspectionQuestionsSectionProps) {
  const questionsQuery = useInspectionQuestions({
    includeDisabled: true,
    withAnswerCount: true,
  });
  const categoriesQuery = useInspectionQuestionCategories({
    includeDisabled: true,
  });
  const reorderCategoriesMutation = useReorderInspectionQuestionCategories();

  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [focus, setFocus] = useState<EditFocus>(null);
  const [categoryDraft, setCategoryDraft] = useState<QuestionCategoryGroup[]>(
    []
  );
  const [categoryOrderError, setCategoryOrderError] = useState<string | null>(
    null
  );
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const categories = categoriesQuery.data ?? [];
  const groups = groupQuestionsByCategory(
    categories,
    questionsQuery.data ?? []
  );
  const enabledGroups = groups.filter((group) => group.category.enabled);
  const disabledGroups = groups.filter((group) => !group.category.enabled);
  const enabledCategories = enabledGroups.map((group) => group.category);

  const isPending = questionsQuery.isPending || categoriesQuery.isPending;
  const isError = questionsQuery.isError || categoriesQuery.isError;
  const isOrderingCategories = focus?.kind === 'categories';
  const isAllCollapsed =
    enabledGroups.length > 0 &&
    enabledGroups.every((group) => collapsedIds.has(group.category.categoryId));

  function toggleCollapsed(categoryId: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function toggleAllCollapsed() {
    setCollapsedIds(
      isAllCollapsed
        ? new Set()
        : new Set(groups.map((group) => group.category.categoryId))
    );
  }

  function retry() {
    void questionsQuery.refetch();
    void categoriesQuery.refetch();
  }

  function startCategoryOrder() {
    setCategoryOrderError(null);
    setCategoryDraft(enabledGroups);
    setFocus({ kind: 'categories' });
  }

  function cancelCategoryOrder() {
    setCategoryOrderError(null);
    setCategoryDraft([]);
    setFocus(null);
  }

  async function saveCategoryOrder() {
    setCategoryOrderError(null);
    try {
      await reorderCategoriesMutation.mutateAsync(
        categoryDraft.map((group, index) => ({
          id: group.category.categoryId,
          sortOrder: index + 1,
        }))
      );
      setCategoryDraft([]);
      setFocus(null);
    } catch (error) {
      setCategoryOrderError(
        error instanceof AppError && error.status === 409
          ? '순서를 저장하지 못했습니다. 새로고침 후 다시 시도하세요.'
          : '순서를 저장하지 못했습니다. 다시 시도해 주세요.'
      );
    }
  }

  function renderSection(group: QuestionCategoryGroup) {
    const { categoryId } = group.category;
    const ownsFocus =
      focus?.kind === 'questions' && focus.categoryId === categoryId;
    return (
      <QuestionCategorySection
        key={categoryId}
        category={group.category}
        questions={group.questions}
        allCategories={categories}
        isReordering={ownsFocus}
        isLocked={focus !== null && !ownsFocus}
        isCollapsed={collapsedIds.has(categoryId)}
        onToggleCollapsed={() => toggleCollapsed(categoryId)}
        onStartReorder={() => setFocus({ kind: 'questions', categoryId })}
        onEndReorder={() => setFocus(null)}
        onAddQuestion={() => setFormModal({ mode: 'create', categoryId })}
        onEditQuestion={(question) => setFormModal({ mode: 'edit', question })}
      />
    );
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
            남습니다. 질문은 분류별로 묶여 매물 문답 화면에 이 순서대로
            나옵니다.
          </p>
        </div>
        <div className='slcn-inspection-questions-section__actions'>
          {isOrderingCategories ? (
            <>
              <Button
                type='button'
                variant='secondary'
                onClick={cancelCategoryOrder}
                disabled={reorderCategoriesMutation.isPending}
              >
                취소
              </Button>
              <Button
                type='button'
                onClick={() => void saveCategoryOrder()}
                loading={reorderCategoriesMutation.isPending}
              >
                분류 순서 저장
              </Button>
            </>
          ) : (
            <>
              <Button
                type='button'
                variant='secondary'
                onClick={startCategoryOrder}
                disabled={focus !== null || enabledGroups.length < 2}
              >
                분류 순서 변경
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setFocus({ kind: 'create-category' })}
                disabled={focus !== null || isPending || isError}
              >
                + 분류 추가
              </Button>
              <Button
                type='button'
                onClick={() =>
                  setFormModal({
                    mode: 'create',
                    categoryId: enabledCategories[0]?.categoryId ?? null,
                  })
                }
                disabled={focus !== null || enabledCategories.length === 0}
              >
                + 질문 추가
              </Button>
            </>
          )}
        </div>
      </div>

      {categoryOrderError ? (
        <p className='slcn-inspection-questions-section__error' role='alert'>
          {categoryOrderError}
        </p>
      ) : null}

      {isPending ? (
        <QuestionListSkeleton />
      ) : isError ? (
        <ErrorState
          title='질문 목록을 불러오지 못했습니다'
          description='네트워크 상태를 확인한 뒤 다시 시도해 주세요.'
          onRetry={retry}
        />
      ) : isOrderingCategories ? (
        <>
          <p className='slcn-inspection-questions-section__hint'>
            위에 있는 분류부터 매물 문답 화면에 나옵니다. 미사용 분류는 순서에
            포함되지 않습니다.
          </p>
          <CategoryOrderList
            groups={categoryDraft}
            onMove={(index, direction) =>
              setCategoryDraft((prev) =>
                moveItem(prev, index, index + direction)
              )
            }
          />
        </>
      ) : (
        <>
          {enabledGroups.length === 0 && focus?.kind !== 'create-category' ? (
            <div className='slcn-inspection-questions-section__empty'>
              <p>
                질문은 분류 안에 만듭니다. 먼저 &lsquo;채광·환기&rsquo;처럼 묶을
                분류를 하나 만들어 주세요.
              </p>
              <Button
                type='button'
                onClick={() => setFocus({ kind: 'create-category' })}
              >
                + 분류 추가
              </Button>
            </div>
          ) : null}

          {enabledGroups.length > 1 ? (
            <div className='slcn-inspection-questions-section__toolbar'>
              <button
                type='button'
                className='slcn-inspection-qcat__link'
                onClick={toggleAllCollapsed}
              >
                {isAllCollapsed ? '모두 펼치기' : '모두 접기'}
              </button>
            </div>
          ) : null}

          {enabledGroups.length > 0 ? (
            <div
              className='slcn-inspection-qhead'
              aria-hidden='true'
              data-hidden-in-reorder={focus?.kind === 'questions' || undefined}
            >
              <span />
              <span>질문</span>
              <span>타입</span>
              <span>필수</span>
              <span>사용</span>
              <span />
            </div>
          ) : null}

          {enabledGroups.map(renderSection)}

          {focus?.kind === 'create-category' ? (
            <CategoryCreateForm
              categories={categories}
              onDone={() => setFocus(null)}
            />
          ) : null}

          {disabledGroups.length > 0 ? (
            <details className='slcn-inspection-qcat-archive'>
              <summary className='slcn-inspection-qcat-archive__summary'>
                <ChevronIcon className='slcn-inspection-qcat-archive__chev' />
                미사용 분류 {disabledGroups.length}개
                <span className='slcn-inspection-qcat-archive__hint'>
                  매물 문답에 나오지 않습니다
                </span>
              </summary>
              {disabledGroups.map(renderSection)}
            </details>
          ) : null}
        </>
      )}

      {formModal?.mode === 'create' ? (
        <QuestionFormModal
          mode='create'
          isOpen
          categories={enabledCategories}
          defaultCategoryId={formModal.categoryId}
          onClose={() => setFormModal(null)}
        />
      ) : null}
      {formModal?.mode === 'edit' ? (
        <QuestionFormModal
          mode='edit'
          isOpen
          categories={categories}
          question={formModal.question}
          onClose={() => setFormModal(null)}
        />
      ) : null}
    </section>
  );
}
