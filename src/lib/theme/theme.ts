/**
 * Theme preference, resolution, and the single place that writes the theme
 * onto the document.
 *
 * The preference has three states, not two. A two-state toggle has to pick a
 * side the first time someone opens the app, and whichever it picks silently
 * overrides the reader's own operating-system setting from then on. 'system'
 * keeps that setting authoritative until the reader deliberately takes it
 * over, and lets them hand it back.
 *
 * Resolution happens in JS for the 'system' case too, so `<html>` always
 * carries a concrete `data-theme`. That is what lets the stylesheet get by
 * with a single `:root[data-theme="dark"]` block instead of keeping a
 * prefers-color-scheme query and an attribute override in sync.
 */

export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = 'light' | 'dark';

/** Shared with the pre-paint script in index.html. Keep the two in step. */
export const THEME_STORAGE_KEY = 'slcn-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference);
}

/**
 * Reading localStorage throws outright in a few real configurations (Safari
 * with cookies fully blocked, some embedded webviews), so a failure here has
 * to fall back rather than take the app down with it.
 */
export function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    return isThemePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function writeStoredPreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // A reader who cannot persist the choice still gets it for this session.
  }
}

function prefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return prefersDark() ? 'dark' : 'light';
  }

  return preference;
}

export function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;

  root.dataset.theme = resolved;

  // Mobile browsers paint their own chrome around the viewport from this
  // meta. Left alone it would keep the paper pink of the light canvas above
  // a dark app. Read back from the resolved token rather than repeating the
  // two hex values here, so the bar cannot drift from the palette.
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  );

  if (meta) {
    meta.content = getComputedStyle(root)
      .getPropertyValue('--color-canvas')
      .trim();
  }
}

/**
 * Fires whenever the OS preference flips. Subscribing only matters while the
 * preference is 'system'; the caller owns that decision.
 */
export function subscribeToSystemTheme(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);

  query.addEventListener('change', onChange);

  return () => {
    query.removeEventListener('change', onChange);
  };
}
