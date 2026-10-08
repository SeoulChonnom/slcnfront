import { useCallback, useEffect, useRef, useState } from 'react';

/** Matches the 900ms fade in inspection-register.css. */
const DRAFTED_HIGHLIGHT_MS = 900;

/**
 * Tracks which fields an AI draft just replaced so the screen can flag them
 * (`data-drafted`) for the one-off fade. Flags clear themselves.
 */
export function useDraftedFields() {
  const [drafted, setDrafted] = useState<ReadonlySet<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markDrafted = useCallback((fields: string[]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setDrafted(new Set(fields));
    timerRef.current = setTimeout(() => {
      setDrafted(new Set());
      timerRef.current = null;
    }, DRAFTED_HIGHLIGHT_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  return { drafted, markDrafted };
}
