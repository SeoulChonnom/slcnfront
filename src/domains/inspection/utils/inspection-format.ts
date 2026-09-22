import type { RevisitIntent } from '@/domains/inspection/types';

// ── Visited-at formatting ─────────────────────────────────────────────────────
//
// `visitedAt` is an ISO local date-time with no timezone/offset, e.g.
// "2026-09-17T14:00" or "2026-09-17T14:00:00" — never a `Date`-parseable
// value with zone info, so this parses the string directly instead of going
// through `new Date(...)` (which would apply the browser's local zone).

const VISITED_AT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/** "2026-09-17T14:00" → "2026.09.17" */
export function formatVisitedAtDate(visitedAt: string): string {
  const match = VISITED_AT_PATTERN.exec(visitedAt);

  if (!match) {
    return visitedAt;
  }

  const [, year, month, day] = match;
  return `${year}.${month}.${day}`;
}

/** "2026-09-17T14:00" → "14:00" */
export function formatVisitedAtTime(visitedAt: string): string {
  const match = VISITED_AT_PATTERN.exec(visitedAt);

  if (!match) {
    return '';
  }

  const [, , , , hour, minute] = match;
  return `${hour}:${minute}`;
}

/** "2026-09-17T14:00" → "2026.09.17 14:00" */
export function formatVisitedAt(visitedAt: string): string {
  const date = formatVisitedAtDate(visitedAt);
  const time = formatVisitedAtTime(visitedAt);

  return time ? `${date} ${time}` : date;
}

// ── Revisit intent ────────────────────────────────────────────────────────────
//
// Wording and color mapping fixed by screen_design.md §4.1 — `NO` must never
// use error red; the meaning is carried by icon + label together, never by
// color alone.

export type RevisitIntentMeta = {
  label: string;
  /** Decorative glyph — always paired with `label`, never shown alone without an `aria-hidden` + sr-only label fallback. */
  icon: string;
  colorVar: string;
};

export const REVISIT_INTENT_META: Record<RevisitIntent, RevisitIntentMeta> = {
  YES: {
    label: '다시 임장하고 싶음',
    icon: '✓',
    colorVar: 'var(--color-success)',
  },
  MAYBE: { label: '조금 더 고민', icon: '!', colorVar: 'var(--color-warning)' },
  NO: {
    label: '재방문하지 않을 예정',
    icon: '⊘',
    colorVar: 'var(--color-body-muted)',
  },
};

export const REVISIT_INTENT_UNDECIDED_LABEL = '미정';

// ── Interest level ────────────────────────────────────────────────────────────

export const MAX_INTEREST_LEVEL = 5;

/** Screen-reader text for a filled interest-level rating (screen_design.md §4.2). */
export function formatInterestAriaLabel(level: number): string {
  return `관심도 ${MAX_INTEREST_LEVEL}점 만점에 ${level}점`;
}

export const INTEREST_LEVEL_EMPTY_LABEL = '관심도 미입력';
