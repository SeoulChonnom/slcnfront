import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectionPropertyEditSection } from '@/domains/inspection/components/InspectionPropertyEditSection';
import type { ViewedPropertyDetail } from '@/domains/inspection/types';
import { renderWithProviders } from '@/test/helpers/render';

const useInspectionVisitPropertyMock = vi.fn();
const updateMutateAsync = vi.fn();

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
  useUpdateInspectionPropertyStatus: () => idleMutation(),
  useDeleteInspectionProperty: () => idleMutation(),
  useSaveInspectionPropertyAnswers: () => idleMutation(),
  useInspectionComplexNames: () => ({ data: [], isPending: false }),
}));

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
    answers: [],
    incompleteSummary: {
      unansweredRequiredCount: 0,
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

/** Longer than the 800 ms autosave debounce. */
const AUTOSAVE_WINDOW_MS = 1000;

describe('InspectionPropertyEditSection autosave', () => {
  beforeEach(() => {
    updateMutateAsync.mockResolvedValue(property());
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
    renderWithProviders(
      <InspectionPropertyEditSection
        device='main'
        areaId='area-1'
        visitId='visit-1'
        propertyId='prop-1'
      />
    );

    expect(screen.getByDisplayValue('검증매물A')).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, AUTOSAVE_WINDOW_MS));

    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it('still saves once the user actually edits a field', async () => {
    const { user } = renderWithProviders(
      <InspectionPropertyEditSection
        device='main'
        areaId='area-1'
        visitId='visit-1'
        propertyId='prop-1'
      />
    );

    await user.type(screen.getByLabelText('한줄평'), '채광 좋음');

    await waitFor(
      () =>
        expect(updateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ oneLineReview: '채광 좋음' })
        ),
      { timeout: AUTOSAVE_WINDOW_MS * 2 }
    );
    expect(updateMutateAsync).toHaveBeenCalledTimes(1);
  });
});
