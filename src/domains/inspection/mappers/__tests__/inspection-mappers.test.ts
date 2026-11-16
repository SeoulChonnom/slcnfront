import { describe, expect, it } from 'vitest';
import type {
  InspectionAreaRdoDto,
  InspectionVisitDetailDto,
  InspectionVisitListItemDto,
  ViewedPropertyDetailDto,
} from '@/domains/inspection/api/inspection-schemas';
import { buildVisitFilesPayload } from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import {
  buildPropertyAnswerPayload,
  computeRevisitIntentCounts,
  mapInspectionAreaDto,
  mapInspectionVisitDetailDto,
  mapInspectionVisitListItemDto,
  mapViewedPropertyDetailDto,
} from '@/domains/inspection/mappers/inspection-mappers';
import type { FileBoxItem } from '@/domains/inspection/types';

const baseIncompleteSummary = {
  unansweredRequiredCount: 0,
  unansweredRequiredQuestions: [],
  missingFields: [],
  draftPropertyCount: 0,
  visitMissingFields: [],
  draftVisitCount: 0,
  plannedVisitCount: 0,
};

describe('detail photos preserve the cover across replacement saves', () => {
  const photo = (id: string, role: FileBoxItem['role']): FileBoxItem => ({
    id,
    fileAssetId: `asset-${id}`,
    targetType: 'VIEWED_PROPERTY',
    targetId: 'prop-1',
    role,
    caption: id,
    sortOrder: role === 'COVER' ? 1 : 2,
  });
  const cover = photo('cover', 'COVER');
  const gallery = photo('gallery', 'GALLERY');
  const propertyDto: ViewedPropertyDetailDto = {
    propertyId: 'prop-1',
    inspectionVisitId: 'visit-1',
    areaId: 'area-1',
    areaName: '성수동',
    visitedAt: '2026-09-17T14:00',
    complexName: '검증단지',
    name: '101호',
    memo: null,
    oneLineReview: null,
    pros: null,
    cons: null,
    interestLevel: 3,
    status: 'DRAFT',
    sortOrder: 1,
    tags: [],
    cover,
    photos: [gallery],
    answers: [],
    incompleteSummary: baseIncompleteSummary,
    prevProperty: null,
    nextProperty: null,
    location: null,
  };
  const visitDto: InspectionVisitDetailDto = {
    inspectionVisitId: 'visit-1',
    area: { areaId: 'area-1', name: '성수동' },
    visitedAt: '2026-09-17T14:00',
    memo: null,
    revisitIntent: null,
    oneLineReview: null,
    pros: null,
    cons: null,
    status: 'DRAFT',
    completedAt: null,
    tags: [],
    properties: [propertyDto],
    cover,
    photos: [gallery],
    incompleteSummary: baseIncompleteSummary,
  };

  it.each(['property', 'visit'] as const)(
    'keeps every image over repeated %s save/reload cycles',
    (kind) => {
      let wire = { cover: propertyDto.cover, photos: propertyDto.photos };
      for (let cycle = 0; cycle < 3; cycle += 1) {
        const detail =
          kind === 'property'
            ? mapViewedPropertyDetailDto({ ...propertyDto, ...wire })
            : mapInspectionVisitDetailDto({ ...visitDto, ...wire });
        const files = buildVisitFilesPayload(
          detail.photos.map((item) => ({
            key: item.id,
            id: item.id,
            fileAssetId: item.fileAssetId,
            caption: item.caption ?? '',
          }))
        );
        expect(files.map((item) => item.id)).toEqual(['cover', 'gallery']);
        expect(files.map((item) => item.role)).toEqual(['COVER', 'GALLERY']);
        // The server splits COVER and GALLERY in its response after replacing files.
        const saved = files.map((item) => {
          if (!item.id || !item.role)
            throw new Error('Missing saved photo identity');
          return {
            ...photo(item.id, item.role),
            caption: item.caption ?? null,
          };
        });
        wire = {
          cover: saved.find((item) => item.role === 'COVER') ?? null,
          photos: saved.filter((item) => item.role === 'GALLERY'),
        };
      }
    }
  );

  it('includes cover-only responses and does not duplicate a cover already in photos', () => {
    for (const photos of [[], [cover], [cover, gallery], [gallery, cover]]) {
      const expected = photos.includes(gallery) ? [cover, gallery] : [cover];
      expect(
        mapViewedPropertyDetailDto({ ...propertyDto, photos }).photos
      ).toEqual(expected);
      expect(
        mapInspectionVisitDetailDto({ ...visitDto, photos }).photos
      ).toEqual(expected);
    }
  });

  it('preserves the gallery order when there is no cover', () => {
    expect(
      mapViewedPropertyDetailDto({ ...propertyDto, cover: null }).photos
    ).toEqual([gallery]);
    const detail = mapInspectionVisitDetailDto(visitDto);
    expect(detail.properties[0].photos).toEqual([cover, gallery]);
  });
});

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
      location: null,
    };

    const result = mapViewedPropertyDetailDto(dto);

    expect(result.visitId).toBe('VISIT-03');
    expect(result).not.toHaveProperty('inspectionVisitId');
  });

  it('mapViewedPropertyDetailDto keeps a null name (no coercion to empty string)', () => {
    const result = mapViewedPropertyDetailDto({
      propertyId: 'PROP-09',
      inspectionVisitId: 'VISIT-03',
      areaId: 'AREA-01',
      areaName: '성수동',
      visitedAt: '2026-09-17T14:00',
      complexName: '트리마제',
      name: null,
      memo: null,
      oneLineReview: null,
      pros: null,
      cons: null,
      interestLevel: null,
      status: 'DRAFT',
      sortOrder: 1,
      tags: [],
      cover: null,
      photos: [],
      answers: [],
      incompleteSummary: baseIncompleteSummary,
      prevProperty: {
        propertyId: 'PROP-08',
        complexName: '트리마제',
        name: null,
        interestLevel: null,
      },
      nextProperty: null,
      location: null,
    });

    expect(result.name).toBeNull();
    expect(result.prevProperty?.name).toBeNull();
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
      completedAt: '2026-09-23T09:28:52',
      tags: [],
      properties: [],
      cover: null,
      photos: [],
      incompleteSummary: baseIncompleteSummary,
    };

    const result = mapInspectionVisitDetailDto(dto);

    expect(result.visitId).toBe('VISIT-03');
    expect(result.completedAt).toBe('2026-09-23T09:28:52');
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
      completedAt: null,
      propertyCount: 1,
      topInterestProperty: null,
      tags: [],
      cover: null,
      incompleteSummary: baseIncompleteSummary,
    };

    const result = mapInspectionVisitListItemDto(dto);

    expect(result.visitId).toBe('VISIT-09');
    expect(result.completedAt).toBeNull();
    expect(result).not.toHaveProperty('inspectionVisitId');
  });
});

describe('area row plannedVisit', () => {
  const row = (plannedVisit: InspectionAreaRdoDto['plannedVisit']) =>
    ({
      areaId: 'AREA-09',
      name: '송파',
      description: null,
      visitCount: 0,
      firstVisitedAt: null,
      lastVisitedAt: null,
      totalPropertyCount: 0,
      latestVisit: null,
      plannedVisit,
      topProperty: null,
      incompleteSummary: { ...baseIncompleteSummary, plannedVisitCount: 1 },
      thumbnails: [],
      totalImageCount: 0,
      matchedProperty: null,
    }) satisfies InspectionAreaRdoDto;

  it('normalizes the wire `inspectionVisitId` to `visitId`', () => {
    const result = mapInspectionAreaDto(
      row({ inspectionVisitId: 'VISIT-20', visitedAt: '2026-10-12T14:00' })
    );

    expect(result.plannedVisit).toEqual({
      visitId: 'VISIT-20',
      visitedAt: '2026-10-12T14:00',
    });
    expect(result.incompleteSummary.plannedVisitCount).toBe(1);
  });

  it('keeps a plan-only area free of visit data', () => {
    const result = mapInspectionAreaDto(row(null));

    expect(result.plannedVisit).toBeNull();
    expect(result.latestVisit).toBeNull();
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
