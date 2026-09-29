import type {
  InspectionQuestion,
  PropertyAnswer,
} from '@/domains/inspection/types';
import {
  findCategoryByName,
  groupAnswersByCategory,
  groupQuestionsByCategory,
} from '@/domains/inspection/utils/question-categories';

function answer(
  questionId: string,
  categoryId: string,
  categorySortOrder: number,
  sortOrder: number
): PropertyAnswer {
  return {
    questionId,
    questionVersionNo: 1,
    question: questionId,
    description: null,
    answerType: 'TEXT',
    required: false,
    sortOrder,
    unit: null,
    answered: false,
    choiceOptions: [],
    textValue: null,
    booleanValue: null,
    numberValue: null,
    ratingValue: null,
    selectedCodes: [],
    isCurrentVersion: true,
    questionEnabled: true,
    categoryId,
    categoryName: `name-${categoryId}`,
    categorySortOrder,
  };
}

describe('groupAnswersByCategory', () => {
  it('orders by category, then by the per-category sortOrder', () => {
    const groups = groupAnswersByCategory([
      answer('b1', 'B', 2, 1),
      answer('a2', 'A', 1, 2),
      answer('b2', 'B', 2, 2),
      answer('a1', 'A', 1, 1),
    ]);

    expect(groups.map((group) => group.categoryId)).toEqual(['A', 'B']);
    expect(groups[0]?.answers.map((a) => a.questionId)).toEqual(['a1', 'a2']);
    expect(groups[1]?.answers.map((a) => a.questionId)).toEqual(['b1', 'b2']);
    expect(groups[1]?.categoryName).toBe('name-B');
  });

  it('returns no groups for no answers', () => {
    expect(groupAnswersByCategory([])).toEqual([]);
  });
});

describe('groupQuestionsByCategory', () => {
  it('keeps an empty category as its own group', () => {
    const groups = groupQuestionsByCategory(
      [
        {
          categoryId: 'B',
          name: 'B',
          sortOrder: 2,
          enabled: true,
          enabledQuestionCount: 0,
        },
        {
          categoryId: 'A',
          name: 'A',
          sortOrder: 1,
          enabled: true,
          enabledQuestionCount: 1,
        },
      ],
      [
        {
          questionId: 'q',
          categoryId: 'A',
          categorySortOrder: 1,
          sortOrder: 1,
        },
      ].map((q) => q as InspectionQuestion)
    );

    expect(groups.map((group) => group.category.categoryId)).toEqual([
      'A',
      'B',
    ]);
    expect(groups[1]?.questions).toEqual([]);
  });
});

describe('findCategoryByName', () => {
  const categories = [
    {
      categoryId: 'A',
      name: '채광·환기',
      sortOrder: 1,
      enabled: false,
      enabledQuestionCount: 0,
    },
  ];

  it('matches after trimming, including disabled categories', () => {
    expect(findCategoryByName(categories, '  채광·환기 ')?.categoryId).toBe(
      'A'
    );
  });

  it('ignores the category being renamed', () => {
    expect(findCategoryByName(categories, '채광·환기', 'A')).toBeUndefined();
  });
});
