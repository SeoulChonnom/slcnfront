import { describe, expect, it } from 'vitest';
import {
  parseInspectionAreaDetailResponse,
  parseInspectionAreaListResponse,
  parseInspectionVisitDetailResponse,
  parseInspectionVisitListResponse,
  parseViewedPropertyDetailResponse,
} from '@/domains/inspection/api/inspection-schemas';

// Fixtures below are trimmed captures of real responses from the local BE
// (localhost:8080, seed data) — not hand-guessed shapes. In particular they
// keep the `null`s the live server actually returned for `latestVisit.
// propertyCount` / `.incompleteSummary` / `.cover`, `matchedProperty`, and
// `revisitIntent` on a still-DRAFT visit, none of which docs/api_spec.json
// marks as nullable.

describe('parseInspectionAreaListResponse', () => {
  it('parses a real area-list response, including its null-heavy latestVisit', () => {
    const payload = {
      items: [
        {
          areaId: 'AREA-01',
          name: '성수동',
          description: '서울숲 ~ 뚝섬역 주변',
          visitCount: 3,
          firstVisitedAt: '2026-03-11T10:00',
          lastVisitedAt: '2026-09-17T14:00',
          totalPropertyCount: 4,
          latestVisit: {
            visitId: 'VISIT-03',
            visitedAt: '2026-09-17T14:00',
            oneLineReview: '직주근접은 좋지만 가격이 부담',
            revisitIntent: 'YES',
            status: 'DRAFT',
            tags: ['서울숲', '직주근접', '한강'],
            propertyCount: null,
            incompleteSummary: null,
            cover: null,
          },
          topProperty: {
            propertyId: 'PROP-02',
            complexName: '트리마제',
            name: '101동 1203호 / 84A',
            interestLevel: 5,
          },
          incompleteSummary: {
            unansweredRequiredCount: 3,
            unansweredRequiredQuestions: [],
            missingFields: [],
            draftPropertyCount: 2,
            visitMissingFields: [],
            draftVisitCount: 1,
          },
          thumbnails: [],
          totalImageCount: 0,
          matchedProperty: null,
        },
        {
          areaId: 'AREA-05',
          name: '노원',
          description: 'Green Park 산책로',
          visitCount: 0,
          firstVisitedAt: null,
          lastVisitedAt: null,
          totalPropertyCount: 0,
          latestVisit: null,
          topProperty: null,
          incompleteSummary: {
            unansweredRequiredCount: 0,
            unansweredRequiredQuestions: [],
            missingFields: [],
            draftPropertyCount: 0,
            visitMissingFields: [],
            draftVisitCount: 0,
          },
          thumbnails: [],
          totalImageCount: 0,
          matchedProperty: null,
        },
      ],
      totalCount: 7,
      hasNext: false,
      revisitIntentCounts: { total: 7, YES: 3, MAYBE: 1, NO: 1 },
      totals: { areaCount: 7, visitCount: 10, propertyCount: 10 },
    };

    const result = parseInspectionAreaListResponse(payload);

    expect(result.items[0]?.latestVisit?.propertyCount).toBeNull();
    expect(result.items[0]?.latestVisit?.incompleteSummary).toBeNull();
    expect(result.items[1]?.latestVisit).toBeNull();
    expect(result.items[1]?.firstVisitedAt).toBeNull();
    expect(result.revisitIntentCounts).toEqual({
      total: 7,
      YES: 3,
      MAYBE: 1,
      NO: 1,
    });
  });

  it('parses a matched-property row (keyword hit on a property, not the area)', () => {
    const payload = {
      items: [
        {
          areaId: 'AREA-01',
          name: '성수동',
          description: '서울숲 ~ 뚝섬역 주변',
          visitCount: 3,
          firstVisitedAt: '2026-03-11T10:00',
          lastVisitedAt: '2026-09-17T14:00',
          totalPropertyCount: 4,
          latestVisit: null,
          topProperty: {
            propertyId: 'PROP-02',
            complexName: '트리마제',
            name: '101동 1203호 / 84A',
            interestLevel: 5,
          },
          incompleteSummary: {
            unansweredRequiredCount: 0,
            unansweredRequiredQuestions: [],
            missingFields: [],
            draftPropertyCount: 0,
            visitMissingFields: [],
            draftVisitCount: 0,
          },
          thumbnails: [],
          totalImageCount: 0,
          matchedProperty: {
            propertyId: 'PROP-02',
            visitId: 'VISIT-03',
            complexName: '트리마제',
            name: '101동 1203호 / 84A',
            interestLevel: 5,
          },
        },
      ],
      totalCount: 1,
      hasNext: false,
      revisitIntentCounts: { total: 7, YES: 3, MAYBE: 1, NO: 1 },
      totals: { areaCount: 7, visitCount: 10, propertyCount: 10 },
    };

    const result = parseInspectionAreaListResponse(payload);

    expect(result.items[0]?.matchedProperty).toEqual({
      propertyId: 'PROP-02',
      visitId: 'VISIT-03',
      complexName: '트리마제',
      name: '101동 1203호 / 84A',
      interestLevel: 5,
    });
  });
});

describe('parseInspectionAreaDetailResponse', () => {
  it('parses a real area-detail response, with visits[] fully populated unlike latestVisit', () => {
    const payload = {
      area: {
        areaId: 'AREA-01',
        name: '성수동',
        description: '서울숲 ~ 뚝섬역 주변',
        visitCount: 3,
        firstVisitedAt: '2026-03-11T10:00',
        lastVisitedAt: '2026-09-17T14:00',
        totalPropertyCount: 4,
        latestVisit: {
          visitId: 'VISIT-03',
          visitedAt: '2026-09-17T14:00',
          oneLineReview: '직주근접은 좋지만 가격이 부담',
          revisitIntent: 'YES',
          status: 'DRAFT',
          tags: ['서울숲'],
          propertyCount: null,
          incompleteSummary: null,
          cover: null,
        },
        topProperty: {
          propertyId: 'PROP-02',
          complexName: '트리마제',
          name: '101동 1203호 / 84A',
          interestLevel: 5,
        },
        incompleteSummary: {
          unansweredRequiredCount: 3,
          unansweredRequiredQuestions: [],
          missingFields: [],
          draftPropertyCount: 2,
          visitMissingFields: [],
          draftVisitCount: 1,
        },
        thumbnails: [],
        totalImageCount: 0,
        matchedProperty: null,
      },
      visits: [
        {
          visitId: 'VISIT-03',
          visitedAt: '2026-09-17T14:00',
          oneLineReview: '직주근접은 좋지만 가격이 부담',
          revisitIntent: 'YES',
          status: 'DRAFT',
          tags: ['서울숲'],
          propertyCount: 2,
          incompleteSummary: {
            unansweredRequiredCount: 3,
            unansweredRequiredQuestions: [],
            missingFields: [],
            draftPropertyCount: 2,
            visitMissingFields: [],
            draftVisitCount: 0,
          },
          cover: null,
        },
      ],
      hasMoreVisits: false,
      visitPageSize: 50,
      selectedVisit: {
        inspectionVisitId: 'VISIT-03',
        area: { areaId: 'AREA-01', name: '성수동' },
        visitedAt: '2026-09-17T14:00',
        memo: '메모3',
        revisitIntent: 'YES',
        oneLineReview: '직주근접은 좋지만 가격이 부담',
        pros: null,
        cons: null,
        status: 'DRAFT',
        tags: ['서울숲'],
        properties: [],
        cover: null,
        photos: [],
        incompleteSummary: {
          unansweredRequiredCount: 3,
          unansweredRequiredQuestions: [],
          missingFields: [],
          draftPropertyCount: 2,
          visitMissingFields: [],
          draftVisitCount: 0,
        },
      },
    };

    const result = parseInspectionAreaDetailResponse(payload);

    // §4-④ decision: visits[] carries the real numbers, latestVisit doesn't.
    expect(result.visits[0]?.propertyCount).toBe(2);
    expect(result.visits[0]?.incompleteSummary).not.toBeNull();
    expect(result.area.latestVisit?.propertyCount).toBeNull();
    expect(result.visitPageSize).toBe(50);
  });
});

describe('parseInspectionVisitDetailResponse / parseInspectionVisitListResponse', () => {
  it('parses a visit detail whose wire id field is `inspectionVisitId`', () => {
    const payload = {
      inspectionVisitId: 'VISIT-03',
      area: { areaId: 'AREA-01', name: '성수동' },
      visitedAt: '2026-09-17T14:00',
      memo: '메모3',
      revisitIntent: 'YES',
      oneLineReview: '직주근접은 좋지만 가격이 부담',
      pros: null,
      cons: null,
      status: 'DRAFT',
      tags: ['서울숲'],
      properties: [],
      cover: null,
      photos: [],
      incompleteSummary: {
        unansweredRequiredCount: 3,
        unansweredRequiredQuestions: [],
        missingFields: [],
        draftPropertyCount: 2,
        visitMissingFields: [],
        draftVisitCount: 0,
      },
    };

    const dto = parseInspectionVisitDetailResponse(payload, 'detail');

    expect(dto.inspectionVisitId).toBe('VISIT-03');
  });

  it('parses a visit list response whose items use `topInterestProperty`', () => {
    const payload = {
      items: [
        {
          inspectionVisitId: 'VISIT-09',
          area: { areaId: 'AREA-06', name: '분당' },
          visitedAt: '2026-09-20T15:00',
          oneLineReview: '가장 최근 임장',
          revisitIntent: 'YES',
          status: 'COMPLETED',
          propertyCount: 1,
          topInterestProperty: {
            propertyId: 'PROP-09',
            complexName: '파크뷰',
            name: '401동 1201호',
            interestLevel: 3,
          },
          tags: ['한강'],
          cover: null,
          incompleteSummary: {
            unansweredRequiredCount: 0,
            unansweredRequiredQuestions: [],
            missingFields: [],
            draftPropertyCount: 0,
            visitMissingFields: [],
            draftVisitCount: 0,
          },
        },
      ],
      totalCount: 10,
      hasNext: true,
    };

    const result = parseInspectionVisitListResponse(payload);

    expect(result.items[0]?.topInterestProperty?.propertyId).toBe('PROP-09');
    expect(result.hasNext).toBe(true);
  });
});

describe('parseViewedPropertyDetailResponse', () => {
  it('parses a property detail with prev/next links and an empty answers array', () => {
    const payload = {
      propertyId: 'PROP-02',
      inspectionVisitId: 'VISIT-03',
      areaId: 'AREA-01',
      areaName: '성수동',
      visitedAt: '2026-09-17T14:00',
      complexName: '트리마제',
      name: '101동 1203호 / 84A',
      memo: null,
      oneLineReview: '최신 회차 관심도 5',
      pros: null,
      cons: null,
      interestLevel: 5,
      status: 'DRAFT',
      sortOrder: 2,
      tags: ['고층', '남향', '한강'],
      cover: null,
      photos: [],
      answers: [],
      incompleteSummary: {
        unansweredRequiredCount: 2,
        unansweredRequiredQuestions: [],
        missingFields: [],
        draftPropertyCount: 0,
        visitMissingFields: [],
        draftVisitCount: 0,
      },
      prevProperty: {
        propertyId: 'PROP-03',
        complexName: '트리마제',
        name: '102동 1501호 / 84A',
        interestLevel: 4,
      },
      nextProperty: null,
    };

    const dto = parseViewedPropertyDetailResponse(payload, 'detail');

    expect(dto.inspectionVisitId).toBe('VISIT-03');
    expect(dto.prevProperty?.propertyId).toBe('PROP-03');
    expect(dto.nextProperty).toBeNull();
  });

  it('parses answers with the type-specific value fields the server actually sends', () => {
    const payload = {
      propertyId: 'ca5dfd63-b470-4d63-a1d8-a3f07c807a9e',
      inspectionVisitId: 'VISIT-03',
      areaId: 'AREA-01',
      areaName: '성수동',
      visitedAt: '2026-09-17T14:00',
      complexName: '테스트단지',
      name: '테스트 101호',
      memo: null,
      oneLineReview: null,
      pros: null,
      cons: null,
      interestLevel: null,
      status: 'DRAFT',
      sortOrder: 3,
      tags: [],
      cover: null,
      photos: [],
      answers: [
        {
          questionId: 'INSPECTION_QUESTION-0002',
          questionVersionNo: 1,
          question: '채광 상태는 어떤가?',
          description: '오후 기준',
          answerType: 'LONG_TEXT',
          required: true,
          sortOrder: 1,
          unit: null,
          answered: true,
          choiceOptions: [],
          textValue: '밝다',
          booleanValue: null,
          numberValue: null,
          ratingValue: null,
          selectedCodes: [],
          isCurrentVersion: true,
          questionEnabled: true,
        },
        {
          questionId: 'INSPECTION_QUESTION-0003',
          questionVersionNo: 1,
          question: '방향은?',
          description: null,
          answerType: 'SINGLE_SELECT',
          required: false,
          sortOrder: 2,
          unit: null,
          answered: true,
          choiceOptions: [
            { code: 'SOUTH', label: '남향', sortOrder: 1 },
            { code: 'NORTH', label: '북향', sortOrder: 2 },
          ],
          textValue: null,
          booleanValue: null,
          numberValue: null,
          ratingValue: null,
          selectedCodes: ['SOUTH'],
          isCurrentVersion: true,
          questionEnabled: true,
        },
      ],
      incompleteSummary: {
        unansweredRequiredCount: 0,
        unansweredRequiredQuestions: [],
        missingFields: ['interestLevel'],
        draftPropertyCount: 0,
        visitMissingFields: [],
        draftVisitCount: 0,
      },
      prevProperty: null,
      nextProperty: null,
    };

    const dto = parseViewedPropertyDetailResponse(payload, 'answers');

    expect(dto.answers[0]?.textValue).toBe('밝다');
    expect(dto.answers[1]?.selectedCodes).toEqual(['SOUTH']);
  });
});
