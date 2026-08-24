# Absolute Imports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace in-repository relative module references under src with one @/* absolute alias while preserving module boundaries, code-splitting, test mocks, and runtime behavior.

**Architecture:** TypeScript will resolve @/* to src/* through tsconfig.app.json. Vite will map @ to the absolute src filesystem directory in vite.config.ts; Vitest will inherit that resolver because it is configured through Vite's defineConfig. Each ./ or ../ specifier will be resolved from its importing file and rewritten to the corresponding @/... path, with direct module endpoints retained instead of introducing barrel imports.

**Tech Stack:** Vite 8, React 19, TypeScript 6, Vitest 4, Biome 2, pnpm, Node.js 24

**Spec:** User request to convert the repository's relative imports to absolute imports, together with the repository requirements in AGENTS.md.

## Global Constraints

- Use the single alias prefix @/ for application-owned modules and map it to src/*; leave package imports such as react and @tanstack/react-query unchanged.
- Add no barrel files and do not replace direct module imports with index imports; preserve each resolved file path and any extension/query suffix exactly.
- Include production modules, src/main.tsx, tests and Vitest mock/importActual strings, dynamic lazy imports, CSS @import statements, and TypeScript asset imports in the rewrite scope.
- Do not edit binary files under src/assets; only edit the source import sites that reference them.
- Do not change exports, route behavior, lazy-loading boundaries, test behavior, CSS declarations, or the deployed base-path behavior.
- There is no ESLint config or ESLint dependency in this checkout; keep biome.json unchanged and use the required Biome command for formatting/lint verification.
- Do not create a commit as part of this plan.
- Do not capture Playwright screenshots: this is an import/configuration refactor with no intended rendered UI change, so the UI screenshot requirement in the repository DoD is not applicable.

---

### Task 1: Configure the @/* resolver

**Files:**
- Modify: tsconfig.app.json
- Modify: vite.config.ts
- Inspect only: tsconfig.node.json, tsconfig.json, package.json, biome.json

**Interfaces:**
- Consumes: the existing TypeScript bundler configuration and the existing Vite/Vitest defineConfig object.
- Produces: TypeScript and Vite/Vitest resolution for @/anything to the matching file under src/.

- [ ] **Step 1: Add the TypeScript alias**

In tsconfig.app.json, add these compiler options alongside the existing bundler settings:

~~~
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
},
~~~

Keep include: ["src"], moduleResolution: "bundler", allowImportingTsExtensions, and all strictness options unchanged.

- [ ] **Step 2: Add the Vite/Vitest alias**

In vite.config.ts, import fileURLToPath from node:url and add this resolve entry to the existing defineConfig object:

~~~
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
},
~~~

Use the filesystem path rather than a URL string so Vite's alias resolver and CSS @import resolver receive an absolute replacement path. Do not create a separate vitest.config.ts; the existing test block must continue to use this Vite config.

- [ ] **Step 3: Check configuration scope before rewriting imports**

Confirm that tsconfig.node.json has no source imports requiring @/*, that no existing alias is being overwritten, and that package.json has no path-alias plugin dependency. Keep the configuration changes limited to tsconfig.app.json and vite.config.ts.

### Task 2: Rewrite all in-scope module references

**Files:**
- Modify: the 250 existing src/**/*.{ts,tsx} files containing relative module strings, across src/app, src/components, src/domains, src/lib, src/pages, src/test, and src/main.tsx
- Modify: src/styles/globals.css (six relative CSS @import statements)
- Do not modify: binary files under src/assets

**Interfaces:**
- Consumes: the @/* alias from Task 1.
- Produces: 793 ./ or ../ module-string references rewritten to @/... in TypeScript/TSX (748 import/export/dynamic specifiers plus 45 Vitest mock/actual references), and six CSS imports rewritten to @/styles/....

- [ ] **Step 1: Record the pre-change inventory**

Run the following read-only scans before editing and retain the counts in the worker report:

~~~
rg -o -P --glob 'src/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}' "[\"']\.{1,2}/[^\"']+[\"']" src | wc -l
rg -l -P --glob 'src/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}' "[\"']\.{1,2}/[^\"']+[\"']" src | wc -l
rg -n -P --glob 'src/**/*.{css,scss,sass,less}' "@import\s+(?:url\(\s*)?[\"']?\.{1,2}/[^\"') ;]+" src/styles
~~~

The expected baseline is 793 TypeScript/TSX module strings in 250 files and six CSS imports in src/styles/globals.css. Include strings inside vi.mock, vi.importActual, typeof import(...), and import(...) in this inventory.

- [ ] **Step 2: Resolve each relative path from its importer and rewrite it**

For every source module string, normalize the importer directory plus the relative specifier, remove the leading repository src/, and prepend @/. Preserve the direct target path and syntax. Representative transformations are:

~~~
/* src/pages/main/HomePage.tsx */
import { HomeHubPage } from '../shared/HomeHubPage';
// becomes
import { HomeHubPage } from '@/pages/shared/HomeHubPage';

// src/app/router/lazy-route-pages.tsx
const page = import('../../pages/main/HomePage');
// becomes (still lazy; do not turn this into a static import)
const page = import('@/pages/main/HomePage');

// a Vitest mock
vi.mock('../../../domains/auth/api/auth-api', factory);
// becomes
vi.mock('@/domains/auth/api/auth-api', factory);
~~~

Convert vi.mock and vi.importActual module strings, including the two typeof import('../../../...') type references, so test mocks and type-level module references resolve through the same alias. Do not alter package names, URL strings, CSS url(...) values, or any non-module relative data.

- [ ] **Step 3: Rewrite CSS imports without changing CSS contents**

In src/styles/globals.css, change only these six import paths:

~~~
@import "@/styles/tokens.css";
@import "@/styles/utilities.css";
@import "@/styles/components-common.css";
@import "@/styles/components-pc.css";
@import "@/styles/components-mobile.css";
@import "@/styles/profile.css";
~~~

Keep @import "tailwindcss" and every declaration unchanged. Vite's CSS resolver uses the configured alias for CSS @import, so the CSS imports remain base-path-safe and do not become root URLs such as /src/....

- [ ] **Step 4: Preserve direct-module boundaries**

Review the rewritten diff for any new index/barrel import, accidental static conversion of a lazy import, changed file extension, or path that does not begin with @/ and point to an existing src/ target. Correct only those mechanical path errors before verification.

### Task 3: Run required verification and the no-relative-import audit

**Files:**
- Inspect: tsconfig.app.json, vite.config.ts, all rewritten src/**/*.{ts,tsx}, and src/styles/globals.css
- Do not create screenshots or modify application behavior during verification.

**Interfaces:**
- Consumes: the configured alias and completed import rewrite.
- Produces: formatter/lint, unused-code, TypeScript/build, test, and explicit no-relative-module evidence.

- [ ] **Step 1: Format and lint the changed source**

Run exactly:

~~~
npx @biomejs/biome check --write src/
~~~

If Biome changes import formatting, treat its output as the final source state and run the remaining checks after that edit.

- [ ] **Step 2: Check unused files, dependencies, and exports**

Run exactly:

~~~
pnpm run knip
~~~

Report any failure separately from the clean baseline; do not suppress or delete unrelated findings.

- [ ] **Step 3: Check TypeScript/Vite resolution**

Run pnpm typecheck (or pnpm build when a production-bundle check is required) after the final edit. The check must resolve @/* from application code, lazy imports, test imports, and CSS processing without changing runtime behavior.

- [ ] **Step 4: Run the complete test suite**

Run exactly:

~~~
pnpm test
~~~

The existing Vitest suite must pass, including mocked API modules and route lazy-loading tests.

- [ ] **Step 5: Prove no in-scope relative module references remain**

Run this post-change audit; it must print the success line and exit 0:

~~~
if rg -n -P --glob 'src/**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}' "[\"']\.{1,2}/[^\"']+[\"']" src; then
  echo 'ERROR: relative TypeScript/JavaScript module references remain.'
  exit 1
fi
if rg -n -P --glob 'src/**/*.{css,scss,sass,less}' "@import\s+(?:url\(\s*)?[\"']?\.{1,2}/[^\"') ;]+" src/styles; then
  echo 'ERROR: relative CSS @imports remain.'
  exit 1
fi
echo 'No in-scope relative module references remain.'
~~~

This audit intentionally excludes relative CSS url(...) asset semantics and non-module URLs; it covers every TypeScript/TSX module string, Vitest mock/actual path, dynamic import, and CSS @import counted in Task 2.
