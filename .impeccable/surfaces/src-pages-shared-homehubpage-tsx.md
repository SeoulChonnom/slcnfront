---
version: 1
slug: "src-pages-shared-homehubpage-tsx"
primary_target: "src/pages/shared/HomeHubPage.tsx"
related_targets: ["src/pages/main/HomePage.tsx","src/pages/mobile/HomePage.tsx"]
---

## Scope

- Redesign the authenticated home surface implemented by `src/pages/shared/HomeHubPage.tsx`, with `src/pages/main/HomePage.tsx` and `src/pages/mobile/HomePage.tsx` as related route wrappers.
- Replace the home body and desktop shell composition for this surface; adapt the same hierarchy for mobile.
- Keep travel and day-out records as separate concepts and destinations. Do not introduce a merged backend model, endpoint, or unified archive.
- This brief governs the home surface only. It does not authorize unrelated redesigns of travel detail, day-out detail, calendar, shoes, profile, or registration flows.

## Visitor mode

- Operate.

## Audience

- The two established repeat users of this private couple-only service.
- They already understand the product and arrive to retrieve memories, not to learn what the service is.

## Primary job

- Make past travel records easy and fast to retrieve immediately after entering home, with newest-first browsing as the default and search, year navigation, and photographic recognition as supporting paths.

## Primary action/task

- Scan the newest travel memories, find a desired past journey, and open its detail.
- A visible record should open in one action; an older record should be reachable through year navigation or search without leaving the home retrieval flow.

## Information/content priority

1. One recent past journey: real cover photograph, title, date range, region, duration, and one-line review.
2. The newest-first past-travel archive beginning within the first viewport: year context, date, title, region, duration, and varied thumbnail presence.
3. Retrieval controls: year jump first, understated search second; photographs support recognition without replacing metadata.
4. The private D-day context and a compact next-schedule summary as secondary information.
5. Day-outs as a separate destination, never mixed into the travel chronology.
6. Shoes and Film Art only as secondary navigation under profile/more, never at the same visual weight as travel retrieval.

## Constraints

- Preserve existing backend contracts and use current travel, schedule, and asset data; no backend change is in scope.
- Keep `/main` and `/mobile` functionally equivalent while composing each for its device class.
- The desktop shell is flat and quiet; glass is reserved as the single signature material of the mobile bottom navigation.
- Content and controls create hierarchy. Photography is evidence and memory content, not decoration.
- Search may operate over already available travel data; server-side search, a new endpoint, and cross-domain aggregation are out of scope.
- Preserve loading, empty, no-cover, zero-search-result, error, partial-failure, focus, keyboard, 44px touch-target, and reduced-motion behavior.
- A missing cover must remain a complete typographic record, not become a decorative placeholder tile.
- The supplied logo, factual copy, routes, and record links remain authoritative; do not invent public, social, or marketing features.

## Selected visual direction

- **Memory Chronicle (`기억의 연대기`)**.
- Approved comp: `.impeccable/mocks/decision/home-memory-chronicle.webp` with approval recorded in `.impeccable/mocks/decision/home-memory-chronicle.json`.
- Structural thesis: one recent memory opens the page, then a dense chronology immediately carries the user backward in time.
- Desktop: compact flat header; an asymmetric, unboxed recent-memory photograph and text composition; a hairline transition into year navigation, search, and dense newest-first rows that use the available width deliberately.
- Mobile: stack the recent memory without letting it consume the whole first viewport; expose the archive start promptly; use a horizontally scrollable typographic year rail and compact touch-safe rows; retain glass only on the bottom navigation.
- Information density must vary: spacious recent memory, compact retrieval controls, dense archive rows, and deliberate breathing room at year transitions.

## Signature/memorable moment

- On entry, a real recent travel photograph and one-line review restore a specific shared memory; in the same viewport, the visible start of the chronology makes it immediately clear that the user can continue backward through the relationship without entering another index page.

## Existing design patterns that must be avoided

- Floating glass capsule desktop header or glass applied to content surfaces.
- Narrow mobile-like centered column on a wide desktop canvas.
- Generic SaaS dashboard, KPI/stat cards, landing-page hero, or marketing explanation.
- Three-column feature-card grid, decorative card grid, or card inside card.
- Uniform card radii, excessive pill controls, and chip rows used as primary navigation.
- Icon tile plus heading plus description repeated as a section pattern.
- Purple/blue gradients, large gradient heroes, mesh backgrounds, glow orbs, and decorative shadows.
- Uniform spacing across every section or record; equal visual weight for primary and secondary areas.
- Merging travel and day-out records, or promoting shoes and Film Art to primary travel navigation.

## Unresolved decisions

- The exact number of archive rows shown before incremental loading or another continuation mechanism; resolve from real record volume without adding a backend contract in this scope.
- Whether home search matches title and region only or also includes one-line reviews; use only fields already available in the current travel-list response.
- Whether the compact next-schedule summary shows one item or up to three; it must remain visually subordinate either way.
- The fallback focal treatment when the newest travel has no cover photograph.
- Whether mobile search is always visible or expands from a labeled control; year navigation and newest-first browsing must remain visible regardless.
