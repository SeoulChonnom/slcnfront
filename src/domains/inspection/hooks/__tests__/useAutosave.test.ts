import { act, renderHook } from '@testing-library/react';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTOSAVE_DELAY_MS,
  useAutosave,
} from '@/domains/inspection/hooks/useAutosave';

type Props = { snapshot: { text: string } | null };

function setup(initial: Props) {
  const onSave = vi.fn();
  const hook = renderHook(
    ({ snapshot }: Props) => useAutosave({ snapshot, onSave }),
    { initialProps: initial }
  );
  return { onSave, ...hook };
}

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits 2 seconds after the last change', () => {
    expect(AUTOSAVE_DELAY_MS).toBe(2000);
    const { onSave, rerender } = setup({ snapshot: { text: 'a' } });

    act(() => vi.advanceTimersByTime(1500));
    rerender({ snapshot: { text: 'ab' } });
    act(() => vi.advanceTimersByTime(1999));
    expect(onSave).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ text: 'ab' });
  });

  it('does nothing while the snapshot is null', () => {
    const { onSave } = setup({ snapshot: null });
    act(() => vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 2));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not save a snapshot marked clean — the hydration case', () => {
    const { onSave, rerender, result } = setup({ snapshot: null });

    act(() => result.current.markClean({ text: 'loaded' }));
    rerender({ snapshot: { text: 'loaded' } });
    act(() => vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 2));
    expect(onSave).not.toHaveBeenCalled();

    rerender({ snapshot: { text: 'edited' } });
    act(() => vi.advanceTimersByTime(AUTOSAVE_DELAY_MS));
    expect(onSave).toHaveBeenCalledWith({ text: 'edited' });
  });

  it('markClean drops a save scheduled for an earlier snapshot', () => {
    const { onSave, result } = setup({ snapshot: { text: 'empty form' } });
    act(() => result.current.markClean({ text: 'loaded' }));
    act(() => vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 2));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('sends a pending save on unmount instead of dropping it', () => {
    const { onSave, rerender, result, unmount } = setup({ snapshot: null });
    act(() => result.current.markClean({ text: 'loaded' }));
    rerender({ snapshot: { text: 'edited' } });

    unmount();
    expect(onSave).toHaveBeenCalledWith({ text: 'edited' });
  });

  it('does not save on unmount when nothing is pending', () => {
    const { onSave, rerender, result, unmount } = setup({ snapshot: null });
    act(() => result.current.markClean({ text: 'loaded' }));
    rerender({ snapshot: { text: 'loaded' } });
    unmount();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('flush sends the pending save once; cancel drops it', async () => {
    const { onSave, rerender, result } = setup({ snapshot: null });
    act(() => result.current.markClean({ text: 'loaded' }));

    rerender({ snapshot: { text: 'one' } });
    await act(() => result.current.flush());
    expect(onSave).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(AUTOSAVE_DELAY_MS));
    expect(onSave).toHaveBeenCalledTimes(1);

    rerender({ snapshot: { text: 'two' } });
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(AUTOSAVE_DELAY_MS));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('does not save hydrated data under StrictMode when the data is ready on the first render', () => {
    // Mirrors the register wizard resuming a cached `?draft=` visit: state
    // starts empty, and the hydration effect runs in the very first commit.
    const onSave = vi.fn();
    const loaded = { text: 'loaded' };
    renderHook(
      () => {
        const [text, setText] = useState('');
        const hydrated = useRef(false);
        const autosave = useAutosave({ snapshot: { text }, onSave });
        useEffect(() => {
          if (hydrated.current) return;
          hydrated.current = true;
          autosave.markClean(loaded);
          setText(loaded.text);
        }, [autosave.markClean]);
      },
      { wrapper: StrictMode }
    );

    act(() => vi.advanceTimersByTime(AUTOSAVE_DELAY_MS * 2));
    expect(onSave).not.toHaveBeenCalled();
  });
});
