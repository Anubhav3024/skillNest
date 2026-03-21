# Design System Specification

## 1. Overview & Creative North Star
### Creative North Star: "The Intellectual Sanctuary"
This design system moves beyond the "utilitarian classroom" aesthetic of traditional LMS platforms to create an environment that feels like a high-end digital atelier. We transition away from rigid grids and clinical borders toward a "layered editorial" experience. By utilizing a sophisticated palette of deep botanical greens and soft teals, we establish a dual-persona UI: **Authoritative** for educators through high-contrast typography and structured data, and **Immersive** for students through glassmorphism and fluid transitions.

The "template" look is intentionally broken through:
*   **Asymmetrical Balance:** Hero sections and dashboards utilize offset text and image pairings.
*   **Tonal Depth:** Surfaces are defined by color shifts rather than lines.
*   **Editorial Scale:** Drastic contrast between `display-lg` headlines and tight `label-sm` metadata.

---

## 2. Color & Surface Philosophy
The palette is rooted in a vibrant, sophisticated teal (`primary: #049fb4`) and supported by muted, versatile neutrals.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or cards. 
*   **Constraint:** Boundaries must be established solely via background shifts.
*   **Execution:** Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#eff5f2) background to create definition. If a section needs more prominence, use `surface_container_high` (#e3eae7).

### Surface Hierarchy & Nesting
Treat the interface as physical layers of stacked fine paper.
*   **Level 0 (Base):** `surface` (#f5fbf8) — The foundation of the page.
*   **Level 1 (Sections):** `surface_container` (#e9efec) — Used for sidebar backgrounds or content grouping.
*   **Level 2 (Cards):** `surface_container_lowest` (#ffffff) — Used for high-priority interactive elements.

### The Glass & Gradient Rule
To achieve a premium "Dribbble-inspired" finish:
*   **Floating Elements:** Use `surface_variant` at 60% opacity with a `20px` backdrop-blur for navigation bars or floating action menus.
*   **Signature Gradients:** For primary CTAs and Progress Bars, transition from `primary` (#049fb4) to `primary_container` (#318266) at a 135-degree angle to provide "soul" and depth.

---

## 3. Typography
We use a high-contrast pairing of **Manrope** for expression and **Inter** for utility.

*   **Display & Headlines (Manrope):** The "Voice." Used for course titles and dashboard welcomes. Manrope’s geometric yet warm nature provides an authoritative editorial feel. 
    *   *Scale Example:* `display-lg` (3.5rem) should be used for hero statements with tight letter-spacing (-0.02em).
*   **Body & Labels (Inter):** The "Engine." Used for course content, form inputs, and descriptions. Inter provides maximum legibility at small sizes.
    *   *Hierarchy Tip:* Use `label-md` in all-caps with 0.05em tracking for category tags (e.g., "ADVANCED MATH") to distinguish them from body copy.

---

## 4. Elevation & Depth
Traditional drop shadows are largely replaced by **Tonal Layering**.

*   **Ambient Shadows:** If an element must "float" (like a dropdown or modal), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(4, 159, 180, 0.06);`. Note the use of a tinted shadow (using the Primary color) rather than neutral black to maintain a sophisticated atmosphere.
*   **The "Ghost Border" Fallback:** For accessibility in forms, use the `outline_variant` token at **20% opacity**. Never use 100% opaque borders.
*   **Corner Radii:** Use the `xl` (1.5rem) scale for large dashboard cards and `md` (0.75rem) for inner nested elements like buttons or thumbnails. This creates a "parent-child" visual relationship.

---

## 5. Components

### Buttons & CTAs
*   **Primary:** A gradient fill (Primary to Primary-Container) with `on_primary` text. No border. Radius: `full`.
*   **Secondary:** `secondary_container` fill with `on_secondary_container` text.
*   **Tertiary:** Ghost style. No fill, no border. Use `primary` text weight 600.

### Course Cards & Listings
*   **Structure:** Prohibit divider lines. Use `spacing.6` (1.5rem) as a vertical gutter between content blocks.
*   **Progress Bars:** Use a `surface_container_highest` background track with a `primary` gradient fill. Height should be a slim `4px` to remain elegant.
*   **Thumbnails:** Always apply a `1rem` (lg) radius.

### Input Fields & Forms
*   **Styling:** Fill fields with `surface_container_low`. On focus, transition the background to `surface_container_lowest` and add a `2px` "Ghost Border" using the `primary` color at 40% opacity.
*   **Micro-copy:** Use `body-sm` for helper text, colored with `on_surface_variant`.

### Data Visualization (Dashboards)
*   **Stats:** Use `display-sm` for the metric and `label-md` (bold) for the description. 
*   **Charts:** Use `tertiary` (#505e65) for axis lines and `primary` for the data series. Avoid high-contrast black lines.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** use asymmetrical white space to lead the eye toward primary actions.
*   **Do** use `surface_container` variants to separate the "Educator Side" (darker, more structured) from the "Student Side" (lighter, more airy).
*   **Do** apply `backdrop-blur` to modals to maintain the "The Intellectual Sanctuary" vibe.

### Don’t:
*   **Don't** use a 1px solid #000 border for any reason. Use tonal shifts.
*   **Don't** use standard "drop shadows." Use ambient, tinted blurs or nothing at all.
*   **Don't** use "pure black" (#000000) for text. Use `on_surface` (#171d1b) to maintain a premium, ink-like feel.
*   **Don't** crowd the layout. If in doubt, increase the spacing to the next tier in the scale (e.g., move from `spacing.8` to `spacing.12`).