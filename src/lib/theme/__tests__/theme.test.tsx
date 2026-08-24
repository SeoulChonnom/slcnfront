import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeChoice } from '@/components/ui/ThemeChoice';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { THEME_STORAGE_KEY } from '@/lib/theme/theme';

type MediaListener = () => void;

/**
 * jsdom has no matchMedia; src/test/setup.ts installs a light-only stub. These
 * tests need to drive the OS preference, so they install their own and put the
 * original back afterwards.
 */
function stubSystemDark(initiallyDark: boolean) {
  const listeners = new Set<MediaListener>();
  let matches = initiallyDark;

  window.matchMedia = ((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, listener: MediaListener) => {
      listeners.add(listener);
    },
    removeEventListener: (_: string, listener: MediaListener) => {
      listeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  return {
    // The listener drives React state, so the flush has to be inside act()
    // or the assertion reads the value from before the OS change.
    flip(nextDark: boolean) {
      act(() => {
        matches = nextDark;
        for (const listener of listeners) {
          listener();
        }
      });
    },
  };
}

function renderChoice() {
  return {
    user: userEvent.setup(),
    ...render(
      <ThemeProvider>
        <ThemeChoice />
      </ThemeProvider>
    ),
  };
}

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('theme', () => {
  it('follows the operating system while the preference is "system"', () => {
    const media = stubSystemDark(true);

    renderChoice();
    expect(document.documentElement.dataset.theme).toBe('dark');

    media.flip(false);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('stops following the system once a theme is chosen, and resumes on "시스템"', async () => {
    const media = stubSystemDark(false);
    const { user } = renderChoice();

    await user.click(screen.getByRole('radio', { name: '어둡게' }));
    expect(document.documentElement.dataset.theme).toBe('dark');

    // The whole point of the explicit choice: the OS no longer overrides it.
    media.flip(true);
    media.flip(false);
    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(screen.getByRole('radio', { name: '시스템' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    media.flip(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('persists the choice under the key the pre-paint script reads', async () => {
    stubSystemDark(false);
    const { user } = renderChoice();

    await user.click(screen.getByRole('radio', { name: '어둡게' }));

    // index.html reads this exact key before first paint to avoid a flash;
    // if the two ever disagree, dark mode flashes light on every load.
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('restores a stored preference over the system setting', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    stubSystemDark(true);

    renderChoice();

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: '밝게' }).checked
    ).toBe(true);
  });

  it('falls back to "system" when storage holds something unusable', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    stubSystemDark(true);

    renderChoice();

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: '시스템' }).checked
    ).toBe(true);
  });
});
