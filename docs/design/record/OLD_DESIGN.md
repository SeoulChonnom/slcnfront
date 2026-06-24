# Design System: Creative Editorial Guidelines

## 1. Overview & Creative North Star: "The Neo-Kitsch Scrapbook"
This design system moves away from the sterile, "app-like" perfection of modern SaaS to embrace a high-end editorial experience. The **Creative North Star** is **The Neo-Kitsch Scrapbook**. 

It is an intentional collision of high-contrast Brutalism (thick black lines) and soft, personal nostalgia (hand-drawn elements). We reject the "standard grid" in favor of intentional asymmetry, overlapping layers, and a tactile feel that suggests a physical diary rather than a digital interface. The goal is a signature visual identity that feels curated, premium, and deeply personal.

---

## 2. Color Strategy: High-Contrast Playfulness
Our palette is a sophisticated "Duo-Tone Plus" system. It relies on the tension between the playful `secondary_color_hex` (#FE9FC8) and the authoritative `primary_color_hex` (#1B1B1B).

### Core Palette
- **Background (Primary Surface):** `tertiary_color_hex` (#FFF8F8). A warm, off-white "paper" feel that reduces eye strain compared to pure white.
- **Brand Accent:** `secondary_color_hex` (#FE9FC8). The signature "Seoul Pink." Use this for large-scale blobs and category markers.
- **The Ink (Text/Borders):** `primary_color_hex` (#1B1B1B). We use a solid, "off-black" ink for all borders and primary text to maintain a premium feel.
- **The Highlight (Cards/Inputs):** `neutral_color_hex` (#FFFFFF). Used to make interactive elements "pop" against the pink background.

### The "No-Line" Hierarchy Rule
While we use thick borders for *components*, structural sections must **never** be divided by 1px grey lines. Transition between sections using:
1.  **Background Shifts:** Moving from `surface` to `surface_container` (#FFE8EF).
2.  **Whitespace:** Utilizing the large-scale spacing (Scale 16 or 20) to define content blocks.

---

## 3. Typography: The Dual-Voice System
We employ a high-contrast typographic pairing to balance the "Kitsch" personality with functional legibility.

### Display & Headlines: Epilogue (The Bold Voice)
Used for brand moments, large category titles, and "hand-drawn" style headers. 
- **Creative Direction:** Treat `display-lg` and `headline-lg` as graphic elements. Use tight letter-spacing (-2%) for a modern, editorial look.
- **Scale:** `display-lg` (3.5rem) for hero moments; `headline-sm` (1.5rem) for card titles.

### Body & Labels: Manrope (The Functional Voice)
A clean, high-legibility sans-serif for reading "Outing Records" and navigation.
- **Creative Direction:** Always use `body-lg` (1rem) for user-generated content to ensure the "diary" feel is legible.
- **Scale:** `label-md` (0.75rem) for metadata (dates, tags).

---

## 4. Elevation & Depth: Tactile Layering
Forget standard drop shadows. We define depth through **Tonal Layering** and **Irregular Geometry**.

- **The Layering Principle:** Stack `neutral_color_hex` (White) cards on top of `secondary_color_hex` (Pink) backgrounds. This creates a natural "paper on desk" lift.
- **The "Wobbly" Border:** Every card, button, and modal must feature a thick (2px to 3px) border using `primary_color_hex`. These should not be perfectly geometric; use SVG masks or border-radius variations (e.g., `40% 60% 70% 30% / 40% 50% 60% 40%`) to create a hand-drawn, "blob" effect.
- **Ambient Depth:** If a floating element (like a FAB) requires a shadow, use `on_surface` at 6% opacity with a massive 40px blur. It should look like a soft cloud, not a hard shadow.

---

## 5. Components: Custom Primitive Styling

### The Signature "Blob" Card
- **Background:** `neutral_color_hex` (#FFFFFF).
- **Border:** 3px Solid `primary_color_hex` (#1B1B1B).
- **Shape:** Use the `lg` (2rem) or `xl` (3rem) roundedness scale, but apply it asymmetrically.
- **Content:** No internal dividers. Use `spacing-6` (2rem) to separate the title from the body text.

### Buttons (The "Sticker" Feel)
- **Primary:** `secondary_color_hex` background, 2.5px black border, `title-md` text. On hover, the button should shift 4px up and right, with a solid black "block shadow" appearing behind it.
- **Secondary:** `tertiary_color_hex` background, 2.5px black border.
- **FAB (Add Entry):** Large circular `full` radius, `primary_color_hex` background with a white icon. It should look like a "stamp" on the page.

### Outing Records (The Single-Column List)
- **Structure:** Vertical stack using `spacing-8`. 
- **Visuals:** Each entry is a white card with an irregular border. 
- **Editorial Touch:** Use `label-sm` for dates, placed vertically or rotated -5 degrees to mimic a scrapbook sticker.

### Input Fields
- **Style:** 2px solid black border, `neutral_color_hex` background.
- **Focus State:** Background shifts to `secondary_color_hex` (Pink) to provide high-contrast feedback.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace Asymmetry:** If a layout feels too "perfect," nudge a card 5px or change a border-radius.
- **Use Large Whitespace:** Let the `display-lg` typography breathe. Give headers room to dominate the screen.
- **Intentional Overlap:** Allow a "Blob" card to slightly overlap a section transition to create a collage effect.

### Don't:
- **Don't use 1px Borders:** Never use thin, grey lines for anything. It breaks the "Kitsch" aesthetic.
- **Don't use Standard Grids for Records:** The "Outing Records" must be a focused, single-column feed. Grid layouts are reserved for Quizzes only.
- **Don't use Generic Icons:** Icons should be thick-stroked and match the "ink" weight of the typography. Avoid thin, wireframe icon sets.
- **Don't use Pure Grey:** Use the `surface_variant` or `surface_dim` tokens for "grey" areas to ensure they remain within the warm/pink tonal family.

---

## 7. Interaction Patterns
- **Hover:** Interactive elements should "grow" or "tilt" (rotate 1-2 degrees).
- **Loading:** Use a pulsating "Blob" shape in the center of the screen using the `secondary` (#924469) color.
- **Transitions:** Page transitions should feel like a "slide" or "page turn" to reinforce the diary metaphor.
