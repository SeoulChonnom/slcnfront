import { describe, expect, it } from 'vitest';
import type {
  InspectionVisitDetailDto,
  InspectionVisitListItemDto,
  ViewedPropertyDetailDto,
} from '@/domains/inspection/api/inspection-schemas';
import {
  buildPropertyAnswerPayload,
  computeRevisitIntentCounts,
  mapInspectionVisitDetailDto,
  mapInspectionVisitListItemDto,
  mapViewedPropertyDetailDto,
} from '@/domains/inspection/mappers/inspection-mappers';

const baseIncompleteSummary = {
  unansweredRequiredCount: 0,
  unansweredRequiredQuestions: [],
  missingFields: [],
  draftPropertyCount: 0,
  visitMissingFields: [],
  draftVisitCount: 0,
};

describe('§3-① visitId normalization', () => {
  it('mapViewedPropertyDetailDto renames the wire `inspectionVisitId` to `visitId`', () => {
    const dto: ViewedPropertyDetailDto = {
      propertyId: 'PROP-02',
      inspectionVisitId: 'VISIT-03',
      areaId: 'AREA-01',
      areaName: '성수동',
      visitedAt: '2026-09-17T14:00',
      complexName: '트리마제',
      name: '101동 1203호 / 84A',
      memo: null,
      oneLineReview: null,
      pros: null,
      cons: null,
      interestLevel: 5,
      status: 'DRAFT',
      sortOrder: 2,
      tags: [],
      cover: null,
      photos: [],
      answers: [],
      incompleteSummary: baseIncompleteSummary,
      prevProperty: null,
      nextProperty: null,
    };

    const result = mapViewedPropertyDetailDto(dto);

    expect(result.visitId).toBe('VISIT-03');
    expect(result).not.toHaveProperty('inspectionVisitId');
  });

  it('mapInspectionVisitDetailDto renames the wire `inspectionVisitId` to `visitId`', () => {
    const dto: InspectionVisitDetailDto = {
      inspectionVisitId: 'VISIT-03',
      area: { areaId: 'AREA-01', name: '성수동' },
      visitedAt: '2026-09-17T14:00',
      memo: null,
      revisitIntent: 'YES',
      oneLineReview: null,
      pros: null,
      cons: null,
      status: 'DRAFT',
      tags: [],
      properties: [],
      cover: null,
      photos: [],
      incompleteSummary: baseIncompleteSummary,
    };

    const result = mapInspectionVisitDetailDto(dto);

    expect(result.visitId).toBe('VISIT-03');
    expect(result).not.toHaveProperty('inspectionVisitId');
  });

  it('mapInspectionVisitListItemDto renames the wire `inspectionVisitId` to `visitId`', () => {
    const dto: InspectionVisitListItemDto = {
      inspectionVisitId: 'VISIT-09',
      area: { areaId: 'AREA-06', name: '분당' },
      visitedAt: '2026-09-20T15:00',
      oneLineReview: null,
      revisitIntent: 'YES',
      status: 'COMPLETED',
      propertyCount: 1,
      topInterestProperty: null,
      tags: [],
      cover: null,
      incompleteSummary: baseIncompleteSummary,
    };

    const result = mapInspectionVisitListItemDto(dto);

    expect(result.visitId).toBe('VISIT-09');
    expect(result).not.toHaveProperty('inspectionVisitId');
  });
});

describe('§3-④ computeRevisitIntentCounts (미정 계산)', () => {
  it('derives UNDECIDED as total - (YES + MAYBE + NO)', () => {
    const result = computeRevisitIntentCounts({
      total: 7,
      YES: 3,
      MAYBE: 1,
      NO: 1,
    });

    expect(result.UNDECIDED).toBe(2);
    expect(result).toEqual({ total: 7, YES: 3, MAYBE: 1, NO: 1, UNDECIDED: 2 });
  });

  it('is zero when every area has a decided latest-visit revisit intent', () => {
    const result = computeRevisitIntentCounts({
      total: 4,
      YES: 2,
      MAYBE: 1,
      NO: 1,
    });

    expect(result.UNDECIDED).toBe(0);
  });
});

describe('§3-⑦/§9 buildPropertyAnswerPayload', () => {
  it('sends only textValue for TEXT/LONG_TEXT', () => {
    expect(
      buildPropertyAnswerPayload('Q1', {
        answerType: 'LONG_TEXT',
        value: '밝다',
      })
    ).toEqual({ questionId: 'Q1', textValue: '밝다' });
  });

  it('sends only booleanValue for BOOLEAN', () => {
    expect(
      buildPropertyAnswerPayload('Q1', { answerType: 'BOOLEAN', value: true })
    ).toEqual({ questionId: 'Q1', booleanValue: true });
  });

  it('sends only numberValue for NUMBER', () => {
    expect(
      buildPropertyAnswerPayload('Q1', { answerType: 'NUMBER', value: 12 })
    ).toEqual({ questionId: 'Q1', numberValue: 12 });
  });

  it('sends only ratingValue for RATING', () => {
    expect(
      buildPropertyAnswerPayload('Q1', { answerType: 'RATING', value: 4 })
    ).toEqual({ questionId: 'Q1', ratingValue: 4 });
  });

  it('sends only selectedCodes for SINGLE_SELECT/MULTI_SELECT', () => {
    expect(
      buildPropertyAnswerPayload('Q1', {
        answerType: 'SINGLE_SELECT',
        value: ['SOUTH'],
      })
    ).toEqual({ questionId: 'Q1', selectedCodes: ['SOUTH'] });
  });

  it('passes through `null` to clear the answer, matching the API contract', () => {
    expect(
      buildPropertyAnswerPayload('Q1', { answerType: 'TEXT', value: null })
    ).toEqual({ questionId: 'Q1', textValue: null });
  });
});
