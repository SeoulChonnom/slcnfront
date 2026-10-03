import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { InspectionQuestionsSection } from '@/domains/inspection/components/InspectionQuestionsSection';
import type {
  InspectionQuestion,
  InspectionQuestionCategory,
} from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test/helpers/render';

const useInspectionQuestionsMock = vi.fn();
const useInspectionQuestionCategoriesMock = vi.fn();
const useInspectionQuestionVersionsMock = vi.fn();
const useReorderInspectionQuestionsMock = vi.fn();
const useCreateInspectionQuestionMock = vi.fn();
const useUpdateInspectionQuestionContentMock = vi.fn();
const useUpdateInspectionQuestionPolicyMock = vi.fn();
const useUpdateInspectionQuestionStatusMock = vi.fn();
const useMoveInspectionQuestionCategoryMock = vi.fn();
const useCreateInspectionQuestionCategoryMock = vi.fn();
const useRenameInspectionQuestionCategoryMock = vi.fn();
const useUpdateInspectionQuestionCategoryStatusMock = vi.fn();
const useReorderInspectionQuestionCategoriesMock = vi.fn();

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionQuestions: (...args: unknown[]) =>
    useInspectionQuestionsMock(...args),
  useInspectionQuestionCategories: (...args: unknown[]) =>
    useInspectionQuestionCategoriesMock(...args),
  useInspectionQuestionVersions: (...args: unknown[]) =>
    useInspectionQuestionVersionsMock(...args),
  useReorderInspectionQuestions: () => useReorderInspectionQuestionsMock(),
  useCreateInspectionQuestion: () => useCreateInspectionQuestionMock(),
  useUpdateInspectionQuestionContent: (...args: unknown[]) =>
    useUpdateInspectionQuestionContentMock(...args),
  useUpdateInspectionQuestionPolicy: (...args: unknown[]) =>
    useUpdateInspectionQuestionPolicyMock(...args),
  useUpdateInspectionQuestionStatus: (...args: unknown[]) =>
    useUpdateInspectionQuestionStatusMock(...args),
  useMoveInspectionQuestionCategory: (...args: unknown[]) =>
    useMoveInspectionQuestionCategoryMock(...args),
  useCreateInspectionQuestionCategory: () =>
    useCreateInspectionQuestionCategoryMock(),
  useRenameInspectionQuestionCategory: (...args: unknown[]) =>
    useRenameInspectionQuestionCategoryMock(...args),
  useUpdateInspectionQuestionCategoryStatus: (...args: unknown[]) =>
    useUpdateInspectionQuestionCategoryStatusMock(...args),
  useReorderInspectionQuestionCategories: () =>
    useReorderInspectionQuestionCategoriesMock(),
}));

const LIGHT: InspectionQuestionCategory = {
  categoryId: 'cat-light',
  name: '채광·환기',
  sortOrder: 1,
  enabled: true,
  enabledQuestionCount: 1,
};
const NOISE: InspectionQuestionCategory = {
  categoryId: 'cat-noise',
  name: '소음·주변',
  sortOrder: 2,
  enabled: true,
  enabledQuestionCount: 0,
};
const OLD: InspectionQuestionCategory = {
  categoryId: 'cat-old',
  name: '옛 분류',
  sortOrder: 3,
  enabled: false,
  enabledQuestionCount: 0,
};

function question(overrides: Partial<InspectionQuestion>): InspectionQuestion {
  return {
    questionId: 'INSPECTION_QUESTION-0001',
    answerType: 'LONG_TEXT',
    required: true,
    sortOrder: 1,
    enabled: true,
    currentVersionNo: 2,
    content: '거실 및 방의 채광은 어떤가?',
    description: '오후 시간대 기준으로 기록',
    choices: [],
    unit: null,
    answerCount: 12,
    categoryId: LIGHT.categoryId,
    categoryName: LIGHT.name,
    categorySortOrder: LIGHT.sortOrder,
    ...overrides,
  };
}

function idleMutation(overrides: Record<string, unknown> = {}) {
  return {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    ...overrides,
  };
}

function givenData(
  questions: InspectionQuestion[] | undefined,
  categories: InspectionQuestionCategory[] | undefined = [LIGHT, NOISE],
  state: { isPending?: boolean; isError?: boolean; refetch?: () => void } = {}
) {
  const base = {
    isPending: state.isPending ?? false,
    isError: state.isError ?? false,
    refetch: state.refetch ?? vi.fn(),
  };
  useInspectionQuestionsMock.mockReturnValue({ ...base, data: questions });
  useInspectionQuestionCategoriesMock.mockReturnValue({
    ...base,
    data: categories,
  });
}

/** Folded rows stay mounted under a `hidden` wrapper. */
function isFolded(text: string) {
  return screen.getByText(text).closest('[hidden]') !== null;
}

describe('InspectionQuestionsSection', () => {
  const createQuestion = idleMutation();
  const moveCategory = idleMutation();
  const reorderQuestions = idleMutation();
  const categoryStatus = idleMutation();
  const createCategory = idleMutation();

  beforeEach(() => {
    useInspectionQuestionVersionsMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    });
    useReorderInspectionQuestionsMock.mockReturnValue(reorderQuestions);
    useCreateInspectionQuestionMock.mockReturnValue(createQuestion);
    useUpdateInspectionQuestionContentMock.mockReturnValue(idleMutation());
    useUpdateInspectionQuestionPolicyMock.mockReturnValue(idleMutation());
    useUpdateInspectionQuestionStatusMock.mockReturnValue(idleMutation());
    useMoveInspectionQuestionCategoryMock.mockReturnValue(moveCategory);
    useCreateInspectionQuestionCategoryMock.mockReturnValue(createCategory);
    useRenameInspectionQuestionCategoryMock.mockReturnValue(idleMutation());
    useUpdateInspectionQuestionCategoryStatusMock.mockReturnValue(
      categoryStatus
    );
    useReorderInspectionQuestionCategoriesMock.mockReturnValue(idleMutation());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the intro sentence and each question with its answer count and type', () => {
    givenData([
      question({ questionId: 'q1', content: '거실 채광은 어떤가?' }),
      question({
        questionId: 'q2',
        content: '반려동물을 키울 수 있는가?',
        enabled: false,
        required: false,
        currentVersionNo: 1,
        answerCount: 3,
        answerType: 'TEXT',
      }),
    ]);

    renderWithProviders(<InspectionQuestionsSection device='main' />);

    expect(
      screen.getByText(/부터 적용되고, 이미 저장된 답변은 그대로 남습니다/)
    ).toBeTruthy();
    expect(screen.getByText('거실 채광은 어떤가?')).toBeTruthy();
    expect(screen.getByText(/v2 · 답변 12건/)).toBeTruthy();
    expect(screen.getByText('반려동물을 키울 수 있는가?')).toBeTruthy();
    expect(screen.getByText(/v1 · 답변 3건/)).toBeTruthy();
  });

  it('groups questions under their category heading in category order, even when question sortOrder restarts per category', () => {
    givenData([
      question({
        questionId: 'q-noise',
        content: '밤에 조용한가?',
        sortOrder: 1,
        categoryId: NOISE.categoryId,
        categoryName: NOISE.name,
        categorySortOrder: 2,
      }),
      question({ questionId: 'q-light', content: '남향인가?', sortOrder: 1 }),
    ]);

    renderWithProviders(<InspectionQuestionsSection device='main' />);

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(['채광·환기', '소음·주변']);

    const noise = screen.getByRole('region', { name: '소음·주변' });
    expect(within(noise).getByText('밤에 조용한가?')).toBeTruthy();
    expect(within(noise).queryByText('남향인가?')).toBeNull();
  });

  it('folds disabled categories away and keeps them out of the main list', () => {
    givenData([question({})], [LIGHT, NOISE, OLD]);

    renderWithProviders(<InspectionQuestionsSection device='main' />);

    expect(screen.getByText('미사용 분류 1개')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: '다시 사용' }).closest('details')
    ).toBeTruthy();
  });

  it('never renders a delete control — the only lifecycle action is the 사용/미사용 toggle', () => {
    givenData([question({})]);

    renderWithProviders(<InspectionQuestionsSection device='main' />);

    expect(screen.queryByText('삭제')).toBeNull();
    expect(screen.getByRole('switch', { name: /사용 여부/ })).toBeTruthy();
  });

  it('shows a grid-shaped skeleton instead of a spinner while loading', () => {
    givenData(undefined, undefined, { isPending: true });

    const { container } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    expect(
      container.querySelector('.slcn-inspection-qlist-skeleton')
    ).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows a retry action on load failure', async () => {
    const refetch = vi.fn();
    givenData(undefined, undefined, { isError: true, refetch });

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('asks for a category first when none exists, and blocks adding a question', () => {
    givenData([], []);

    renderWithProviders(<InspectionQuestionsSection device='main' />);

    expect(screen.getByText(/먼저 .*분류를 하나 만들어 주세요/)).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: '+ 질문 추가' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it('opens the edit modal from a row and locks the answer type with a reason', async () => {
    givenData([question({})]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '수정' }));

    expect(screen.getByRole('dialog', { name: '질문 수정' })).toBeTruthy();
    expect(
      screen.getByText('답변이 있는 질문은 타입을 바꿀 수 없습니다.')
    ).toBeTruthy();
    const typeSelect = screen.getByLabelText('타입') as HTMLSelectElement;
    expect(typeSelect.disabled).toBe(true);
  });

  it('names the next version and the versions answers still show once content changes', async () => {
    givenData([question({ currentVersionNo: 2, answerCount: 12 })]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '수정' }));
    const dialog = screen.getByRole('dialog', { name: '질문 수정' });
    const contentInput = within(dialog).getByLabelText('질문', {
      exact: false,
    });
    await user.clear(contentInput);
    await user.type(contentInput, '거실 채광은 어떤가? (수정)');

    expect(within(dialog).getByText(/이 새로 생깁니다/)).toBeTruthy();
    expect(within(dialog).getByText(/이미 저장된 답변 12건은/)).toBeTruthy();
    expect(
      within(dialog).getByRole('button', { name: 'v3으로 저장' })
    ).toBeTruthy();
  });

  it('creates a question inside the section it was added from', async () => {
    givenData([question({})]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(
      screen.getByRole('button', { name: '소음·주변에 질문 추가' })
    );
    const dialog = screen.getByRole('dialog', { name: '질문 추가' });
    expect(
      (
        within(dialog).getByLabelText('분류', {
          exact: false,
        }) as HTMLSelectElement
      ).value
    ).toBe(NOISE.categoryId);

    await user.type(
      within(dialog).getByLabelText('질문', { exact: false }),
      '밤에 조용한가?'
    );
    await user.click(within(dialog).getByRole('button', { name: '질문 추가' }));

    expect(createQuestion.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: NOISE.categoryId,
        sortOrder: 0,
        answerType: 'TEXT',
      })
    );
  });

  it('defaults the answer type of a new question to 한 줄 글', async () => {
    givenData([question({})]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '+ 질문 추가' }));
    const dialog = screen.getByRole('dialog', { name: '질문 추가' });
    const typeSelect = within(dialog).getByLabelText('타입', {
      exact: false,
    }) as HTMLSelectElement;
    expect(typeSelect.value).toBe('TEXT');
    expect(typeSelect.options[0]?.value).toBe('TEXT');
  });

  it('folds and unfolds the questions of one category from its heading', async () => {
    givenData([
      question({ questionId: 'q-light', content: '남향인가?' }),
      question({
        questionId: 'q-noise',
        content: '밤에 조용한가?',
        categoryId: NOISE.categoryId,
        categoryName: NOISE.name,
        categorySortOrder: 2,
      }),
    ]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    const toggle = screen.getByRole('button', { name: '채광·환기' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    await user.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(isFolded('남향인가?')).toBe(true);
    expect(
      screen.queryByRole('button', { name: '채광·환기에 질문 추가' })
    ).toBeNull();
    expect(screen.getByText('밤에 조용한가?')).toBeTruthy();

    await user.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('남향인가?')).toBeTruthy();
  });

  it('folds and unfolds every category at once', async () => {
    givenData([
      question({ questionId: 'q-light', content: '남향인가?' }),
      question({
        questionId: 'q-noise',
        content: '밤에 조용한가?',
        categoryId: NOISE.categoryId,
        categoryName: NOISE.name,
        categorySortOrder: 2,
      }),
    ]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '모두 접기' }));

    expect(isFolded('남향인가?')).toBe(true);
    expect(isFolded('밤에 조용한가?')).toBe(true);

    await user.click(screen.getByRole('button', { name: '모두 펼치기' }));

    expect(screen.getByText('남향인가?')).toBeTruthy();
    expect(screen.getByText('밤에 조용한가?')).toBeTruthy();
  });

  it('moves a question to another category without minting a version', async () => {
    givenData([question({})]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '수정' }));
    const dialog = screen.getByRole('dialog', { name: '질문 수정' });
    await user.selectOptions(
      within(dialog).getByLabelText('분류', { exact: false }),
      NOISE.categoryId
    );

    expect(within(dialog).getByText(/분류의 맨 뒤로/)).toBeTruthy();
    await user.click(within(dialog).getByRole('button', { name: '저장' }));

    expect(moveCategory.mutateAsync).toHaveBeenCalledWith(NOISE.categoryId);
  });

  it('reorders questions only within one category and saves just that category', async () => {
    givenData([
      question({ questionId: 'q1', sortOrder: 1, content: '첫 질문' }),
      question({ questionId: 'q2', sortOrder: 2, content: '둘째 질문' }),
      question({
        questionId: 'q3',
        sortOrder: 1,
        content: '다른 분류 질문',
        categoryId: NOISE.categoryId,
        categoryName: NOISE.name,
        categorySortOrder: 2,
      }),
    ]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    const light = screen.getByRole('region', { name: '채광·환기' });
    await user.click(within(light).getByRole('button', { name: '순서 변경' }));

    expect(
      within(light).getByRole('button', { name: '순서 저장' })
    ).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: '+ 질문 추가' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);

    await user.click(
      within(light).getByRole('button', { name: '둘째 질문 위로 이동' })
    );
    await user.click(within(light).getByRole('button', { name: '순서 저장' }));

    expect(reorderQuestions.mutateAsync).toHaveBeenCalledWith([
      { id: 'q2', sortOrder: 1 },
      { id: 'q1', sortOrder: 2 },
    ]);
  });

  it('explains instead of calling the API when a category still has active questions', async () => {
    givenData([question({})]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    const light = screen.getByRole('region', { name: '채광·환기' });
    await user.click(
      within(light).getByRole('button', { name: '미사용 처리' })
    );

    expect(
      within(light).getByText(/사용 중인 질문 1개를 먼저 미사용 처리하거나/)
    ).toBeTruthy();
    expect(categoryStatus.mutateAsync).not.toHaveBeenCalled();
  });

  it('offers to revive a disabled category instead of creating a duplicate name', async () => {
    givenData([question({})], [LIGHT, NOISE, OLD]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '+ 분류 추가' }));
    await user.type(screen.getByLabelText('새 분류'), ' 옛 분류 ');
    await user.click(screen.getByRole('button', { name: '분류 만들기' }));

    expect(createCategory.mutateAsync).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: "'옛 분류' 다시 사용" })
    );
    expect(categoryStatus.mutateAsync).toHaveBeenCalledWith(true);
  });

  it('maps a server duplicate code to a sentence, not the raw title', async () => {
    createCategory.mutateAsync.mockRejectedValueOnce(
      new AppError({
        code: 'HTTP_ERROR',
        status: 409,
        message: 'raw server title',
        apiCode: 'INSPECTION_QUESTION_CATEGORY_DUPLICATED',
      })
    );
    givenData([question({})]);

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '+ 분류 추가' }));
    await user.type(screen.getByLabelText('새 분류'), '관리·시설');
    await user.click(screen.getByRole('button', { name: '분류 만들기' }));

    expect(
      await screen.findByText(/같은 이름의 분류가 이미 있습니다/)
    ).toBeTruthy();
    expect(screen.queryByText('raw server title')).toBeNull();
  });
});
