import type {
  AreaViewedPropertyDto,
  InspectionAreaListResponseDto,
  InspectionAreaRdoDto,
  InspectionQuestionDto,
  InspectionQuestionVersionDto,
  InspectionTagDto,
  InspectionVisitDetailDto,
  InspectionVisitListItemDto,
  InspectionVisitListResponseDto,
  ViewedPropertyDetailDto,
} from '@/domains/inspection/api/inspection-schemas';
import type {
  AreaViewedProperty,
  FileBoxItem,
  IncompleteSummary,
  InspectionArea,
  InspectionAreaListResult,
  InspectionQuestion,
  InspectionQuestionVersion,
  InspectionTag,
  InspectionVisitDetail,
  InspectionVisitListItem,
  InspectionVisitListResult,
  InspectionVisitSummary,
  MatchedProperty,
  PropertyAnswer,
  PropertyAnswerInput,
  PropertyAnswerPayload,
  RevisitIntentCounts,
  ViewedPropertyBrief,
  ViewedPropertyDetail,
} from '@/domains/inspection/types';

// ── §3-① visit id normalization ──────────────────────────────────────────────
//
// The server names the same round-of-visit id `visitId` in some responses
// (area detail's `visits[]`, area list's `latestVisit`) and
// `inspectionVisitId` in others (visit list/detail, property detail). Every
// mapper in this file that touches one of those DTOs renames it to `visitId`
// on the way into the screen model — components must never see the other
// name. See docs/field_research/fe_implementation_decisions.md §3-①.

function mapFileBoxItem(dto: {
  id: string;
  fileAssetId: string;
  targetType: string;
  targetId: string | null;
  role: FileBoxItem['role'];
  caption: string | null;
  sortOrder: number;
  file?: FileBoxItem['file'];
}): FileBoxItem {
  return {
    id: dto.id,
    fileAssetId: dto.fileAssetId,
    targetType: dto.targetType,
    targetId: dto.targetId,
    role: dto.role,
    caption: dto.caption,
    sortOrder: dto.sortOrder,
    file: dto.file,
  };
}

function mapIncompleteSummary(dto: {
  unansweredRequiredCount: number;
  unansweredRequiredQuestions: {
    questionId: string;
    question: string;
    sortOrder: number;
  }[];
  missingFields: string[];
  draftPropertyCount: number;
  visitMissingFields: string[];
  draftVisitCount: number;
}): IncompleteSummary {
  return {
    unansweredRequiredCount: dto.unansweredRequiredCount,
    unansweredRequiredQuestions: dto.unansweredRequiredQuestions,
    missingFields: dto.missingFields,
    draftPropertyCount: dto.draftPropertyCount,
    visitMissingFields: dto.visitMissingFields,
    draftVisitCount: dto.draftVisitCount,
  };
}

function mapViewedPropertyBrief(dto: {
  propertyId: string;
  complexName: string;
  name: string;
  interestLevel: number | null;
}): ViewedPropertyBrief {
  return {
    propertyId: dto.propertyId,
    complexName: dto.complexName,
    name: dto.name,
    interestLevel: dto.interestLevel,
  };
}

function mapMatchedProperty(dto: {
  propertyId: string;
  visitId: string;
  complexName: string;
  name: string;
  interestLevel: number | null;
}): MatchedProperty {
  return {
    propertyId: dto.propertyId,
    visitId: dto.visitId,
    complexName: dto.complexName,
    name: dto.name,
    interestLevel: dto.interestLevel,
  };
}

/** Maps `latestVisit` (area row) and `visits[]` (area detail) — both already use `visitId` on the wire. */
export function mapInspectionVisitSummaryDto(dto: {
  visitId: string;
  visitedAt: string;
  oneLineReview: string | null;
  revisitIntent: InspectionVisitSummary['revisitIntent'];
  status: InspectionVisitSummary['status'];
  tags: string[];
  propertyCount: number | null;
  incompleteSummary: Parameters<typeof mapIncompleteSummary>[0] | null;
  cover: Parameters<typeof mapFileBoxItem>[0] | null;
}): InspectionVisitSummary {
  return {
    visitId: dto.visitId,
    visitedAt: dto.visitedAt,
    oneLineReview: dto.oneLineReview,
    revisitIntent: dto.revisitIntent,
    status: dto.status,
    tags: dto.tags,
    propertyCount: dto.propertyCount,
    incompleteSummary: dto.incompleteSummary
      ? mapIncompleteSummary(dto.incompleteSummary)
      : null,
    cover: dto.cover ? mapFileBoxItem(dto.cover) : null,
  };
}

export function mapInspectionAreaDto(
  dto: InspectionAreaRdoDto
): InspectionArea {
  return {
    areaId: dto.areaId,
    name: dto.name,
    description: dto.description,
    visitCount: dto.visitCount,
    firstVisitedAt: dto.firstVisitedAt,
    lastVisitedAt: dto.lastVisitedAt,
    totalPropertyCount: dto.totalPropertyCount,
    latestVisit: dto.latestVisit
      ? mapInspectionVisitSummaryDto(dto.latestVisit)
      : null,
    topProperty: dto.topProperty
      ? mapViewedPropertyBrief(dto.topProperty)
      : null,
    incompleteSummary: mapIncompleteSummary(dto.incompleteSummary),
    thumbnails: dto.thumbnails.map(mapFileBoxItem),
    totalImageCount: dto.totalImageCount,
    matchedProperty: dto.matchedProperty
      ? mapMatchedProperty(dto.matchedProperty)
      : null,
  };
}

/**
 * §3-④: `revisitIntentCounts.total` counts every area, but `YES`/`MAYBE`/`NO`
 * only count areas whose latest visit has that value filled in. The gap is
 * areas with zero visits, or whose latest visit is a `DRAFT` that hasn't set
 * a revisit intent yet — surfaced here as `UNDECIDED` so a "미정 N" filter
 * chip can be built without re-deriving the arithmetic at each call site.
 */
export function computeRevisitIntentCounts(dto: {
  total: number;
  YES: number;
  MAYBE: number;
  NO: number;
}): RevisitIntentCounts {
  return {
    total: dto.total,
    YES: dto.YES,
    MAYBE: dto.MAYBE,
    NO: dto.NO,
    UNDECIDED: dto.total - (dto.YES + dto.MAYBE + dto.NO),
  };
}

export function mapInspectionAreaListResponse(
  dto: InspectionAreaListResponseDto
): InspectionAreaListResult {
  return {
    items: dto.items.map(mapInspectionAreaDto),
    totalCount: dto.totalCount,
    hasNext: dto.hasNext,
    revisitIntentCounts: computeRevisitIntentCounts(dto.revisitIntentCounts),
    totals: dto.totals,
  };
}

export function mapAreaViewedPropertyDto(
  dto: AreaViewedPropertyDto
): AreaViewedProperty {
  return {
    propertyId: dto.propertyId,
    visitId: dto.visitId,
    visitedAt: dto.visitedAt,
    complexName: dto.complexName,
    name: dto.name,
    interestLevel: dto.interestLevel,
    status: dto.status,
  };
}

export function mapViewedPropertyDetailDto(
  dto: ViewedPropertyDetailDto
): ViewedPropertyDetail {
  return {
    propertyId: dto.propertyId,
    // §3-①: wire field is `inspectionVisitId` here — normalized to `visitId`.
    visitId: dto.inspectionVisitId,
    areaId: dto.areaId,
    areaName: dto.areaName,
    visitedAt: dto.visitedAt,
    complexName: dto.complexName,
    name: dto.name,
    memo: dto.memo,
    oneLineReview: dto.oneLineReview,
    pros: dto.pros,
    cons: dto.cons,
    interestLevel: dto.interestLevel,
    status: dto.status,
    sortOrder: dto.sortOrder,
    tags: dto.tags,
    cover: dto.cover ? mapFileBoxItem(dto.cover) : null,
    photos: dto.photos.map(mapFileBoxItem),
    answers: dto.answers.map(mapPropertyAnswerDto),
    incompleteSummary: mapIncompleteSummary(dto.incompleteSummary),
    prevProperty: dto.prevProperty
      ? mapViewedPropertyBrief(dto.prevProperty)
      : null,
    nextProperty: dto.nextProperty
      ? mapViewedPropertyBrief(dto.nextProperty)
      : null,
  };
}

function mapPropertyAnswerDto(
  dto: ViewedPropertyDetailDto['answers'][number]
): PropertyAnswer {
  return {
    questionId: dto.questionId,
    questionVersionNo: dto.questionVersionNo,
    question: dto.question,
    description: dto.description,
    answerType: dto.answerType,
    required: dto.required,
    sortOrder: dto.sortOrder,
    unit: dto.unit,
    answered: dto.answered,
    choiceOptions: dto.choiceOptions,
    textValue: dto.textValue,
    booleanValue: dto.booleanValue,
    numberValue: dto.numberValue,
    ratingValue: dto.ratingValue,
    selectedCodes: dto.selectedCodes,
    isCurrentVersion: dto.isCurrentVersion,
    questionEnabled: dto.questionEnabled,
  };
}

export function mapInspectionVisitDetailDto(
  dto: InspectionVisitDetailDto
): InspectionVisitDetail {
  return {
    // §3-①: wire field is `inspectionVisitId` here — normalized to `visitId`.
    visitId: dto.inspectionVisitId,
    area: dto.area,
    visitedAt: dto.visitedAt,
    memo: dto.memo,
    revisitIntent: dto.revisitIntent,
    oneLineReview: dto.oneLineReview,
    pros: dto.pros,
    cons: dto.cons,
    status: dto.status,
    tags: dto.tags,
    properties: dto.properties.map(mapViewedPropertyDetailDto),
    cover: dto.cover ? mapFileBoxItem(dto.cover) : null,
    photos: dto.photos.map(mapFileBoxItem),
    incompleteSummary: mapIncompleteSummary(dto.incompleteSummary),
  };
}

export function mapInspectionVisitListItemDto(
  dto: InspectionVisitListItemDto
): InspectionVisitListItem {
  return {
    // §3-①: wire field is `inspectionVisitId` here — normalized to `visitId`.
    visitId: dto.inspectionVisitId,
    area: dto.area,
    visitedAt: dto.visitedAt,
    oneLineReview: dto.oneLineReview,
    revisitIntent: dto.revisitIntent,
    status: dto.status,
    propertyCount: dto.propertyCount,
    topInterestProperty: dto.topInterestProperty
      ? mapViewedPropertyBrief(dto.topInterestProperty)
      : null,
    tags: dto.tags,
    cover: dto.cover ? mapFileBoxItem(dto.cover) : null,
    incompleteSummary: mapIncompleteSummary(dto.incompleteSummary),
  };
}

export function mapInspectionVisitListResponse(
  dto: InspectionVisitListResponseDto
): InspectionVisitListResult {
  return {
    items: dto.items.map(mapInspectionVisitListItemDto),
    totalCount: dto.totalCount,
    hasNext: dto.hasNext,
  };
}

export function mapInspectionTagDto(dto: InspectionTagDto): InspectionTag {
  return {
    tagId: dto.tagId,
    name: dto.name,
    usageCount: dto.usageCount,
  };
}

export function mapInspectionQuestionDto(
  dto: InspectionQuestionDto
): InspectionQuestion {
  return {
    questionId: dto.questionId,
    answerType: dto.answerType,
    required: dto.required,
    sortOrder: dto.sortOrder,
    enabled: dto.enabled,
    currentVersionNo: dto.currentVersionNo,
    content: dto.content,
    description: dto.description,
    choices: dto.choices,
    unit: dto.unit,
    answerCount: dto.answerCount,
  };
}

export function mapInspectionQuestionVersionDto(
  dto: InspectionQuestionVersionDto
): InspectionQuestionVersion {
  return {
    questionId: dto.questionId,
    versionNo: dto.versionNo,
    content: dto.content,
    description: dto.description,
    choices: dto.choices,
    unit: dto.unit,
    answerCount: dto.answerCount,
    current: dto.current,
  };
}

// ── §3-⑨ / §9 answer payload builder ─────────────────────────────────────────

/**
 * Builds the one value field the server accepts for `input.answerType`.
 * Sending the wrong field (or more than one) is a `400`; sending `value:
 * null` clears the answer. See fe_implementation_decisions.md §3-⑦ and
 * api.md §4 "문답 저장".
 */
export function buildPropertyAnswerPayload(
  questionId: string,
  input: PropertyAnswerInput
): PropertyAnswerPayload {
  switch (input.answerType) {
    case 'TEXT':
    case 'LONG_TEXT':
      return { questionId, textValue: input.value };
    case 'BOOLEAN':
      return { questionId, booleanValue: input.value };
    case 'NUMBER':
      return { questionId, numberValue: input.value };
    case 'RATING':
      return { questionId, ratingValue: input.value };
    case 'SINGLE_SELECT':
    case 'MULTI_SELECT':
      return { questionId, selectedCodes: input.value };
    default: {
      const exhaustive: never = input;
      throw new Error(`Unhandled answer type: ${JSON.stringify(exhaustive)}`);
    }
  }
}
