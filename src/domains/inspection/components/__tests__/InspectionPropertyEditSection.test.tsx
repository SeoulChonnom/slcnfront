import { screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectionPropertyEditSection } from '@/domains/inspection/components/InspectionPropertyEditSection';
import { AUTOSAVE_DELAY_MS } from '@/domains/inspection/hooks/useAutosave';
import type {
  PropertyAnswer,
  ViewedPropertyDetail,
} from '@/domains/inspection/types';
import { renderWithProviders } from '@/test/helpers/render';

const useInspectionVisitPropertyMock = vi.fn();
const calls: string[] = [];
const updateMutateAsync = vi.fn();
const answersMutateAsync = vi.fn();
const statusMutateAsync = vi.fn();

function idleMutation(overrides: Record<string, unknown> = {}) {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    ...overrides,
  };
}

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionVisitProperty: (...args: unknown[]) =>
    useInspectionVisitPropertyMock(...args),
  useUpdateInspectionProperty: () =>
    idleMutation({ mutateAsync: updateMutateAsync }),
  useUpdateInspectionPropertyStatus: () =>
    idleMutation({ mutateAsync: statusMutateAsync }),
  useDeleteInspectionProperty: () => idleMutation(),
  useSaveInspectionPropertyAnswers: () =>
    idleMutation({ mutateAsync: answersMutateAsync }),
  useInspectionComplexNames: () => ({ data: [], isPending: false }),
}));

function answer(overrides: Partial<PropertyAnswer>): PropertyAnswer {
  return {
    questionId: 'q-text',
    questionVersionNo: 1,
    question: '채광 상태는 어떤가?',
    description: null,
    answerType: 'LONG_TEXT',
    required: true,
    sortOrder: 1,
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
    categoryId: 'cat-1',
    categoryName: '채광·환기',
    categorySortOrder: 1,
    ...overrides,
  };
}

function property(): ViewedPropertyDetail {
  return {
    propertyId: 'prop-1',
    visitId: 'visit-1',
    areaId: 'area-1',
    areaName: '성수동',
    visitedAt: '2026-09-17T14:00',
    complexName: '검증단지',
    name: '검증매물A',
    memo: null,
    oneLineReview: null,
    pros: null,
    cons: null,
    interestLevel: 3,
    status: 'DRAFT',
    sortOrder: 1,
    tags: [],
    cover: null,
    photos: [],
    answers: [
      answer({}),
      answer({
        questionId: 'q-dir',
        question: '방향은?',
        answerType: 'SINGLE_SELECT',
        required: false,
        sortOrder: 2,
        choiceOptions: [{ code: 'SOUTH', label: '남향', sortOrder: 1 }],
      }),
    ],
    incompleteSummary: {
      unansweredRequiredCount: 1,
      unansweredRequiredQuestions: [],
      missingFields: [],
      draftPropertyCount: 0,
      visitMissingFields: [],
      draftVisitCount: 0,
    },
    prevProperty: null,
    nextProperty: null,
  };
}

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid='location'>
      {location.pathname}
      {location.search}
    </output>
  );
}

function renderEdit(route?: string) {
  return renderWithProviders(
    <>
      <InspectionPropertyEditSection
        device='main'
        areaId='area-1'
        visitId='visit-1'
        propertyId='prop-1'
      />
      <LocationProbe />
    </>,
    { route }
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('InspectionPropertyEditSection autosave', () => {
  beforeEach(() => {
    calls.length = 0;
    updateMutateAsync.mockImplementation(async () => {
      calls.push('update');
      return property();
    });
    answersMutateAsync.mockImplementation(async () => {
      calls.push('answers');
    });
    statusMutateAsync.mockImplementation(async () => {
      calls.push('status');
    });
    useInspectionVisitPropertyMock.mockReturnValue({
      data: property(),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not save just because the screen opened', async () => {
    renderEdit();

    expect(screen.getByDisplayValue('검증매물A')).toBeTruthy();
    await wait(AUTOSAVE_DELAY_MS + 300);

    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(answersMutateAsync).not.toHaveBeenCalled();
  });

  it('saves a field edit once, 2 seconds after typing stops', async () => {
    const { user } = renderEdit();

    await user.type(screen.getByLabelText('한줄평'), '채광 좋음');
    await wait(AUTOSAVE_DELAY_MS - 500);
    expect(updateMutateAsync).not.toHaveBeenCalled();

    await waitFor(
      () =>
        expect(updateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ oneLineReview: '채광 좋음' })
        ),
      { timeout: 1500 }
    );
    expect(updateMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('batches text and choice answers into one request 2 seconds after the last input', async () => {
    const { user } = renderEdit();

    await user.click(screen.getByRole('button', { name: '남향' }));
    await user.type(screen.getByLabelText(/채광 상태는 어떤가/), '밝다');
    await wait(AUTOSAVE_DELAY_MS - 500);
    expect(answersMutateAsync).not.toHaveBeenCalled();

    await waitFor(() => expect(answersMutateAsync).toHaveBeenCalledTimes(1), {
      timeout: 1500,
    });
    expect(answersMutateAsync).toHaveBeenCalledWith(
      expect.arrayContaining([
        { questionId: 'q-dir', selectedCodes: ['SOUTH'] },
        { questionId: 'q-text', textValue: '밝다' },
      ])
    );
  });

  it('sends pending answers before completing instead of waiting out the delay', async () => {
    const { user } = renderEdit();

    await user.type(screen.getByLabelText(/채광 상태는 어떤가/), '밝다');
    await user.click(screen.getByRole('button', { name: '매물 완료' }));

    await waitFor(() => expect(statusMutateAsync).toHaveBeenCalled());
    expect(calls.indexOf('answers')).toBeGreaterThanOrEqual(0);
    expect(calls.indexOf('answers')).toBeLessThan(calls.indexOf('status'));

    await wait(AUTOSAVE_DELAY_MS + 300);
    expect(answersMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('sends a pending edit when the screen is left inside the delay window', async () => {
    const { user, unmount } = renderEdit();

    await user.type(screen.getByLabelText('한줄평'), '떠나기 직전');
    await user.click(screen.getByRole('button', { name: '남향' }));
    unmount();

    expect(updateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ oneLineReview: '떠나기 직전' })
    );
    await waitFor(() =>
      expect(answersMutateAsync).toHaveBeenCalledWith([
        { questionId: 'q-dir', selectedCodes: ['SOUTH'] },
      ])
    );
  });
});

describe('InspectionPropertyEditSection return target', () => {
  beforeEach(() => {
    updateMutateAsync.mockResolvedValue(property());
    statusMutateAsync.mockResolvedValue(undefined);
    useInspectionVisitPropertyMock.mockReturnValue({
      data: property(),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function completeProperty(user: ReturnType<typeof renderEdit>['user']) {
    await user.type(screen.getByLabelText(/채광 상태는 어떤가/), '밝다');
    await user.click(screen.getByRole('button', { name: '매물 완료' }));
  }

  it('returns to the register wizard by default', async () => {
    const { user } = renderEdit();

    await completeProperty(user);

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/register?draft=visit-1'
      )
    );
  });

  it('returns to the area detail on the same visit when opened from there', async () => {
    const { user } = renderEdit('/?from=area');

    await completeProperty(user);

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/area-1?visit=visit-1'
      )
    );
  });
});
