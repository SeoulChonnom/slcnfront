import { describe, expect, it } from 'vitest';
// Vite's `?raw` suffix imports the file's text content directly, with no
// Node fs/path APIs needed (this project's src/ has no @types/node).
import css from '../travel-register.css?raw';

// Regression test for the /impeccable audit's finding #1: two rules in
// travel-register.css used --color-primary-focus as a text colour, which
// tokens.css documents as failing WCAG contrast (2.23:1 on canvas, 2.34:1
// on white -- see tokens.css:14-22). Reading the raw CSS is deterministic
// and doesn't depend on jsdom's cascade, since this file is only imported
// from src/main.tsx and never loaded by a component test's render tree.

/** Returns the declaration block body for the first `selector { ... }` rule. */
function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));

  if (!match) {
    throw new Error(`No rule found for selector: ${selector}`);
  }

  return match[1];
}

describe('travel-register.css text-color contrast', () => {
  it('.slcn-travel-register-form__section-count uses --color-accent-muted, not --color-primary-focus', () => {
    const body = ruleBody('.slcn-travel-register-form__section-count');

    expect(body).toContain('var(--color-accent-muted)');
    expect(body).not.toContain('var(--color-primary-focus)');
  });

  it('.slcn-travel-day-editor__add-place uses --color-accent-muted, not --color-primary-focus', () => {
    const body = ruleBody('.slcn-travel-day-editor__add-place');

    expect(body).toContain('var(--color-accent-muted)');
    expect(body).not.toContain('var(--color-primary-focus)');
  });

  it('never uses --color-primary-focus as a live declaration value anywhere in the file', () => {
    // Matches only an active `property: var(--color-primary-focus)` style
    // declaration, not the token's name inside a code comment explaining
    // past fixes (travel-register.css:323, 406, 692).
    const liveUsages = css.match(/:\s*var\(--color-primary-focus\)/g);

    expect(liveUsages).toBeNull();
  });
});
