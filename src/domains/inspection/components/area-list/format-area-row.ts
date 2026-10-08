import type {
  InspectionArea,
  MatchedProperty,
  PlannedVisit,
  ViewedPropertyBrief,
} from '@/domains/inspection/types';
import { formatVisitedAtDate } from '@/domains/inspection/utils/inspection-format';

// "2026-09-17T14:00" → "목" — parsed from the y/m/d components directly
// (never through `new Date(iso)`) so the browser's local zone can't shift
// the calendar date, matching the approach in utils/inspection-format.ts.
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const VISITED_AT_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function formatVisitedAtWeekday(visitedAt: string): string {
  const match = VISITED_AT_DATE_PATTERN.exec(visitedAt);
  if (!match) return '';

  const [, year, month, day] = match;
  const utcDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );
  return WEEKDAY_LABELS[utcDate.getUTCDay()];
}

/**
 * "예정 10.12" — 예정일이 오늘이거나 이후. "미완료 10.05" — 예정일이 지났는데
 * 아직 완료하지 않은 계획. 날짜만 로컬 시간 기준으로 비교한다(`visitedAt`은
 * 시간대 없는 로컬 문자열이라 `new Date(iso)`를 거치지 않는다).
 */
export function formatPlannedVisit(
  plannedVisit: PlannedVisit,
  today: Date
): string {
  const match = VISITED_AT_DATE_PATTERN.exec(plannedVisit.visitedAt);
  if (!match) return '';

  const [, year, month, day] = match;
  const plannedKey = Number(year) * 10000 + Number(month) * 100 + Number(day);
  const todayKey =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  return `${plannedKey >= todayKey ? '예정' : '미완료'} ${month}.${day}`;
}

/** 지역 행의 계획 표시. 계획이 2건 이상이면 "예정 10.12 외 1건". */
export function formatPlannedVisitMetaline(
  area: InspectionArea,
  today: Date
): string | null {
  if (!area.plannedVisit) return null;

  const label = formatPlannedVisit(area.plannedVisit, today);
  if (!label) return null;

  const extra = area.incompleteSummary.plannedVisitCount - 1;
  return extra > 0 ? `${label} 외 ${extra}건` : label;
}

/**
 * The one-line meta reason shown under a `DRAFT` area's latest-visit line
 * (screen_design.md §5.1 "작성 중 지역": "메타에 `필수 문답 3개 미작성`").
 * Falls back down the incompleteness signals `InspectionArea.incompleteSummary`
 * exposes since a draft can be blocked by unanswered questions or by an
 * unfinished property with no unanswered-required-question count yet.
 */
export function formatDraftReason(area: InspectionArea): string {
  const { unansweredRequiredCount, draftPropertyCount } =
    area.incompleteSummary;

  if (unansweredRequiredCount > 0) {
    return `필수 문답 ${unansweredRequiredCount}개 미작성`;
  }
  if (draftPropertyCount > 0) {
    return `매물 ${draftPropertyCount}건 작성 중`;
  }
  return '작성 중인 항목이 있습니다';
}

export type AreaTopPropertyView = {
  complexName: string;
  name: string | null;
  interestLevel: number | null;
};

/**
 * fe_implementation_decisions.md §3-⑤: when `keyword` hits a property, that
 * area row's `matchedProperty` takes the "최고 관심 매물" slot instead of
 * `topProperty`. `null` falls through to `topProperty`.
 */
export function pickTopPropertyView(
  area: InspectionArea
): AreaTopPropertyView | null {
  const source: MatchedProperty | ViewedPropertyBrief | null =
    area.matchedProperty ?? area.topProperty;

  if (!source) return null;

  return {
    complexName: source.complexName,
    name: source.name,
    interestLevel: source.interestLevel,
  };
}

export function formatFirstVisitedAt(area: InspectionArea): string | null {
  return area.firstVisitedAt ? formatVisitedAtDate(area.firstVisitedAt) : null;
}
