import { useCallback, useEffect, useRef } from 'react';

/** Every inspection autosave waits this long after the last input. */
export const AUTOSAVE_DELAY_MS = 2000;

type UseAutosaveOptions<T> = {
  /** `null` while the form is not ready (e.g. still loading). */
  snapshot: T | null;
  onSave: (snapshot: T) => void | Promise<void>;
  delayMs?: number;
};

/**
 * Debounced autosave shared by the inspection edit screens.
 *
 * - A save is scheduled only when the JSON of `snapshot` differs from the
 *   last one seen. Call `markClean` with the loaded values when hydrating
 *   from the server so opening a screen does not write (there is no
 *   optimistic locking, fe_implementation_decisions.md §3-⑥, so a no-op
 *   PUT can overwrite a concurrent edit).
 * - A save still pending when the screen unmounts is sent right away rather
 *   than dropped, so leaving inside the delay window keeps the edit.
 */
export function useAutosave<T>({
  snapshot,
  onSave,
  delayMs = AUTOSAVE_DELAY_MS,
}: UseAutosaveOptions<T>) {
  const lastKeyRef = useRef<string | null>(null);
  const pendingRef = useRef<T | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const key = snapshot === null ? null : JSON.stringify(snapshot);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (key === null || snapshot === null || key === lastKeyRef.current) {
      return;
    }

    lastKeyRef.current = key;
    pendingRef.current = snapshot;
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending !== null) {
        void onSaveRef.current(pending);
      }
    }, delayMs);
  }, [key, delayMs, clearTimer]);

  useEffect(
    () => () => {
      clearTimer();
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending !== null) {
        void onSaveRef.current(pending);
      }
    },
    [clearTimer]
  );

  /**
   * Records `value` as already saved: it will not trigger a save, and any
   * save scheduled for an earlier (pre-hydration) snapshot is dropped.
   */
  const markClean = useCallback(
    (value: T) => {
      lastKeyRef.current = JSON.stringify(value);
      clearTimer();
      pendingRef.current = null;
    },
    [clearTimer]
  );

  /** Drops the pending save — for callers about to save explicitly. */
  const cancel = useCallback(() => {
    clearTimer();
    pendingRef.current = null;
  }, [clearTimer]);

  /** Sends the pending save now, if there is one. */
  const flush = useCallback(async () => {
    clearTimer();
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending !== null) {
      await onSaveRef.current(pending);
    }
  }, [clearTimer]);

  return { markClean, cancel, flush };
}
