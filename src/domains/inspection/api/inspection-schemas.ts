import { z } from 'zod';
import { parseOrThrow } from '@/lib/api/errors';

// ── Shared enums ──────────────────────────────────────────────────────────────

const revisitIntentSchema = z.enum(['YES', 'MAYBE', 'NO']);
const inspectionStatusSchema = z.enum(['DRAFT', 'COMPLETED']);
const answerTypeSchema = z.enum([
  'TEXT',
  'LONG_TEXT',
  'BOOLEAN',
  'SINGLE_SELECT',
  'MULTI_SELECT',
  'NUMBER',
  'RATING',
]);

const nullableString = z
  .string()
  .nullish()
  .transform((v) => v ?? null);

const nullableNumber = z
  .number()
  .nullish()
  .transform((v) => v ?? null);

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const fileAssetSchema = z.object({
  fileId: z.string(),
  type: z.string(),
  originalFilename: z.string().optional(),
  filename: z.string(),
  path: z.string(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
});

const fileBoxItemSchema = z.object({
  id: z.string(),
  fileAssetId: z.string(),
  targetType: z.string(),
  targetId: nullableString,
  role: z.enum(['COVER', 'GALLERY', 'LOGO', 'FIRST_MAP', 'SECOND_MAP']),
  caption: nullableString,
  sortOrder: z.number().int(),
  file: fileAssetSchema.optional(),
});

const questionChoiceSchema = z.object({
  code: z.string(),
  label: z.string(),
  sortOrder: z.number().int(),
});

const unansweredQuestionSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  sortOrder: z.number().int(),
});

/**
 * One shared shape for `incompleteSummary` at every level (area/visit/property).
 * The wire response always sends the full object — the "list responses only
 * carry counts" rule from api.md just means the array fields are empty there,
 * not that the fields are missing (verified against the real server).
 */
const incompleteSummarySchema = z.object({
  unansweredRequiredCount: z.number().int(),
  unansweredRequiredQuestions: z.array(unansweredQuestionSchema).default([]),
  missingFields: z.array(z.string()).default([]),
  draftPropertyCount: z.number().int(),
  visitMissingFields: z.array(z.string()).default([]),
  draftVisitCount: z.number().int(),
});

const viewedPropertyBriefSchema = z.object({
  propertyId: z.string(),
  complexName: z.string(),
  name: z.string(),
  interestLevel: nullableNumber,
});

const matchedPropertySchema = z.object({
  propertyId: z.string(),
  visitId: z.string(),
  complexName: z.string(),
  name: z.string(),
  interestLevel: nullableNumber,
});

const areaViewedPropertySchema = z.object({
  propertyId: z.string(),
  visitId: z.string(),
  visitedAt: z.string(),
  complexName: z.string(),
  name: z.string(),
  interestLevel: nullableNumber,
  status: inspectionStatusSchema,
});

/** Shared by area list's `latestVisit` and area detail's `visits[]` — both use `visitId`. */
const inspectionVisitSummarySchema = z.object({
  visitId: z.string(),
  visitedAt: z.string(),
  oneLineReview: nullableString,
  revisitIntent: revisitIntentSchema.nullish().transform((v) => v ?? null),
  status: inspectionStatusSchema,
  tags: z.array(z.string()).default([]),
  propertyCount: nullableNumber,
  incompleteSummary: incompleteSummarySchema
    .nullish()
    .transform((v) => v ?? null),
  cover: fileBoxItemSchema.nullish().transform((v) => v ?? null),
});

const inspectionAreaSchema = z.object({
  areaId: z.string(),
  name: z.string(),
  description: nullableString,
  visitCount: z.number().int(),
  firstVisitedAt: nullableString,
  lastVisitedAt: nullableString,
  totalPropertyCount: z.number().int(),
  latestVisit: inspectionVisitSummarySchema
    .nullish()
    .transform((v) => v ?? null),
  topProperty: viewedPropertyBriefSchema.nullish().transform((v) => v ?? null),
  incompleteSummary: incompleteSummarySchema,
  thumbnails: z.array(fileBoxItemSchema).default([]),
  totalImageCount: z.number().int(),
  matchedProperty: matchedPropertySchema.nullish().transform((v) => v ?? null),
});

const revisitIntentCountsSchema = z.object({
  total: z.number(),
  YES: z.number(),
  MAYBE: z.number(),
  NO: z.number(),
});

const inspectionAreaTotalsSchema = z.object({
  areaCount: z.number(),
  visitCount: z.number(),
  propertyCount: z.number(),
});

const inspectionAreaBriefSchema = z.object({
  areaId: z.string(),
  name: z.string(),
});

const propertyAnswerSchema = z.object({
  questionId: z.string(),
  questionVersionNo: z.number().int(),
  question: z.string(),
  description: nullableString,
  answerType: answerTypeSchema,
  required: z.boolean(),
  sortOrder: z.number().int(),
  unit: nullableString,
  answered: z.boolean(),
  choiceOptions: z.array(questionChoiceSchema).default([]),
  textValue: nullableString,
  booleanValue: z
    .boolean()
    .nullish()
    .transform((v) => v ?? null),
  numberValue: nullableNumber,
  ratingValue: nullableNumber,
  selectedCodes: z.array(z.string()).default([]),
  isCurrentVersion: z.boolean(),
  questionEnabled: z.boolean(),
});

const viewedPropertyDetailSchema = z.object({
  propertyId: z.string(),
  inspectionVisitId: z.string(),
  areaId: z.string(),
  areaName: z.string(),
  visitedAt: z.string(),
  complexName: z.string(),
  name: z.string(),
  memo: nullableString,
  oneLineReview: nullableString,
  pros: nullableString,
  cons: nullableString,
  interestLevel: nullableNumber,
  status: inspectionStatusSchema,
  sortOrder: z.number().int(),
  tags: z.array(z.string()).default([]),
  cover: fileBoxItemSchema.nullish().transform((v) => v ?? null),
  photos: z.array(fileBoxItemSchema).default([]),
  answers: z.array(propertyAnswerSchema).default([]),
  incompleteSummary: incompleteSummarySchema,
  prevProperty: viewedPropertyBriefSchema.nullish().transform((v) => v ?? null),
  nextProperty: viewedPropertyBriefSchema.nullish().transform((v) => v ?? null),
});

const inspectionVisitDetailSchema = z.object({
  inspectionVisitId: z.string(),
  area: inspectionAreaBriefSchema,
  visitedAt: z.string(),
  memo: nullableString,
  revisitIntent: revisitIntentSchema.nullish().transform((v) => v ?? null),
  oneLineReview: nullableString,
  pros: nullableString,
  cons: nullableString,
  status: inspectionStatusSchema,
  tags: z.array(z.string()).default([]),
  properties: z.array(viewedPropertyDetailSchema).default([]),
  cover: fileBoxItemSchema.nullish().transform((v) => v ?? null),
  photos: z.array(fileBoxItemSchema).default([]),
  incompleteSummary: incompleteSummarySchema,
});

const inspectionVisitListItemSchema = z.object({
  inspectionVisitId: z.string(),
  area: inspectionAreaBriefSchema,
  visitedAt: z.string(),
  oneLineReview: nullableString,
  revisitIntent: revisitIntentSchema.nullish().transform((v) => v ?? null),
  status: inspectionStatusSchema,
  propertyCount: z.number().int(),
  topInterestProperty: viewedPropertyBriefSchema
    .nullish()
    .transform((v) => v ?? null),
  tags: z.array(z.string()).default([]),
  cover: fileBoxItemSchema.nullish().transform((v) => v ?? null),
  incompleteSummary: incompleteSummarySchema,
});

const inspectionTagSchema = z.object({
  tagId: z.string(),
  name: z.string(),
  usageCount: z.number().int(),
});

const inspectionQuestionSchema = z.object({
  questionId: z.string(),
  answerType: answerTypeSchema,
  required: z.boolean(),
  sortOrder: z.number().int(),
  enabled: z.boolean(),
  currentVersionNo: z.number().int(),
  content: z.string(),
  description: nullableString,
  choices: z.array(questionChoiceSchema).default([]),
  unit: nullableString,
  answerCount: nullableNumber,
});

const inspectionQuestionVersionSchema = z.object({
  questionId: z.string(),
  versionNo: z.number().int(),
  content: z.string(),
  description: nullableString,
  choices: z.array(questionChoiceSchema).default([]),
  unit: nullableString,
  answerCount: nullableNumber,
  current: z.boolean(),
});

// ── Top-level response schemas ───────────────────────────────────────────────

export const inspectionAreaListResponseSchema = z.object({
  items: z.array(inspectionAreaSchema).default([]),
  totalCount: z.number(),
  hasNext: z.boolean(),
  revisitIntentCounts: revisitIntentCountsSchema,
  totals: inspectionAreaTotalsSchema,
});

export const inspectionAreaDetailResponseSchema = z.object({
  area: inspectionAreaSchema,
  visits: z.array(inspectionVisitSummarySchema).default([]),
  hasMoreVisits: z.boolean(),
  visitPageSize: z.number().int(),
  // Null for an area with no visits yet. That is a normal state, not an error.
  selectedVisit: inspectionVisitDetailSchema.nullable(),
});

export const areaViewedPropertyListSchema = z.array(areaViewedPropertySchema);

export const inspectionVisitListResponseSchema = z.object({
  items: z.array(inspectionVisitListItemSchema).default([]),
  totalCount: z.number(),
  hasNext: z.boolean(),
});

export const inspectionTagListSchema = z.array(inspectionTagSchema);

export const inspectionQuestionListSchema = z.array(inspectionQuestionSchema);

export const inspectionQuestionVersionListSchema = z.array(
  inspectionQuestionVersionSchema
);

export const complexNameListSchema = z.array(z.string());

export {
  inspectionAreaSchema,
  inspectionQuestionSchema,
  inspectionVisitDetailSchema,
  inspectionVisitListItemSchema,
  viewedPropertyDetailSchema,
};

// ── Inferred DTO types ────────────────────────────────────────────────────────

export type InspectionAreaRdoDto = z.infer<typeof inspectionAreaSchema>;
export type InspectionAreaListResponseDto = z.infer<
  typeof inspectionAreaListResponseSchema
>;
export type InspectionAreaDetailResponseDto = z.infer<
  typeof inspectionAreaDetailResponseSchema
>;
export type AreaViewedPropertyDto = z.infer<typeof areaViewedPropertySchema>;
export type ViewedPropertyDetailDto = z.infer<
  typeof viewedPropertyDetailSchema
>;
export type InspectionVisitDetailDto = z.infer<
  typeof inspectionVisitDetailSchema
>;
export type InspectionVisitListItemDto = z.infer<
  typeof inspectionVisitListItemSchema
>;
export type InspectionVisitListResponseDto = z.infer<
  typeof inspectionVisitListResponseSchema
>;
export type InspectionTagDto = z.infer<typeof inspectionTagSchema>;
export type InspectionQuestionDto = z.infer<typeof inspectionQuestionSchema>;
export type InspectionQuestionVersionDto = z.infer<
  typeof inspectionQuestionVersionSchema
>;

// ── Parse helpers ─────────────────────────────────────────────────────────────

export function parseInspectionAreaListResponse(
  payload: unknown
): InspectionAreaListResponseDto {
  return parseOrThrow(
    inspectionAreaListResponseSchema,
    payload,
    'Inspection area list'
  );
}

export function parseInspectionAreaResponse(
  payload: unknown,
  context: string
): InspectionAreaRdoDto {
  return parseOrThrow(
    inspectionAreaSchema,
    payload,
    `Inspection area ${context}`
  );
}

export function parseInspectionAreaDetailResponse(
  payload: unknown
): InspectionAreaDetailResponseDto {
  return parseOrThrow(
    inspectionAreaDetailResponseSchema,
    payload,
    'Inspection area detail'
  );
}

export function parseAreaViewedPropertyListResponse(
  payload: unknown
): AreaViewedPropertyDto[] {
  return parseOrThrow(
    areaViewedPropertyListSchema,
    payload,
    'Inspection area viewed-property list'
  );
}

export function parseViewedPropertyDetailResponse(
  payload: unknown,
  context: string
): ViewedPropertyDetailDto {
  return parseOrThrow(
    viewedPropertyDetailSchema,
    payload,
    `Viewed property ${context}`
  );
}

export function parseInspectionVisitListResponse(
  payload: unknown
): InspectionVisitListResponseDto {
  return parseOrThrow(
    inspectionVisitListResponseSchema,
    payload,
    'Inspection visit list'
  );
}

export function parseInspectionVisitDetailResponse(
  payload: unknown,
  context: string
): InspectionVisitDetailDto {
  return parseOrThrow(
    inspectionVisitDetailSchema,
    payload,
    `Inspection visit ${context}`
  );
}

export function parseComplexNameListResponse(payload: unknown): string[] {
  return parseOrThrow(complexNameListSchema, payload, 'Complex name list');
}

export function parseInspectionTagListResponse(
  payload: unknown
): InspectionTagDto[] {
  return parseOrThrow(inspectionTagListSchema, payload, 'Inspection tag list');
}

export function parseInspectionQuestionListResponse(
  payload: unknown
): InspectionQuestionDto[] {
  return parseOrThrow(
    inspectionQuestionListSchema,
    payload,
    'Inspection question list'
  );
}

export function parseInspectionQuestionResponse(
  payload: unknown,
  context: string
): InspectionQuestionDto {
  return parseOrThrow(
    inspectionQuestionSchema,
    payload,
    `Inspection question ${context}`
  );
}

export function parseInspectionQuestionVersionListResponse(
  payload: unknown
): InspectionQuestionVersionDto[] {
  return parseOrThrow(
    inspectionQuestionVersionListSchema,
    payload,
    'Inspection question version list'
  );
}
