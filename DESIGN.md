---
version: beta
name: Seoul-Quiet-Editorial
description: A photography-first personal Seoul diary interface. The project retains its warm paper, Seoul Pink, white, and ink-black palette, while adopting a quiet editorial visual system: restrained chrome, generous whitespace, full-width editorial sections, compact pill actions, quiet elevation, consistent typography, and content-first layouts. The application logo is supplied separately and must be used as the sole brand mark.

colors:
  primary: "#FE9FC8"
  primary-focus: "#FF7FB8"
  primary-on-dark: "#FE9FC8"

  ink: "#1B1B1B"
  body: "#1B1B1B"
  body-muted: "#6F666A"
  body-on-dark: "#FFFFFF"
  body-muted-on-dark: "#D8CED2"

  canvas: "#FFF8F8"
  canvas-pure: "#FFFFFF"
  surface-pearl: "#FFFFFF"
  surface-soft: "#FFE8EF"
  surface-muted: "#F8EEF1"

  surface-dark-1: "#1B1B1B"
  surface-dark-2: "#242124"
  surface-dark-3: "#2B2629"

  divider-soft: "rgba(27, 27, 27, 0.08)"
  hairline: "rgba(27, 27, 27, 0.12)"
  overlay: "rgba(27, 27, 27, 0.42)"

  on-primary: "#1B1B1B"
  on-dark: "#FFFFFF"

typography:
  font-stack-display: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  font-stack-body: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

  hero-display:
    fontFamily: "{typography.font-stack-display}"
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: -0.03em

  display-lg:
    fontFamily: "{typography.font-stack-display}"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em

  display-md:
    fontFamily: "{typography.font-stack-display}"
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: -0.02em

  lead:
    fontFamily: "{typography.font-stack-display}"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.01em

  tagline:
    fontFamily: "{typography.font-stack-display}"
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em

  body-strong:
    fontFamily: "{typography.font-stack-body}"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: -0.01em

  body:
    fontFamily: "{typography.font-stack-body}"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: -0.01em

  caption:
    fontFamily: "{typography.font-stack-body}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -0.01em

  caption-strong:
    fontFamily: "{typography.font-stack-body}"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em

  button-utility:
    fontFamily: "{typography.font-stack-body}"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: -0.01em

  fine-print:
    fontFamily: "{typography.font-stack-body}"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -0.01em

  nav-link:
    fontFamily: "{typography.font-stack-body}"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: -0.01em

rounded:
  none: 0px
  xs: 6px
  sm: 8px
  md: 12px
  lg: 18px
  xl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px
  section-lg: 112px

layout:
  content-text: 760px
  content-standard: 1080px
  content-wide: 1440px
  page-gutter-mobile: 20px
  page-gutter-tablet: 32px
  page-gutter-desktop: 48px

elevation:
  none: "none"
  hairline: "0 0 0 1px rgba(27, 27, 27, 0.08)"
  image-resting: "3px 5px 30px rgba(27, 27, 27, 0.18)"
  floating-bar: "0 8px 30px rgba(27, 27, 27, 0.08)"

motion:
  duration-fast: 160ms
  duration-default: 240ms
  duration-page: 360ms
  easing-standard: "cubic-bezier(0.2, 0, 0, 1)"
  press-scale: 0.96

components:
  app-header:
    backgroundColor: "rgba(255, 248, 248, 0.82)"
    textColor: "{colors.ink}"
    height: 56px
    backdropFilter: "saturate(180%) blur(20px)"
    borderBottom: "1px solid {colors.divider-soft}"

  app-logo:
    source: "Use the separately supplied project logo asset"
    maxHeight: 28px
    treatment: "No recoloring, no generated substitute, no decorative container"
    altText: "Project logo"

  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
    minHeight: 44px
    border: "none"

  button-primary-focus:
    outline: "2px solid {colors.primary-focus}"
    outlineOffset: 3px

  button-secondary:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
    minHeight: 44px
    border: "1px solid {colors.hairline}"

  button-utility:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-utility}"
    rounded: "{rounded.sm}"
    padding: "8px 15px"
    minHeight: 36px

  button-icon:
    backgroundColor: "rgba(255, 255, 255, 0.72)"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 44px
    backdropFilter: "blur(14px)"
    border: "1px solid rgba(27, 27, 27, 0.06)"

  text-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    decoration: "underline"
    decorationColor: "{colors.primary}"
    decorationThickness: 2px
    underlineOffset: 4px

  hero-record:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    minHeight: "72vh"
    padding: "{spacing.section-lg} 0 {spacing.section}"
    rounded: "{rounded.none}"

  hero-image:
    aspectRatioDesktop: "16 / 9"
    aspectRatioMobile: "4 / 5"
    objectFit: "cover"
    roundedDesktop: "{rounded.xl}"
    roundedMobile: "{rounded.lg}"
    shadow: "{elevation.image-resting}"

  record-section-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    padding: "{spacing.section} 0"
    rounded: "{rounded.none}"

  record-section-pink:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    padding: "{spacing.section} 0"
    rounded: "{rounded.none}"

  record-section-dark:
    backgroundColor: "{colors.surface-dark-1}"
    textColor: "{colors.on-dark}"
    padding: "{spacing.section} 0"
    rounded: "{rounded.none}"

  outing-card:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.hairline}"
    shadow: "{elevation.none}"

  outing-card-featured:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    border: "none"
    shadow: "{elevation.none}"

  metadata-chip:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "8px 13px"
    minHeight: 32px

  category-chip-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-strong}"
    rounded: "{rounded.pill}"
    padding: "9px 15px"

  search-input:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    height: 46px
    border: "1px solid {colors.hairline}"

  text-input:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
    minHeight: 48px
    border: "1px solid {colors.hairline}"

  textarea:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    minHeight: 180px
    border: "1px solid {colors.hairline}"

  floating-add-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 56px
    shadow: "{elevation.floating-bar}"

  floating-filter-bar:
    backgroundColor: "rgba(255, 248, 248, 0.84)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    minHeight: 60px
    padding: "8px 12px"
    backdropFilter: "saturate(180%) blur(20px)"
    border: "1px solid {colors.divider-soft}"
    shadow: "{elevation.floating-bar}"

  empty-state:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxl}"
    border: "none"

  modal:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.divider-soft}"
    shadow: "0 24px 80px rgba(27, 27, 27, 0.16)"

  footer:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.body-muted}"
    typography: "{typography.fine-print}"
    padding: "48px 0"

  calendar-toolbar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderBottom: "1px solid {colors.divider-soft}"
    padding: "{spacing.lg} {spacing.xl}"

  calendar-grid:
    backgroundColor: "{colors.canvas-pure}"
    headerBackgroundColor: "{colors.canvas}"
    todayHighlight: "{colors.surface-soft}"
    eventBubble: "{colors.primary}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.divider-soft}"

  segmented-control:
    backgroundColor: "{colors.surface-muted}"
    activeBackgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.body-muted}"
    activeTextColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: 36px
    innerPadding: 4px

  step-indicator:
    completedColor: "{colors.primary}"
    activeColor: "{colors.ink}"
    inactiveColor: "{colors.body-muted}"
    connectorColor: "{colors.divider-soft}"
    typography: "{typography.caption-strong}"
---

# Design System: Seoul Quiet Editorial

## 1. Overview

This interface is a personal visual journal for recording trips around Seoul. Its purpose is not to behave like a dense productivity dashboard. It should feel like a quiet, curated archive in which each outing, photograph, date, neighborhood, and short memory receives enough space to be appreciated.

The design adopts a quiet editorial, content-first approach:

- Interface chrome recedes behind personal photographs and writing.
- Large editorial sections replace decorative scrapbook layering.
- Whitespace, surface changes, and typography establish hierarchy.
- Interactive elements use compact pill shapes and restrained motion.
- Cards remain flat and calm; shadows are reserved for imagery and truly floating UI.
- The project’s existing warm pink palette remains the visual identity.

The separately supplied logo is the only approved brand mark. Do not recreate, redraw, recolor, or replace it with a text logo.

---

## 2. Creative North Star: "A Quiet Seoul Photo Journal"

The creative direction is **A Quiet Seoul Photo Journal**.

The interface should resemble a carefully edited travel book or photography exhibition rather than a scrapbook collage. The user’s records are the artifacts; the interface is only the gallery wall.

### Core qualities

- **Personal:** Dates, captions, locations, and memories feel intimate.
- **Photography-first:** A record’s image is usually its strongest visual element.
- **Calm:** Avoid visual competition between UI elements.
- **Editorial:** Large headlines and generous spacing create a reading rhythm.
- **Warm:** Pink-tinted paper surfaces preserve the project’s original character.
- **Precise:** Components use consistent radii, spacing, and interaction states.

---

## 3. Color Strategy

The original project palette is retained. External blue accent systems are not imported.

### Core palette

- **Seoul Pink — `{colors.primary}` `#FE9FC8`**  
  The primary action and selection color. Use for primary buttons, selected chips, progress indicators, small highlights, and occasional section emphasis.

- **Warm Paper — `{colors.canvas}` `#FFF8F8`**  
  The default page canvas. It replaces pure white as the dominant background and gives the diary a softer reading environment.

- **Pure White — `{colors.canvas-pure}` `#FFFFFF`**  
  Used for cards, inputs, modals, and content surfaces that need separation from Warm Paper.

- **Soft Pink Surface — `{colors.surface-soft}` `#FFE8EF`**  
  Used for alternating sections, metadata chips, empty states, and subtle grouping.

- **Ink — `{colors.ink}` `#1B1B1B`**  
  Used for primary text, icons, dark actions, and dark editorial sections.

### Color hierarchy rules

1. Use **Seoul Pink** for action and selection, not as a large default page background.
2. Use **Warm Paper** as the dominant canvas.
3. Use **Pure White** to lift interactive or readable content.
4. Use **Ink** for typography and occasional full-width dark sections.
5. Use surface shifts and whitespace before adding borders.
6. Do not introduce additional brand colors without a functional requirement.
7. Avoid decorative gradients.

### Contrast

Because Seoul Pink is light, text placed on it should normally use `{colors.ink}`, not white. White text is reserved for Ink or other verified dark surfaces.

---

## 4. Typography

The typography follows restrained editorial sizing, spacing, and weight discipline, but uses a web-safe system stack.

### Font strategy

Use:

`Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

On platforms that provide a native system UI font, the stack may resolve to that font. On other platforms, Inter provides a close neutral substitute.

### Hierarchy principles

- Hero headlines use 56px / 600 with tight line-height.
- Section headlines use 34–40px / 600.
- Body text uses 17px / 400 with a 1.47 line-height.
- Strong text uses weight 600.
- Avoid weight 500 as an intermediate default.
- Use negative letter-spacing on display text.
- Keep diary body copy spacious and highly readable.
- Do not use handwriting fonts as a primary UI font.
- The user’s writing should provide the personality; typography should provide clarity.

### Recommended use

- `{typography.hero-display}`: page title or a featured outing title.
- `{typography.display-lg}`: major section heading.
- `{typography.display-md}`: record detail heading.
- `{typography.lead}`: short emotional summary or place introduction.
- `{typography.body}`: diary entries and descriptions.
- `{typography.caption}`: date, district, weather, companions, and tags.
- `{typography.fine-print}`: footer and secondary system notes.

---

## 5. Layout

### Content model

The interface uses three main container widths:

- **Text content:** 760px
- **Standard content:** 1080px
- **Wide visual content:** 1440px

Long diary text should not span the full viewport. Images may use the standard or wide container.

### Section rhythm

Sections stack directly with no decorative gap between their backgrounds:

1. Warm Paper hero
2. Pure White or Soft Pink record section
3. Optional Ink editorial section
4. Warm Paper continuation
5. Soft Pink footer

The surface change acts as the divider.

### Whitespace

- Standard section padding: 80px
- Large hero padding: 112px top
- Card padding: 24px
- Major content gap: 32–48px
- Mobile section padding: 48px
- Avoid filling every empty area with stickers, shapes, or illustrations.

### Record feed

The primary outing feed is single-column by default because it is a personal chronological journal.

A two-column layout may be used only for image-led archive browsing on desktop. Record detail pages remain single-column and reading-focused.

---

## 6. Elevation and Depth

The interface is mostly flat.

### Allowed elevation

- **No shadow:** sections, cards, buttons, text, navigation content.
- **Hairline:** utility cards, inputs, chips, and subtle separators.
- **Image resting shadow:** large hero photographs or printed-photo-style images resting on a surface.
- **Floating shadow:** fixed add button, floating filter bar, or modal.

### Rules

- Never add a drop shadow to ordinary record cards.
- Never use block shadows.
- Never use thick black component borders.
- Do not use irregular blob borders.
- Do not simulate depth with overlapping decorative shapes.
- Prefer surface color, spacing, blur, and image composition.

---

## 7. Shapes

### Radius grammar

- `6px`: calendar event bubbles.
- `8px`: compact utility controls.
- `12px`: single-line text fields.
- `18px`: textareas, standard cards.
- `24px`: featured cards, hero images, modals, empty states.
- `9999px`: buttons, chips, search, circular controls.
- `0px`: full-width sections.

### Rules

- Shapes are geometric and consistent.
- Do not use wobbly borders.
- Do not randomize border radii.
- Do not rotate cards or metadata.
- Do not use blobs as default containers.
- Full-width editorial sections remain rectangular.

---

## 8. Components

### 8.1 App Header

*→ `src/components/layout/DesktopHeader.tsx`, `src/components/layout/MobileTopBar.tsx`*

The header is compact, sticky, and translucent.

- Height: 56px
- Background: Warm Paper at approximately 82% opacity
- Blur: `saturate(180%) blur(20px)`
- Bottom separator: one soft hairline
- Left: project logo
- Right: archive/search/settings actions
- Mobile: logo remains visible; secondary actions collapse into one menu

The logo should be rendered from the supplied asset at a maximum height of 28px.

### 8.2 Hero Record

*→ `src/pages/shared/HomeHubPage.tsx` (hero section)*

Used for the latest or featured Seoul outing.

Structure:

1. Date or neighborhood caption
2. Large outing title
3. One short lead sentence
4. Primary action, if needed
5. Large photograph

The hero photograph receives the image-resting shadow. Text and buttons do not.

### 8.3 Outing Card

*→ `src/domains/trip/components/TripCard.tsx`*

Standard chronological archive card.

- White surface
- 18px radius
- 1px soft hairline
- No shadow
- One image, title, date, neighborhood, and short excerpt
- Metadata uses pill chips sparingly
- Entire card may be clickable, but visible actions should remain minimal

Hover on pointer devices may slightly increase image scale or darken the hairline. Do not lift the whole card with a large shadow.

### 8.4 Featured Outing Card

*→ `src/domains/trip/components/TripCard.tsx` (extended variant — not yet implemented)*

Used for a particularly meaningful record.

- Larger image
- 24px radius
- 32px padding
- No border when placed on a contrasting section
- More whitespace than a standard card
- At most one featured card per section

### 8.5 Buttons

*→ `src/components/ui/Button.tsx`, `src/components/ui/button-class-name.ts`*

#### Primary

- Seoul Pink background
- Ink text
- Full pill radius
- Minimum 44px height
- Press state: `scale(0.96)`
- Focus state: 2px Pink Focus outline

#### Secondary

- White background
- Ink text
- 1px hairline
- Full pill radius

#### Utility

- Ink background
- White text
- 8px radius
- Used only for compact administrative actions

Do not use hover tilt, sticker movement, or block shadows.

### 8.6 Chips

*→ inline usage in `src/domains/trip/components/TripCard.tsx`, `TripListSection.tsx`, and calendar legend*

Chips represent filters or concise metadata such as:

- 종로구
- 성수
- 야경
- 전시
- 혼자
- 비 오는 날

Use Soft Pink for neutral metadata and Seoul Pink for selected state.

Do not turn every metadata field into a chip. A record should normally show no more than three visible chips.

### 8.7 Inputs

*→ `src/components/ui/TextField.tsx`, `src/components/ui/FileDropzone.tsx`*

Inputs are quiet, white, and rounded.

- Search uses a pill shape.
- Text fields use 12px radius.
- Textareas use 18px radius.
- Border is a 1px hairline.
- Focus uses Pink Focus outline.
- Do not fill the entire input pink on focus.
- Error states use an accessible semantic error color defined separately from the brand palette.

### 8.8 Floating Add Button

*→ not yet implemented (admin-only FAB, planned)*

The add-record action may use a circular floating button.

- 56px
- Seoul Pink background
- Ink icon
- Soft floating shadow
- Fixed to the lower-right safe area
- Icon stroke should match the rest of the UI, not a thick hand-drawn style

### 8.9 Empty State

*→ `src/components/ui/EmptyState.tsx`*

Use a calm text-led empty state.

- Soft neutral or Soft Pink surface
- 24px radius
- Large whitespace
- Optional small illustration or supplied logo mark
- One primary action

Avoid animated blobs.

### 8.10 Modal

*→ `src/components/ui/Modal.tsx`*

- White surface
- 24px radius
- Restrained shadow
- Clear title and one primary action
- On mobile, may become a bottom sheet with 24px top radius

### 8.11 Calendar Toolbar

*→ `src/domains/calendar/components/CalendarToolbar.tsx`*

The toolbar provides navigation, view switching, and calendar management for both month and week views.

Structure (3 rows):

1. Heading row: eyebrow label (`{typography.caption}`) + current month/year title (`{typography.display-md}`)
2. Controls row:
   - Previous / Today / Next navigation buttons (button-secondary, compact height)
   - SegmentedControl for month ↔ week view switch (see 8.13)
   - "일정 추가" primary action button
3. Legend row: "내 캘린더" label + "관리" text-link + calendar color-dot chips

Each calendar chip shows a filled color dot (the calendar's assigned color) and the calendar name. Selected chip uses the calendar's own color as background with `{colors.on-dark}` text; unselected uses `{colors.surface-soft}` background with `{colors.ink}` text.

### 8.12 Calendar Grid

*→ `src/domains/calendar/components/CalendarMonthView.tsx`, `CalendarWeekView.tsx`, `CalendarTimelineView.tsx`*

Built on FullCalendar. Apply design tokens via CSS overrides only; do not alter the library's DOM structure.

- Background: `{colors.canvas-pure}`
- Day header row (요일): `{colors.canvas}` background, `{typography.caption-strong}`
- Cell borders: `1px solid {colors.divider-soft}`
- Today cell: `{colors.surface-soft}` background highlight
- Event bubble: `{colors.primary}` (or calendar-assigned color), `{rounded.xs}` radius, `{colors.ink}` text (Seoul Pink is too light for white text — see Section 3 Contrast), `{typography.fine-print}`
- Maximum 3 events per cell in month view; "+N more" overflow link in `{typography.caption}`
- On event click: open CalendarEventModal (Section 8.10 Modal spec)

### 8.13 Segmented Control

*→ `src/components/ui/SegmentedControl.tsx`*

A visually grouped set of options where exactly one is active at a time (radio group pattern).

- Outer container: `{colors.surface-muted}` background, `{rounded.pill}`, 4px inner padding
- Active segment: `{colors.canvas-pure}` background, `{colors.ink}` text, `{rounded.pill}`, 160ms transition
- Inactive segment: `{colors.body-muted}` text, transparent background
- Typography: `{typography.caption-strong}`
- Minimum height: 36px

Use for: calendar month ↔ week switch, any two- or three-option toggle where a dropdown would be excessive.

---

## 9. Photography and Media

Photography carries the emotional identity of the project.

### Image principles

- Prefer real outing photographs over decorative graphics.
- Use consistent aspect ratios within the same list.
- Use 16:9 for wide editorial images.
- Use 4:5 or 3:4 for mobile hero art direction.
- Use 1:1 only for compact archive tiles.
- Use responsive `srcset` and lazy loading.
- Load the above-fold hero eagerly.
- Preserve image color; do not apply heavy pink overlays.
- Avoid decorative gradients over images.
- Use a dark overlay only when text must be placed directly on photography.

### Image hierarchy

One image should lead each record. Secondary photographs belong in a gallery below the main text, not in a collage around the title.

### Map Images

*→ `src/domains/trip/components/TripDetailSection.tsx`, `TripMapSwitcher.tsx`*

The trip detail view displays map screenshots captured from Kakao Maps. These are not editorial photographs and require different treatment.

- Display the image as-is. No pink overlays, color filters, or gradient overlays.
- Width: 100% of the card container; constrain with `max-height` to prevent vertical overflow.
- Radius: `{rounded.lg}` (image inside a card)
- Loading state: Skeleton placeholder that holds the same dimensions as the image area.

Map Switcher (displayed only when two maps exist):

- Two pill buttons placed side by side (e.g., "지도 1" / "지도 2")
- Active: `{colors.primary}` background, `{colors.on-primary}` text
- Inactive: button-secondary style (`{colors.canvas-pure}` background, 1px hairline border)
- Minimum height: 44px (touch target)

---

## 10. Navigation

### Desktop

- Sticky translucent app header
- Project logo on the left
- Primary navigation centered or right-aligned
- Search and add action kept visible
- Keep total navigation items small

### Mobile

- Logo remains in the header
- One add action remains visible
- Archive filters move into a menu or bottom sheet
- Maintain 44px touch targets
- Do not shrink text links below readable sizes

---

## 11. Interaction and Motion

Motion is subtle and functional.

### Allowed motion

- Button press: scale to 0.96
- Image hover: scale up to 1.02 within an overflow-hidden frame
- Section entrance: opacity and translateY of no more than 12px
- Page transition: short fade or horizontal slide
- Modal: fade plus slight scale
- Filter bar: soft slide from bottom

### Timing

- Fast: 160ms
- Default: 240ms
- Page: 360ms
- Easing: `cubic-bezier(0.2, 0, 0, 1)`

### Reduced motion

Respect `prefers-reduced-motion`. Remove scaling, parallax, and page slides when reduced motion is enabled.

### Prohibited motion

- Random rotation
- Continuous blob pulsation
- Card wobble
- Page-turn simulation
- Large bounce
- Decorative parallax behind text

---

## 12. Responsive Behavior

### Breakpoints

- Small phone: ≤ 419px
- Phone: 420–640px
- Tablet: 641–833px
- Small desktop: 834–1068px
- Desktop: 1069–1440px
- Wide desktop: ≥ 1441px

### Hero typography

- Desktop: 56px
- Small desktop: 40px
- Phone: 34px
- Small phone: 28px

### Section spacing

- Desktop: 80–112px
- Tablet: 64–80px
- Phone: 48px

### Archive grid

- Wide desktop: optional 2 columns
- Desktop: 2 columns only for visual archive mode
- Tablet and below: 1 column
- Record detail: always 1 column

### Images

Use art-directed crops rather than merely shrinking a wide desktop image into a narrow mobile viewport.

---

## 13. Accessibility

- Minimum touch target: 44 × 44px.
- Maintain visible keyboard focus.
- Do not rely on Pink alone to communicate state.
- Pair selected state with an icon, text label, border, or weight change.
- Verify color contrast for Ink on Seoul Pink.
- Do not use white text on Seoul Pink unless contrast has been independently verified.
- All images require meaningful alt text or an empty alt attribute when decorative.
- Date and location metadata should remain available to screen readers.
- Modal focus must be trapped and returned to the trigger on close.

---

## 14. Do's and Don'ts

### Do

- Let photographs and diary writing dominate the screen.
- Use Warm Paper as the primary background.
- Use Seoul Pink as the single brand accent.
- Use body text at 17px with generous line-height.
- Use full-width surface shifts to separate major sections.
- Use 18–24px radii for cards and media.
- Use pill shapes for clear actions and filters.
- Reserve shadows for photographs, floating controls, and modals.
- Use the supplied logo asset without alteration.
- Keep the chronological record view calm and single-column.

### Don't

- Do not use thick black borders.
- Do not use irregular blob cards.
- Do not rotate dates, labels, or cards.
- Do not create scrapbook-style overlaps.
- Do not use block shadows.
- Do not use decorative gradients.
- Do not add a second accent color.
- Do not use handwriting fonts for core UI.
- Do not turn every section into a card.
- Do not place many small images around a headline.
- Do not imitate another company's logo, product copy, or proprietary brand assets.
- Do not substitute a generated logo for the supplied project logo.

---

## 15. Page Templates

### 15.1 Home / Latest Record

1. Sticky app header
2. Featured outing hero
3. Recent outings section
4. Neighborhood or theme filters
5. Optional dark editorial quote section
6. Archive CTA
7. Footer

### 15.2 Archive

1. Header
2. Page title and short description
3. Search input
4. Filter chips
5. Chronological record list
6. Pagination or incremental loading
7. Floating add action

### 15.3 Record Detail

1. Header
2. Date and neighborhood
3. Large title
4. Lead sentence
5. Hero photograph
6. Diary body in a 760px text column
7. Supporting photo gallery
8. Tags and map/location metadata
9. Previous/next record navigation
10. Footer

### 15.4 Trip Register (Wizard)

*→ `src/domains/trip/components/TripRegisterWizard.tsx`*

1. Compact page header (main device only)
2. Step indicator: ① 기본 정보 → ② 지도 정보 → ③ 퀴즈 정보
   - Completed steps: `{colors.primary}` (Seoul Pink)
   - Current step: `{colors.ink}` text (bold)
   - Upcoming steps: `{colors.body-muted}`
   - Connector lines: `{colors.divider-soft}`
   - Token reference: `{components.step-indicator}`
3. Step content (conditional on current step):
   - Step 1: Logo image FileDropzone + trip type RadioGroup + date TextField
   - Step 2: Map image FileDropzone (primary) + optional second map FileDropzone
   - Step 3: Quiz question TextField + answer options list + correct answer selection
4. Error alert (visible only on submission error; semantic error color)
5. Actions row:
   - Previous button (button-secondary, visible on steps 2 and 3 only)
   - Next / Save button (button-primary; label: "다음" on steps 1–2, "저장" on step 3)

### 15.5 Login

*→ `src/pages/shared/LoginPage.tsx`*

1. PublicShell (page background: `{colors.canvas}`)
2. Single centered column, max-width 400px
3. Logo (supplied asset, maxHeight 28px)
4. Page title (`{typography.display-md}`)
5. ID TextField
6. Password TextField (type="password")
7. Login button-primary (full width)
8. Error message (semantic error color, `{typography.caption}`)

### 15.6 Calendar

*→ `src/pages/main/CalendarMonthPage.tsx`, `CalendarWeekPage.tsx`*
*→ `src/domains/calendar/components/CalendarSection.tsx`*

1. MainDesktopShell / MainMobileShell
2. CalendarToolbar (see 8.11):
   - Heading: eyebrow + month/year title
   - Controls: previous / today / next + SegmentedControl (월|주) + add-event button
   - Legend: per-calendar color chips + manage link
3. Calendar Grid surface (see 8.12):
   - Month view: 6-week × 7-day grid
   - Week view: 7-column timeline
4. Loading: Skeleton covering the entire grid area
5. Empty state: no active calendars message
6. CalendarEventModal on event click (Section 8.10 Modal)
7. CalendarManageModal on legend "관리" click (Section 8.10 Modal)

### 15.7 Shoes Catalog

*→ `src/pages/main/ShoesCatalogPage.tsx`*
*→ `src/domains/shoes/components/ShoesCatalogSection.tsx`*

1. MainDesktopShell / MainMobileShell
2. Intro section (main device only): eyebrow + headline (`{typography.display-md}`) + description
3. Brand navigation: brand name anchor links in pill chip style
4. Brand sections (repeated per brand):
   - Brand heading (`{typography.display-md}`)
   - Shoe card grid: 2–3 columns (desktop), 1 column (mobile)
   - Each ShoeCard: image + brand name (`{typography.caption}`) + shoe name (`{typography.body-strong}`) + description + price + "상세 보기" CTA
5. Price notice card (muted tone, `{typography.caption}`)
6. Empty state: no shoes message

### 15.8 Shoe Detail

*→ `src/pages/main/ShoeDetailPage.tsx`*
*→ `src/domains/shoes/components/ShoeDetailSection.tsx`*

1. MainDesktopShell / MainMobileShell
2. Back link (main device only, text-link style)
3. Photo click notice card (muted tone, `{typography.caption}`)
4. Hero section (two-column on desktop, stacked on mobile):
   - Left: shoe image (`{elevation.image-resting}` shadow, `{rounded.xl}`)
   - Right: brand eyebrow + shoe name (`{typography.display-md}`) + description + price (`{typography.body-strong}`) + spec list
5. Video panel (only when video content is available):
   - Section eyebrow + title
   - `<video>` element (controls, muted, loop, playsInline) or external link button
6. Reviews section:
   - Section eyebrow + title
   - Review card grid: image + caption text, entire card is an external link
7. Not found fallback: muted card + error message + "카탈로그로 돌아가기" button

---

## 16. Implementation Rules

1. Reference design tokens instead of repeating literal values.
2. Build one component at a time.
3. Keep the logo as a replaceable asset path.
4. Use semantic HTML before visual wrappers.
5. Do not encode random rotation or irregular radii into reusable components.
6. Keep animations optional and reduction-aware.
7. Validate mobile layouts before adding desktop-only decoration.
8. Prefer CSS surface changes over additional divider elements.
9. Use a real semantic error/success palette for form feedback; do not misuse brand pink.
10. Treat user photographs and writing as content, not decoration.

---

## 17. Known Gaps

- The exact logo dimensions and clear-space requirements depend on the supplied logo file.
- Semantic success, warning, and error colors must be defined separately after accessibility testing.
- Map styling is not specified.
- Dark mode is not included in this version.
- Photo gallery behavior and image ordering rules require product-level decisions.
- Record privacy, export, backup, and deletion flows are outside the visual design scope.
