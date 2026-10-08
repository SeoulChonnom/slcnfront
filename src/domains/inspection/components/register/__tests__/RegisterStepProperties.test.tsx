import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RegisterStepProperties } from '@/domains/inspection/components/register/RegisterStepProperties';
import { renderWithProviders } from '@/test/helpers/render';

const useInspectionVisitMock = vi.fn();

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionVisit: (visitId: string) => useInspectionVisitMock(visitId),
  useReorderInspectionVisitProperties: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/domains/inspection/components/AddPropertyForm', () => ({
  AddPropertyForm: () => null,
}));

const emptySummary = {
  unansweredRequiredCount: 0,
  unansweredRequiredQuestions: [],
  missingFields: [],
  draftPropertyCount: 0,
  visitMissingFields: [],
  draftVisitCount: 0,
};

function setupVisit(completedAt: string | null) {
  useInspectionVisitMock.mockReturnValue({
    isLoading: false,
    data: {
      visitId: 'visit-1',
      area: { areaId: 'area-1', name: '성수동' },
      status: 'DRAFT',
      completedAt,
      properties: [
        {
          propertyId: 'prop-1',
          complexName: '트리마제',
          name: null,
          status: 'DRAFT',
          sortOrder: 0,
          interestLevel: null,
          incompleteSummary: {
            ...emptySummary,
            unansweredRequiredCount: 2,
          },
        },
      ],
    },
  });
}

describe('RegisterStepProperties draft badge', () => {
  it('hides the property "작성 중" badge while the visit is planned', () => {
    setupVisit(null);
    renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    expect(screen.getByText(/트리마제/)).toBeTruthy();
    expect(screen.queryByText('작성 중')).toBeNull();
  });

  it('shows the property "작성 중" badge and reason while the visit is being revised', () => {
    setupVisit('2026-09-17T18:30');
    renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    expect(screen.getByText('작성 중')).toBeTruthy();
    expect(screen.getByText(/필수 문답 2개 남음/)).toBeTruthy();
  });
});
