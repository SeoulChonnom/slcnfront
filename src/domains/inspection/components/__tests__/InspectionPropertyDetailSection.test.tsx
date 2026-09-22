import { fireEvent, screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InspectionPropertyDetailSection } from '@/domains/inspection/components/InspectionPropertyDetailSection';
import type {
  AreaViewedProperty,
  PropertyAnswer,
  ViewedPropertyDetail,
} from '@/domains/inspection/types';
import { renderWithProviders } from '@/test/helpers/render';

const useInspectionPropertyMock = vi.fn();
const useInspectionAreaPropertiesMock = vi.fn();
const useDeleteInspectionPropertyMock = vi.fn();

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionProperty: (...args: unknown[]) =>
    useInspectionPropertyMock(...args),
  useInspectionAreaProperties: (...args: unknown[]) =>
    useInspectionAreaPropertiesMock(...args),
  useDeleteInspectionProperty: (...args: unknown[]) =>
    useDeleteInspectionPropertyMock(...args),
}));

function renderAt(propertyId = 'prop-1') {
  return renderWithProviders(
    <Routes>
      <Route
        path='/main/inspection/:areaId/property/:propertyId'
        element={<InspectionPropertyDetailSection device='main' />}
      />
    </Routes>,
    { route: `/main/inspection/area-1/property/${propertyId}` }
  );
}

function answer(overrides: Partial<PropertyAnswer>): PropertyAnswer {
  return {
    questionId: 'q-1',
    questionVersionNo: 2,
    question: '거실 채광은 어떤가?',
    description: null,
    answerType: 'LONG_TEXT',
    required: true,
    sortOrder: 0,
    unit: null,
    answered: true,
    choiceOptions: [],
    textValue: '오후에 밝다.',
    booleanValue: null,
    numberValue: null,
    ratingValue: null,
    selectedCodes: [],
    isCurrentVersion: true,
    questionEnabled: true,
    ...overrides,
  };
}

function property(
  overrides: Partial<ViewedPropertyDetail> = {}
): ViewedPropertyDetail {
  return {
    propertyId: 'prop-1',
    visitId: 'visit-1',
    areaId: 'area-1',
    areaName: '성수동',
    visitedAt: '2026-09-17T14:00',
    complexName: '트리마제',
    name: '101동 1203호',
    memo: '거실이 넓다.',
    oneLineReview: '가장 마음에 들었던 집',
    pros: '오후 채광 좋음\n한강 조망',
    cons: '관리비 비쌈',
    interestLevel: 5,
    status: 'COMPLETED',
    sortOrder: 0,
    tags: ['남향', '고층'],
    cover: null,
    photos: [
      {
        id: 'file-1',
        fileAssetId: 'asset-1',
        targetType: 'PROPERTY',
        targetId: 'prop-1',
        role: 'GALLERY',
        caption: '거실',
        sortOrder: 0,
      },
      {
        id: 'file-2',
        fileAssetId: 'asset-2',
        targetType: 'PROPERTY',
        targetId: 'prop-1',
        role: 'GALLERY',
        caption: null,
        sortOrder: 1,
      },
    ],
    answers: [answer({})],
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
    ...overrides,
  };
}

function areaProp(overrides: Partial<AreaViewedProperty>): AreaViewedProperty {
  return {
    propertyId: 'prop-1',
    visitId: 'visit-1',
    visitedAt: '2026-09-17T14:00',
    complexName: '트리마제',
    name: '101동 1203호',
    interestLevel: 5,
    status: 'COMPLETED',
    ...overrides,
  };
}

describe('InspectionPropertyDetailSection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a skeleton while pending, without any content', () => {
    useInspectionPropertyMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });
    useDeleteInspectionPropertyMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderAt();

    expect(
      document.querySelector('.slcn-inspection-property-detail__skeleton')
    ).toBeTruthy();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('renders an error state with a retry action', () => {
    const refetch = vi.fn();
    useInspectionPropertyMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    });
    useInspectionAreaPropertiesMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
    });
    useDeleteInspectionPropertyMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderAt();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders the breadcrumb, header, quote, tags, memo, pros/cons and gallery', () => {
    useInspectionPropertyMock.mockReturnValue({
      data: property(),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({
      data: [areaProp({})],
      isPending: false,
      isError: false,
    });
    useDeleteInspectionPropertyMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderAt();

    // Breadcrumb
    const crumb = screen.getByRole('navigation', { name: '현재 위치' });
    expect(within(crumb).getByText('임장')).toBeTruthy();
    expect(within(crumb).getByText('성수동')).toBeTruthy();
    expect(within(crumb).getByText('2026.09.17 임장')).toBeTruthy();
    expect(within(crumb).getByText('트리마제 101동 1203호')).toBeTruthy();

    // Header
    expect(screen.getByRole('heading', { name: '101동 1203호' })).toBeTruthy();
    expect(screen.getByText('5 / 5 · 매우 관심 있음')).toBeTruthy();

    // Quote / tags / memo / pros-cons
    expect(screen.getByText('“가장 마음에 들었던 집”')).toBeTruthy();
    expect(screen.getByText('#남향')).toBeTruthy();
    expect(screen.getByText('거실이 넓다.')).toBeTruthy();
    expect(screen.getByText('오후 채광 좋음')).toBeTruthy();
    expect(screen.getByText('관리비 비쌈')).toBeTruthy();

    // Gallery: caption present vs. alt="" fallback when caption is null
    const img1 = screen.getByAltText('거실') as HTMLImageElement;
    expect(img1.src).toContain('asset-1');
    // alt="" images have no accessible role, so query the DOM directly.
    const images = Array.from(document.querySelectorAll('img'));
    const uncaptioned = images.find((img) => img.getAttribute('alt') === '');
    expect(uncaptioned).toBeTruthy();
  });

  it('hides the lineage strip when only the current property matches (no other visit)', () => {
    useInspectionPropertyMock.mockReturnValue({
      data: property(),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({
      data: [areaProp({})],
      isPending: false,
      isError: false,
    });
    useDeleteInspectionPropertyMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderAt();

    expect(screen.queryByText('같은 이름으로 기록된 다른 회차')).toBeNull();
  });

  it('shows the lineage strip with a computed delta when a linked older visit exists, and hides it after 연결 해제', () => {
    useInspectionPropertyMock.mockReturnValue({
      data: property({ interestLevel: 5 }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({
      data: [
        areaProp({
          propertyId: 'prop-1',
          visitedAt: '2026-09-17T14:00',
          interestLevel: 5,
        }),
        areaProp({
          propertyId: 'prop-0',
          visitId: 'visit-0',
          visitedAt: '2026-06-02T10:00',
          interestLevel: 3,
        }),
      ],
      isPending: false,
      isError: false,
    });
    useDeleteInspectionPropertyMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderAt();

    expect(screen.getByText('같은 이름으로 기록된 다른 회차')).toBeTruthy();
    expect(screen.getByText(/2단계 올림/)).toBeTruthy();
    expect(screen.getByText(/지금 보는 기록/)).toBeTruthy();
    expect(screen.getByText(/처음 본 회차/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '연결 해제' }));
    expect(screen.queryByText('같은 이름으로 기록된 다른 회차')).toBeNull();
  });

  it('renders Q&A snapshot values and badges without branching on isCurrentVersion/questionEnabled', () => {
    useInspectionPropertyMock.mockReturnValue({
      data: property({
        answers: [
          answer({
            questionId: 'q-version',
            question: '옛 질문',
            isCurrentVersion: false,
            questionVersionNo: 1,
          }),
          answer({
            questionId: 'q-disabled',
            question: '미사용 질문',
            questionEnabled: false,
            required: false,
          }),
          answer({
            questionId: 'q-required-empty',
            question: '필수인데 미작성',
            required: true,
            answered: false,
            textValue: null,
          }),
          answer({
            questionId: 'q-number',
            question: '주차는 몇 대인가?',
            answerType: 'NUMBER',
            unit: '대',
            numberValue: 1.4,
            textValue: null,
          }),
          answer({
            questionId: 'q-single',
            question: '관리비 수준은?',
            answerType: 'SINGLE_SELECT',
            required: false,
            choiceOptions: [{ code: 'HIGH', label: '비싼 편', sortOrder: 0 }],
            selectedCodes: ['HIGH'],
            textValue: null,
          }),
          answer({
            questionId: 'q-bool',
            question: '즉시 입주 가능한가?',
            answerType: 'BOOLEAN',
            required: false,
            booleanValue: false,
            textValue: null,
          }),
          answer({
            questionId: 'q-rating',
            question: '다시 보러 오고 싶은가?',
            answerType: 'RATING',
            required: false,
            ratingValue: 4,
            textValue: null,
          }),
        ],
      }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({
      data: [areaProp({})],
      isPending: false,
      isError: false,
    });
    useDeleteInspectionPropertyMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderAt();

    expect(screen.getByText(/이 기록은 v1 질문 기준/)).toBeTruthy();
    expect(screen.getByText(/현재 미사용 질문/)).toBeTruthy();
    expect(screen.getByText('아직 작성하지 않았습니다')).toBeTruthy();
    expect(screen.getByText('1.4대')).toBeTruthy();
    expect(screen.getByText('비싼 편')).toBeTruthy();
    expect(screen.getByText('아니오')).toBeTruthy();

    // Footer info line names the visit date this question set was captured at.
    expect(
      screen.getByText(/임장 시점의 질문 구성으로 저장되어 있습니다/)
    ).toBeTruthy();
  });

  it('shows prev/next links when present, and falls back to the property list when there is no previous property', () => {
    useInspectionPropertyMock.mockReturnValue({
      data: property({
        prevProperty: null,
        nextProperty: {
          propertyId: 'prop-2',
          complexName: '트리마제',
          name: '102동 1501호',
          interestLevel: 4,
        },
      }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({
      data: [areaProp({})],
      isPending: false,
      isError: false,
    });
    useDeleteInspectionPropertyMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    renderAt();

    expect(screen.getByText('← 이 임장의 매물 목록')).toBeTruthy();
    expect(screen.getByText(/다음 매물 · 102동 1501호/)).toBeTruthy();
  });

  it('opens a delete confirmation naming what is removed, and calls the mutation on confirm', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    useInspectionPropertyMock.mockReturnValue({
      data: property(),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    useInspectionAreaPropertiesMock.mockReturnValue({
      data: [areaProp({})],
      isPending: false,
      isError: false,
    });
    useDeleteInspectionPropertyMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderAt();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByText(/사진 2장, 태그 2개, 문답 응답 1개/)).toBeTruthy();

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: '삭제' }));
    await vi.waitFor(() => expect(mutateAsync).toHaveBeenCalledWith('prop-1'));
  });
});
