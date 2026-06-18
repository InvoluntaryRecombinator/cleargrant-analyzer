# ClearGrant Analyzer UI/UX & Engine Overhaul Spec

## 1. Core Visual System & Typography Scale
* **Branding & Core Layout Shell:**
    * Re-implement the dark, solid block logo container in the global navigation shell. The top-left corner must display a high-contrast dark slate square background containing bold white uppercase `CG` initials.
    * Establish a global dual-tone background canvas. Use an off-white cream background canvas (`#faf8f3`) for page wrappers, contrasting with clean white surfaces (`#ffffff`) for form panels and dashboard grids.
    * Navigation link interactions must use a precise, zero-border state accent. Active routes must utilize deep slate text weight, underscored by a crisp, 2px seafoam green or muted teal line directly below the navigation element.
* **Data Density & Typography Guidelines:**
    * Forms, table cells, and list items must enforce dense vertical padding rules (`py-2` to `py-3` max). Elements must remain tightly grouped.
    * Monospaced typography arrays (`font-mono`) must be explicitly targeted to numeric layouts, award metrics, ISO dates, legal registration keys, and raw schema objects to maximize clarity.

## 2. Grid-Bounded Matrix Dashboard
* **Column Contraining & Wrapping Rules:**
    * Discard the fluid-width table configuration. The Matrix Dashboard must use explicit, set column grid limits or a strict layout specification (`table-layout: fixed`).
    * Enforce max-width bounds on text heavy arrays. The `Primary Reason` column must occupy a precise proportion of the layout viewport, wrapping string blocks cleanly or executing an elegant, user-triggered expansion toggle.
* **Dual-Tone Semantic Badging:**
    * Match classifications must render as distinct, low-saturation background capsules featuring high-saturation typography overlays:
        * `High Match`: Pale sage green background canvas paired with crisp, deep forest-green text.
        * `Needs Review`: Pale warm amber background canvas paired with dark bronze text.
        * `Extraction Failed`: Soft, pale rose background canvas paired with deep crimson text.
* **Metric Row Alternation:**
    * The Matrix row presentation must integrate alternating line shading (`odd:bg-white`, `even:bg-slate-50/50`) bounded by fine, clean border lines (`border-slate-200/60`).

## 3. Clear Extraction Profile Form Layout
* **Multi-Column Grids:**
    * Checkbox sets (Focus Areas, Populations Served, Project Types) must break down into structured, symmetrical multi-column configurations (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
    * Replace sprawling plain selectors with structured input groupings. Form field sections must feature subtle horizontal grid borders to anchor content blocks.

## 4. Automation & Testing Invariants
* **Heheadless Regression Loop:**
    * Any auxiliary component helper functions, string normalizers, or layout data transformations must execute clean test passes via Vitest.
    * Failing and passing test outputs must pipe explicitly to `docs/tdd/logs/` prior to triggering version control updates.