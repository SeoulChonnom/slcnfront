// ── Shared enums ──────────────────────────────────────────────────────────────

export type RevisitIntent = 'YES' | 'MAYBE' | 'NO';
export type InspectionStatus = 'DRAFT' | 'COMPLETED';
export type AnswerType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'BOOLEAN'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'NUMBER'
  | 'RATING';
export type TagScope = 'VISIT' | 'PROPERTY';
export type ComplexNameScope = 'VISIT' | 'AREA';
export type AreaSort = 'RECENT_VISIT' | 'VISIT_COUNT' | 'TOP_INTEREST';
export type InspectionFileRole = 'COVER' | 'GALLERY';

/** Mirrors `FileAssetRdo` for `type=inspection` uploads. */
export type FileAsset = {
  fileId: string;
  type: string;
  originalFilename: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
};

// ── View-model building blocks ───────────────────────────────────────────────

export type FileBoxItem = {
  id: string;
  fileAssetId: string;
  targetType: string;
  targetId: string | null;
  role: InspectionFileRole | 'LOGO' | 'FIRST_MAP' | 'SECOND_MAP';
  caption: string | null;
  sortOrder: number;
  file?: {
    fileId: string;
    type: string;
    filename: string;
    path: string;
  };
};

export type QuestionChoice = {
  code: string;
  label: string;
  sortOrder: number;
};

export type UnansweredQuestion = {
  questionId: string;
  question: string;
  sortOrder: number;
};

export type IncompleteSummary = {
  unansweredRequiredCount: number;
  unansweredRequiredQuestions: UnansweredQuestion[];
  missingFields: string[];
  draftPropertyCount: number;
  visitMissingFields: string[];
  draftVisitCount: number;
};

export type ViewedPropertyBrief = {
  propertyId: string;
  complexName: string;
  name: string;
  interestLevel: number | null;
};

/** `matchedProperty` on an area row — only populated when `keyword` hits a property. */
export type MatchedProperty = {
  propertyId: string;
  visitId: string;
  complexName: string;
  name: string;
  interestLevel: number | null;
};

/** A row of `GET /inspection-areas/{areaId}/properties` — cross-visit linking list. */
export type AreaViewedProperty = {
  propertyId: string;
  visitId: string;
  visitedAt: string;
  complexName: string;
  name: string;
  interestLevel: number | null;
  status: InspectionStatus;
};

/**
 * Unifies `visits[]` (area detail) and `latestVisit` (area row) — the wire
 * field is `visitId` in both places, so this is a direct passthrough, but it
 * shares a name with {@link InspectionVisitListItem} on purpose: both
 * ultimately describe "one visit round" and callers should not need to know
 * which endpoint produced the value.
 */
export type InspectionVisitSummary = {
  visitId: string;
  visitedAt: string;
  oneLineReview: string | null;
  revisitIntent: RevisitIntent | null;
  status: InspectionStatus;
  tags: string[];
  /** `null` when this summary came from an area row's `latestVisit` (area detail's `visits[]` always fills it). */
  propertyCount: number | null;
  /** `null` when this summary came from an area row's `latestVisit`. */
  incompleteSummary: IncompleteSummary | null;
  cover: FileBoxItem | null;
};

export type RevisitIntentCounts = {
  total: number;
  YES: number;
  MAYBE: number;
  NO: number;
  /** Computed by the mapper: `total - (YES + MAYBE + NO)` (see fe_implementation_decisions.md §3-④). */
  UNDECIDED: number;
};

export type InspectionAreaTotals = {
  areaCount: number;
  visitCount: number;
  propertyCount: number;
};

export type InspectionArea = {
  areaId: string;
  name: string;
  description: string | null;
  visitCount: number;
  firstVisitedAt: string | null;
  lastVisitedAt: string | null;
  totalPropertyCount: number;
  latestVisit: InspectionVisitSummary | null;
  topProperty: ViewedPropertyBrief | null;
  incompleteSummary: IncompleteSummary;
  thumbnails: FileBoxItem[];
  totalImageCount: number;
  matchedProperty: MatchedProperty | null;
};

export type InspectionAreaListResult = {
  items: InspectionArea[];
  totalCount: number;
  hasNext: boolean;
  revisitIntentCounts: RevisitIntentCounts;
  totals: InspectionAreaTotals;
};

export type InspectionAreaDetail = {
  area: InspectionArea;
  visits: InspectionVisitSummary[];
  hasMoreVisits: boolean;
  /** Use this as `size` when paging further visits — never hardcode it. */
  visitPageSize: number;
  selectedVisit: InspectionVisitDetail;
};

export type PropertyAnswer = {
  questionId: string;
  questionVersionNo: number;
  question: string;
  description: string | null;
  answerType: AnswerType;
  required: boolean;
  sortOrder: number;
  unit: string | null;
  answered: boolean;
  choiceOptions: QuestionChoice[];
  textValue: string | null;
  booleanValue: boolean | null;
  numberValue: number | null;
  ratingValue: number | null;
  selectedCodes: string[];
  /** Badge-only — never branches rendering on this (see fe_implementation_decisions.md §3-⑨). */
  isCurrentVersion: boolean;
  /** Badge-only — never branches rendering on this. */
  questionEnabled: boolean;
};

export type InspectionAreaBrief = {
  areaId: string;
  name: string;
};

export type ViewedPropertyDetail = {
  propertyId: string;
  /** Normalized from the wire's `inspectionVisitId` — see fe_implementation_decisions.md §3-①. */
  visitId: string;
  areaId: string;
  areaName: string;
  visitedAt: string;
  complexName: string;
  name: string;
  memo: string | null;
  oneLineReview: string | null;
  pros: string | null;
  cons: string | null;
  interestLevel: number | null;
  status: InspectionStatus;
  sortOrder: number;
  tags: string[];
  cover: FileBoxItem | null;
  photos: FileBoxItem[];
  answers: PropertyAnswer[];
  incompleteSummary: IncompleteSummary;
  prevProperty: ViewedPropertyBrief | null;
  nextProperty: ViewedPropertyBrief | null;
};

export type InspectionVisitDetail = {
  /** Normalized from the wire's `inspectionVisitId` — see fe_implementation_decisions.md §3-①. */
  visitId: string;
  area: InspectionAreaBrief;
  visitedAt: string;
  memo: string | null;
  revisitIntent: RevisitIntent | null;
  oneLineReview: string | null;
  pros: string | null;
  cons: string | null;
  status: InspectionStatus;
  tags: string[];
  properties: ViewedPropertyDetail[];
  cover: FileBoxItem | null;
  photos: FileBoxItem[];
  incompleteSummary: IncompleteSummary;
};

export type InspectionVisitListItem = {
  /** Normalized from the wire's `inspectionVisitId` — see fe_implementation_decisions.md §3-①. */
  visitId: string;
  area: InspectionAreaBrief;
  visitedAt: string;
  oneLineReview: string | null;
  revisitIntent: RevisitIntent | null;
  status: InspectionStatus;
  propertyCount: number;
  topInterestProperty: ViewedPropertyBrief | null;
  tags: string[];
  cover: FileBoxItem | null;
  incompleteSummary: IncompleteSummary;
};

export type InspectionVisitListResult = {
  items: InspectionVisitListItem[];
  totalCount: number;
  hasNext: boolean;
};

export type InspectionTag = {
  tagId: string;
  name: string;
  usageCount: number;
};

export type InspectionQuestion = {
  questionId: string;
  answerType: AnswerType;
  required: boolean;
  sortOrder: number;
  enabled: boolean;
  currentVersionNo: number;
  content: string;
  description: string | null;
  choices: QuestionChoice[];
  unit: string | null;
  /** `null` unless the list call passed `withAnswerCount=true`. */
  answerCount: number | null;
};

export type InspectionQuestionVersion = {
  questionId: string;
  versionNo: number;
  content: string;
  description: string | null;
  choices: QuestionChoice[];
  unit: string | null;
  answerCount: number | null;
  current: boolean;
};

// ── Request (Cdo/Udo) types ──────────────────────────────────────────────────

export type InspectionFileBoxItemCdo = {
  fileAssetId: string;
  role: InspectionFileRole;
  caption?: string;
  sortOrder?: number;
};

export type InspectionFileBoxItemUdo = {
  /** Keeps this existing item's `sortOrder`; omit for a brand-new file. */
  id?: string;
  fileAssetId: string;
  role: InspectionFileRole;
  caption?: string;
  sortOrder?: number;
};

export type InspectionAreaCdo = {
  name: string;
  description?: string;
};

export type InspectionAreaUdo = {
  name: string;
  description?: string;
};

type InspectionVisitFields = {
  visitedAt: string;
  memo?: string;
  revisitIntent?: RevisitIntent;
  oneLineReview?: string;
  pros?: string;
  cons?: string;
  /** Omit to keep existing tags, `[]` to clear all. */
  tags?: string[];
  /** Omit to keep existing files, send the full replacement group otherwise. */
  files?: InspectionFileBoxItemCdo[];
};

export type InspectionVisitCdo = InspectionVisitFields & {
  areaId?: string;
  area?: InspectionAreaCdo;
};

export type InspectionVisitUdo = InspectionVisitFields & {
  /** PUT is a full replace — omitted files/tags below still follow the "omit = keep" rule server-side. */
  files?: InspectionFileBoxItemUdo[];
};

type ViewedPropertyFields = {
  complexName: string;
  name: string;
  memo?: string;
  oneLineReview?: string;
  pros?: string;
  cons?: string;
  interestLevel?: number;
  tags?: string[];
};

export type ViewedPropertyCdo = ViewedPropertyFields & {
  files?: InspectionFileBoxItemCdo[];
};

export type ViewedPropertyUdo = ViewedPropertyFields & {
  files?: InspectionFileBoxItemUdo[];
};

/**
 * One answer field, typed so only the field matching `answerType` can be
 * set — mixing fields is a `400` server-side (fe_implementation_decisions.md
 * §3-⑦/§9). A `value` of `null` clears the answer.
 */
export type PropertyAnswerInput =
  | { answerType: 'TEXT' | 'LONG_TEXT'; value: string | null }
  | { answerType: 'BOOLEAN'; value: boolean | null }
  | { answerType: 'NUMBER'; value: number | null }
  | { answerType: 'RATING'; value: number | null }
  | { answerType: 'SINGLE_SELECT' | 'MULTI_SELECT'; value: string[] | null };

export type PropertyAnswerPayload =
  | { questionId: string; textValue: string | null }
  | { questionId: string; booleanValue: boolean | null }
  | { questionId: string; numberValue: number | null }
  | { questionId: string; ratingValue: number | null }
  | { questionId: string; selectedCodes: string[] | null };

export type QuestionChoiceInput = {
  code: string;
  label: string;
  sortOrder: number;
};

export type InspectionQuestionCdo = {
  content: string;
  description?: string;
  answerType: AnswerType;
  required: boolean;
  sortOrder: number;
  choices?: QuestionChoiceInput[];
  unit?: string;
};

export type InspectionQuestionContentUdo = {
  content: string;
  description?: string;
  choices?: QuestionChoiceInput[];
  unit?: string;
};

export type InspectionQuestionPolicyUdo = {
  required?: boolean;
  sortOrder?: number;
};

export type OrderItem = {
  id: string;
  sortOrder: number;
};

// ── Query param types ─────────────────────────────────────────────────────────

export type InspectionAreaListParams = {
  keyword?: string;
  revisitIntent?: RevisitIntent;
  sort?: AreaSort;
  page?: number;
  size?: number;
};

export type InspectionVisitListParams = {
  areaId?: string;
  status?: InspectionStatus;
  revisitIntent?: RevisitIntent;
  tag?: string[];
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};
