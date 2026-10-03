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
 * - Any change to `snapshot` (compared as JSON) restarts the delay. When it
 *   elapses, the LATEST snapshot is saved — but only if it differs from the
 *   last one saved or marked clean. Deciding at send time, not at schedule
 *   time, keeps a stale schedule (e.g. StrictMode re-running mount effects
 *   with the pre-hydration snapshot) from re-sending unchanged data.
 * - Call `markClean` with the loaded values when hydrating from the server so
 *   opening a screen does not write. There is no optimistic locking
 *   (fe_implementation_decisions.md §3-⑥), so a no-op PUT can overwrite a
 *   concurrent edit.
 * - A save still pending when the screen unmounts is sent right away rather
 *   than dropped, so leaving inside the delay window keeps the edit.
 */
export function useAutosave<T>({
  snapshot,
  onSave,
  delayMs = AUTOSAVE_DELAY_MS,
}: UseAutosaveOptions<T>) {
  const key = snapshot === null ? null : JSON.stringify(snapshot);

  const latestRef = useRef<{ key: string | null; snapshot: T | null }>({
    key,
    snapshot,
  });
  latestRef.current = { key, snapshot };
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  /**
   * Last snapshot sent or marked clean — what the server already has. The
   * first-render snapshot (an empty form, or `null` while loading) is the
   * starting point and never needs saving.
   */
  const savedKeyRef = useRef<string | null>(key);
  /** Last snapshot a timer was started for. */
  const scheduledKeyRef = useRef<string | null>(key);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const saveLatestIfChanged = useCallback(async () => {
    clearTimer();
    const latest = latestRef.current;
    if (
      latest.key === null ||
      latest.snapshot === null ||
      latest.key === savedKeyRef.current
    ) {
      return;
    }
    savedKeyRef.current = latest.key;
    await onSaveRef.current(latest.snapshot);
  }, [clearTimer]);

  useEffect(() => {
    if (key === null || key === scheduledKeyRef.current) {
      return;
    }
    scheduledKeyRef.current = key;
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void saveLatestIfChanged();
    }, delayMs);
  }, [key, delayMs, clearTimer, saveLatestIfChanged]);

  // Only a save still waiting on its timer is flushed on unmount, and only if
  // the latest state has unsaved changes — StrictMode's simulated unmount on
  // mount therefore sends nothing.
  useEffect(
    () => () => {
      if (timerRef.current) {
        void saveLatestIfChanged();
      }
    },
    [saveLatestIfChanged]
  );

  /**
   * Records `value` as already saved: it will not trigger a save, and a
   * save scheduled for an earlier (pre-hydration) snapshot is dropped.
   */
  const markClean = useCallback(
    (value: T) => {
      const cleanKey = JSON.stringify(value);
      savedKeyRef.current = cleanKey;
      scheduledKeyRef.current = cleanKey;
      clearTimer();
    },
    [clearTimer]
  );

  /**
   * Drops the pending save — for callers about to save explicitly. The
   * current snapshot is treated as saved.
   */
  const cancel = useCallback(() => {
    clearTimer();
    savedKeyRef.current = latestRef.current.key;
  }, [clearTimer]);

  /** Sends the latest snapshot now, if it has unsaved changes. */
  const flush = useCallback(() => saveLatestIfChanged(), [saveLatestIfChanged]);

  return { markClean, cancel, flush };
}
