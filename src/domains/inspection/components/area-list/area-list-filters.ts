import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AreaSort, RevisitIntent } from '@/domains/inspection/types';

/**
 * The list also needs a fifth bucket beyond the three server-side
 * `RevisitIntent` values — "미정" (fe_implementation_decisions.md §3-③).
 * There is no server param for it (`revisitIntent` only accepts
 * `YES|MAYBE|NO`, api.md §L68), so selecting it sends no `revisitIntent` at
 * all and the section filters the returned page client-side instead.
 */
export type AreaRevisitFilter = RevisitIntent | 'UNDECIDED';

const REVISIT_FILTER_VALUES: AreaRevisitFilter[] = [
  'YES',
  'MAYBE',
  'NO',
  'UNDECIDED',
];
const SORT_VALUES: AreaSort[] = ['RECENT_VISIT', 'VISIT_COUNT', 'TOP_INTEREST'];
export const DEFAULT_AREA_SORT: AreaSort = 'RECENT_VISIT';

function parseRevisitFilter(raw: string | null): AreaRevisitFilter | null {
  if (!raw) return null;
  return REVISIT_FILTER_VALUES.includes(raw as AreaRevisitFilter)
    ? (raw as AreaRevisitFilter)
    : null;
}

function parseSort(raw: string | null): AreaSort {
  if (!raw) return DEFAULT_AREA_SORT;
  return SORT_VALUES.includes(raw as AreaSort)
    ? (raw as AreaSort)
    : DEFAULT_AREA_SORT;
}

/**
 * URL is the state (`?q=` `?revisit=` `?sort=`) so a refresh or a back/
 * forward navigation restores the same view. The search box keeps its own
 * local echo of `q` so typing feels immediate; committing it to the URL is
 * debounced so we don't fire a request — or push a history entry — per
 * keystroke.
 */
export function useAreaListFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const revisit = parseRevisitFilter(searchParams.get('revisit'));
  const sort = parseSort(searchParams.get('sort'));

  const [queryInput, setQueryInput] = useState(q);

  // Keep the input in sync when the URL changes from outside typing (back/
  // forward navigation, or a "필터 해제" action that also clears `q`).
  useEffect(() => {
    setQueryInput(q);
  }, [q]);

  useEffect(() => {
    if (queryInput === q) return;

    const timer = window.setTimeout(() => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (queryInput.trim()) {
            next.set('q', queryInput);
          } else {
            next.delete('q');
          }
          return next;
        },
        { replace: true }
      );
    }, 300);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  const setRevisit = useCallback(
    (next: AreaRevisitFilter | null) => {
      setSearchParams((previous) => {
        const params = new URLSearchParams(previous);
        if (next) {
          params.set('revisit', next);
        } else {
          params.delete('revisit');
        }
        return params;
      });
    },
    [setSearchParams]
  );

  const setSort = useCallback(
    (next: AreaSort) => {
      setSearchParams((previous) => {
        const params = new URLSearchParams(previous);
        if (next === DEFAULT_AREA_SORT) {
          params.delete('sort');
        } else {
          params.set('sort', next);
        }
        return params;
      });
    },
    [setSearchParams]
  );

  const clearRevisitFilter = useCallback(() => {
    setRevisit(null);
  }, [setRevisit]);

  const clearQuery = useCallback(() => {
    setQueryInput('');
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);
      params.delete('q');
      return params;
    });
  }, [setSearchParams]);

  return useMemo(
    () => ({
      q,
      queryInput,
      setQueryInput,
      revisit,
      setRevisit,
      clearRevisitFilter,
      sort,
      setSort,
      clearQuery,
    }),
    [
      q,
      queryInput,
      revisit,
      setRevisit,
      clearRevisitFilter,
      sort,
      setSort,
      clearQuery,
    ]
  );
}
