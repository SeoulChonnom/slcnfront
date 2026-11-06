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

  it('treats a rejected onSave as failed and retries the same snapshot on flush', async () => {
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ snapshot }: Props) => useAutosave({ snapshot, onSave }),
      { initialProps: { snapshot: null } as Props }
    );
    act(() => result.current.markClean({ text: 'loaded' }));
    rerender({ snapshot: { text: 'edited' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    });
    expect(onSave).toHaveBeenCalledTimes(1);

    // Same snapshot, no new input: flush sends it again.
    let ok = true;
    await act(async () => {
      ok = await result.current.flush();
    });
    expect(ok).toBe(true);
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith({ text: 'edited' });

    // Now saved — nothing more to send.
    await act(async () => {
      await result.current.flush();
    });
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it('flush resolves false when the save failed, and a synchronous throw counts too', async () => {
    const onSave = vi.fn(() => {
      throw new Error('sync boom');
    });
    const { result, rerender } = renderHook(
      ({ snapshot }: Props) => useAutosave({ snapshot, onSave }),
      { initialProps: { snapshot: null } as Props }
    );
    act(() => result.current.markClean({ text: 'loaded' }));
    rerender({ snapshot: { text: 'edited' } });

    let ok = true;
    await act(async () => {
      ok = await result.current.flush();
    });
    expect(ok).toBe(false);
  });

  it('retries a failed snapshot when the screen unmounts', async () => {
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(undefined);
    const { result, rerender, unmount } = renderHook(
      ({ snapshot }: Props) => useAutosave({ snapshot, onSave }),
      { initialProps: { snapshot: null } as Props }
    );
    act(() => result.current.markClean({ text: 'loaded' }));
    rerender({ snapshot: { text: 'edited' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DELAY_MS);
    });
    expect(onSave).toHaveBeenCalledTimes(1);

    // The failure left no timer; unmount only flushes a pending timer, so a
    // change made right before leaving is what triggers the second send.
    rerender({ snapshot: { text: 'edited more' } });
    unmount();
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith({ text: 'edited more' });
  });

  it('does not overlap saves: a flush during an in-flight save waits for it', async () => {
    let release: () => void = () => undefined;
    const onSave = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            release = resolve;
          })
      )
      .mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ snapshot }: Props) => useAutosave({ snapshot, onSave }),
      { initialProps: { snapshot: null } as Props }
    );
    act(() => result.current.markClean({ text: 'loaded' }));

    rerender({ snapshot: { text: 'one' } });
    let first: Promise<boolean> = Promise.resolve(true);
    act(() => {
      first = result.current.flush();
    });
    rerender({ snapshot: { text: 'two' } });
    let second: Promise<boolean> = Promise.resolve(true);
    act(() => {
      second = result.current.flush();
    });
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      release();
      await first;
      await second;
    });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith({ text: 'two' });
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
