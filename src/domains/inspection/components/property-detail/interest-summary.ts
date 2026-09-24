/**
 * Descriptive labels for the 1–5 interest scale, used only on this screen's
 * header (`5 / 5 · 매우 관심 있음` — screen_design.md §5.3). The shared
 * `InterestStars` display component intentionally stops at the bare number
 * (screen_design.md §4.2), so this mapping lives here rather than in the
 * foundation layer's `utils/inspection-format.ts`.
 */
const INTEREST_LEVEL_LABELS: Record<number, string> = {
  1: '관심 없음',
  2: '별로',
  3: '보통',
  4: '관심 있음',
  5: '매우 관심 있음',
};

/** "5 / 5 · 매우 관심 있음" — `null` when there is no level to summarize. */
export function formatInterestSummary(
  level: number | null,
  max = 5
): string | null {
  if (level === null) {
    return null;
  }

  const label = INTEREST_LEVEL_LABELS[level] ?? '';
  return label ? `${level} / ${max} · ${label}` : `${level} / ${max}`;
}
