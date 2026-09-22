import { screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { InspectionQuestionsSection } from '@/domains/inspection/components/InspectionQuestionsSection';
import type { InspectionQuestion } from '@/domains/inspection/types';
import { renderWithProviders } from '@/test/helpers/render';

const useInspectionQuestionsMock = vi.fn();
const useInspectionQuestionVersionsMock = vi.fn();
const useReorderInspectionQuestionsMock = vi.fn();
const useCreateInspectionQuestionMock = vi.fn();
const useUpdateInspectionQuestionContentMock = vi.fn();
const useUpdateInspectionQuestionPolicyMock = vi.fn();
const useUpdateInspectionQuestionStatusMock = vi.fn();

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionQuestions: (...args: unknown[]) =>
    useInspectionQuestionsMock(...args),
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
}));

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

describe('InspectionQuestionsSection', () => {
  beforeEach(() => {
    useInspectionQuestionVersionsMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    });
    useReorderInspectionQuestionsMock.mockReturnValue(idleMutation());
    useCreateInspectionQuestionMock.mockReturnValue(idleMutation());
    useUpdateInspectionQuestionContentMock.mockReturnValue(idleMutation());
    useUpdateInspectionQuestionPolicyMock.mockReturnValue(idleMutation());
    useUpdateInspectionQuestionStatusMock.mockReturnValue(idleMutation());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows the intro sentence and each question with its answer count and type', () => {
    useInspectionQuestionsMock.mockReturnValue({
      data: [
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
      ],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<InspectionQuestionsSection device='main' />);

    expect(
      screen.getByText(/부터 적용되고, 이미 저장된 답변은 그대로 남습니다/)
    ).toBeTruthy();
    expect(screen.getByText('거실 채광은 어떤가?')).toBeTruthy();
    expect(screen.getByText(/v2 · 답변 12건/)).toBeTruthy();
    expect(screen.getByText('반려동물을 키울 수 있는가?')).toBeTruthy();
    expect(screen.getByText(/v1 · 답변 3건/)).toBeTruthy();
  });

  it('never renders a delete control — the only lifecycle action is the 사용/미사용 toggle', () => {
    useInspectionQuestionsMock.mockReturnValue({
      data: [question({})],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<InspectionQuestionsSection device='main' />);

    expect(screen.queryByText('삭제')).toBeNull();
    expect(screen.getByRole('switch', { name: /사용 여부/ })).toBeTruthy();
  });

  it('shows a grid-shaped skeleton instead of a spinner while loading', () => {
    useInspectionQuestionsMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    });

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
    useInspectionQuestionsMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    });

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('opens the edit modal from a row and locks the answer type with a reason', async () => {
    useInspectionQuestionsMock.mockReturnValue({
      data: [question({})],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

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
    useInspectionQuestionsMock.mockReturnValue({
      data: [question({ currentVersionNo: 2, answerCount: 12 })],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

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

  it('toggles into reorder mode and swaps 질문 추가 for a 순서 저장 action', async () => {
    useInspectionQuestionsMock.mockReturnValue({
      data: [
        question({ questionId: 'q1', sortOrder: 1, content: '첫 질문' }),
        question({ questionId: 'q2', sortOrder: 2, content: '둘째 질문' }),
      ],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { user } = renderWithProviders(
      <InspectionQuestionsSection device='main' />
    );

    await user.click(screen.getByRole('button', { name: '순서 변경' }));

    expect(screen.getByRole('button', { name: '순서 저장' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '+ 질문 추가' })).toBeNull();
    expect(screen.queryByRole('button', { name: '수정' })).toBeNull();
  });
});
