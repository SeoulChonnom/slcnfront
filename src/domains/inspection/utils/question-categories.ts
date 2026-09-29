import type {
  InspectionQuestion,
  InspectionQuestionCategory,
  PropertyAnswer,
} from '@/domains/inspection/types';

export type AnswerCategoryGroup = {
  categoryId: string;
  categoryName: string;
  answers: PropertyAnswer[];
};

export type QuestionCategoryGroup = {
  category: InspectionQuestionCategory;
  questions: InspectionQuestion[];
};

function byCategoryThenQuestion(
  a: { categorySortOrder: number; sortOrder: number; questionId: string },
  b: { categorySortOrder: number; sortOrder: number; questionId: string }
) {
  return (
    a.categorySortOrder - b.categorySortOrder ||
    a.sortOrder - b.sortOrder ||
    a.questionId.localeCompare(b.questionId)
  );
}

/**
 * api.md §4 — `answers` arrive as a flat array; `sortOrder` only compares
 * inside one category, so the FE groups by `categoryId` and orders by
 * category → question → id. Re-sorting here keeps local edit state (which
 * may have been rebuilt from a stale array) in the same order the server
 * would send.
 */
export function groupAnswersByCategory(
  answers: PropertyAnswer[]
): AnswerCategoryGroup[] {
  const groups = new Map<string, AnswerCategoryGroup>();

  for (const answer of [...answers].sort(byCategoryThenQuestion)) {
    const group = groups.get(answer.categoryId);
    if (group) {
      group.answers.push(answer);
    } else {
      groups.set(answer.categoryId, {
        categoryId: answer.categoryId,
        categoryName: answer.categoryName,
        answers: [answer],
      });
    }
  }

  return [...groups.values()];
}

/**
 * Pairs every category with its questions in display order. A category with
 * no questions still gets a group — the admin screen shows it as an empty
 * section so a freshly created category is immediately usable.
 */
export function groupQuestionsByCategory(
  categories: InspectionQuestionCategory[],
  questions: InspectionQuestion[]
): QuestionCategoryGroup[] {
  const sortedCategories = [...categories].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.categoryId.localeCompare(b.categoryId)
  );
  const sortedQuestions = [...questions].sort(byCategoryThenQuestion);

  return sortedCategories.map((category) => ({
    category,
    questions: sortedQuestions.filter(
      (question) => question.categoryId === category.categoryId
    ),
  }));
}

/** api.md §9 — names compare after trimming, across enabled and disabled. */
export function findCategoryByName(
  categories: InspectionQuestionCategory[],
  name: string,
  exceptCategoryId?: string
) {
  const trimmed = name.trim();
  return categories.find(
    (category) =>
      category.categoryId !== exceptCategoryId &&
      category.name.trim() === trimmed
  );
}
