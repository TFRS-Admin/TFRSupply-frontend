# Design System & Layout Consolidation Foundation

## Purpose

Every customer-facing surface built so far (Homepage, Search, Product Detail, Guided Upfit Builder, Fleet Projects, Fleet Templates, Fleet Intelligence, Workspace, Project Quote, Procurement Packages, Compare, Saved Products, Recently Viewed) was built independently, page by page. Each one hand-rolled its own `<h1>` sizing, its own `background:'#fff',border:'1px solid #e5e7eb'` card shell, its own empty-state paragraph, and its own status pill colors. None of that is wrong on any single page — but multiplied across a dozen pages it means the same visual decision (card padding, badge color, breakpoint) was made a dozen times, independently, and drifted a little each time.

This is **not** a new feature and **not** a rewrite. It is a shared vocabulary — layout primitives, a spacing scale, a status color system — that the existing pages now speak, so the next page (and the next agent, human or otherwise) doesn't have to reinvent a card shell to add one. Business logic, state, contexts, routing, and domain modules are untouched; only presentation was consolidated.

## Design Philosophy

- **One shell, everywhere.** Every page is `PrototypeBanner → SiteHeader → breadcrumb → content → PrototypeFooter`. That's `PageLayout`. No page should assemble those five pieces by hand again.
- **Reuse over rebuild.** The brand's actual visual language (navy `#1a2744`, red `#c8102e`, the Roboto/Inter stack, 4–8px radii) already existed, consistently, across every page's inline styles — it just wasn't named. The design system names it; it does not replace it with a new palette.
- **Presentational only.** No primitive in `src/components/design-system/` reads a context, calls a service, or owns business state. Every one takes plain props and renders. Pages keep 100% of their data-fetching, handlers, and domain composition — only the JSX they return changed.
- **Standard page hierarchy.** Header → Summary → Primary Actions → Main Content → Supporting Panels → Related Information. `PageHeader` covers Header/Summary/Actions; `PageSection` and `DataPanel` cover the rest.
- **A status is a status.** "Complete," "Ready," and "Compatible" all mean the same thing (green) no matter which feature renders them. `StatusBadge` is the single source of that mapping.
- **Consolidate the shell, not every pixel.** Deeply specialized widgets (the Compare page's transposed product-comparison grid, the Guided Upfit Builder's three-column stepper) keep their bespoke markup where forcing them into a generic primitive would either break an existing CSS contract (see below) or genuinely reduce clarity. The primitives are a toolbox, not a mandate to flatten every layout into the same shape.

## Component Hierarchy

```text
src/components/design-system/
├── tokens.js          Font stack, status → tone map, Tailwind class tables
├── index.js           Barrel export — import from '@/components/design-system'
│
├── PageLayout.jsx      Banner + SiteHeader + breadcrumb + container + Footer
├── PageHeader.jsx      Eyebrow + <h1> + description + actions row + summary slot
├── PageSection.jsx     Titled, evenly-spaced content block within a page
├── SectionToolbar.jsx  Right-aligned action row for a section/panel header
│
├── DataPanel.jsx        The one bordered white card shell (header/body/footer slots)
├── StatCard.jsx         Compact KPI tile (icon + label + one value + caption)
├── MetricCard.jsx       Larger rollup tile with an optional trend indicator
├── InfoCard.jsx         Icon + title + description, non-interactive
├── ActionCard.jsx       Whole-card navigation tile (image/icon, hover, disabled state)
├── EmptyState.jsx       Icon + headline + description + primary/secondary CTA
│
├── SplitPanel.jsx       Main content + sidebar, side-by-side ≥lg, stacked below
├── StickySidebar.jsx    Sticky-on-desktop wrapper for a SplitPanel sidebar
├── PropertyGrid.jsx     Responsive label/value grid (spec sheets, summaries)
├── ResponsiveTable.jsx  One table, two renderings: real <table> ≥md, stacked cards <md
├── Timeline.jsx         Vertical step list with a status-colored connector
├── ProgressRing.jsx     Circular percent-complete indicator
├── StepBadge.jsx        Numbered step circle for wizard/stepper UIs
│
├── StatusBadge.jsx      The unified status pill (see Status System below)
└── CTAButton.jsx        Polymorphic Link/anchor/button — primary/secondary/outline/ghost
```

Import from the barrel: `import { PageLayout, PageHeader, DataPanel, StatusBadge } from '@/components/design-system';`

### How the pieces compose

```text
<PageLayout>                          banner + header + breadcrumb + footer
  <PageHeader/>                       Header + Summary + Primary Actions
  <PageSection>                       Main Content (repeatable)
    <DataPanel/> <DataPanel/> ...        or <StatCard/>/<MetricCard/> grids
  </PageSection>
  <PageSection>                       Supporting Panels
    <ResponsiveTable/> / <PropertyGrid/>
  </PageSection>
  <EmptyState/>                       ...instead of any of the above, when there's nothing to show
</PageLayout>
```

`SplitPanel` + `StickySidebar` replace the `PageSection` tier when a page is fundamentally two columns (a stepper's main content + a summary rail) rather than a stack of sections.

## Layout Primitives

**`PageLayout`** — `{ crumbs, activeVertical, activeCategory, background, contentClassName, maxWidth, fullBleed, beforeContent, children }`. `background="subtle"` (the `#f4f5f7` dashboard tone — Workspace, Project Quote, Procurement, Guided Upfit Builder) or `"white"` (catalog-style pages — Product Detail, Search, Homepage, Compare, Saved Products). `fullBleed` skips the `max-w-7xl` container for pages whose sections manage their own width band-by-band (Product Detail, Homepage). `beforeContent` renders full-width content between the breadcrumb and the container — the Guided Upfit Builder's sticky mobile progress bar uses this.

**`PageHeader`** — `{ eyebrow, title, description, actions, children }`. `children` renders below the description as a page-level summary strip (a row of `StatCard`s, for example) — that's the "Summary" tier of the standard hierarchy.

**`PageSection`** / **`SectionToolbar`** — a titled, evenly-spaced block with an optional eyebrow-style title and a right-aligned toolbar. Replaces the `<section style={{marginBottom:32}}>` + hand-built flex header every page repeated for "Saved Products," "Recently Viewed," and similar named blocks.

**`SplitPanel`** / **`StickySidebar`** — `SplitPanel({ main, sidebar, sidebarPosition, sidebarWidth })` stacks below `lg`, sits side-by-side above it. Wrap `sidebar` in `StickySidebar` for a sticky rail under the sticky `SiteHeader` (offset via `topClassName`, default `lg:top-24`).

## Card Family

All four card types share the same 8px radius, `border-gray-200`, and `shadow-sm`/hover treatment — the specific choice is about *what* the card is for, not how it's styled:

| Component | Use it for | Example |
| --- | --- | --- |
| `DataPanel` | A generic bordered container with an optional header/footer | Workspace's "Cart Summary" tile, Quote Items' "Grouped Equipment Summary" |
| `StatCard` | One compact fact — icon, label, one value, optional caption | A cart subtotal, a vehicle count |
| `MetricCard` | A bigger headline number for a whole section, with an optional trend | A dashboard summary bar's KPI |
| `InfoCard` | Icon + title + description, not clickable | Homepage's "Why TFR Supply" trust points |
| `ActionCard` | The whole card is a link/button — image, hover, disabled ("Coming Soon") state, optional `StatusBadge` | Homepage's "Shop by Vertical" / "Featured Categories" tiles |

`padding`: `"none" | "compact" | "default"` on `DataPanel` — `"compact"` (16px) for dense dashboard grids, `"default"` (20–24px) everywhere else.

## Status System

One map, `STATUS_TONE` (`design-system/tokens.js`), resolves any status word to one of five tones — the same five colors every hand-rolled readiness/completion pill in the app already happened to use (Tailwind's own `green-100/800`, `amber-100/800`, `red-100/800`, `indigo-100/800`, `slate-100/700`):

| Tone | Status words | Meaning |
| --- | --- | --- |
| `success` | `complete`, `completed`, `ready`, `compatible`, `operational`, `active`, `approved` | Done, good to go |
| `info` | `in_progress`, `pending`, `needs_review`, `review` | Underway, informational |
| `warning` | `needs_attention`, `recommended`, `incomplete`, `minor_issues` | Worth a look, not blocking |
| `danger` | `required`, `missing`, `incompatible`, `blocked`, `unavailable`, `error` | Blocking or negative |
| `neutral` | `optional`, `archived`, `draft`, `unassigned`, `disabled` | Inactive, informational only |

`<StatusBadge status="needs_attention" />` renders a humanized label ("Needs Attention") in the mapped tone automatically; pass `label` to show different text in the same resolved tone (e.g. a domain object's own `readiness.label`), or `tone` to force a tone the status word doesn't imply. Unrecognized statuses fall back to `neutral` rather than throwing.

`QuoteReadinessBadge`, `PackageReadinessBadge`, and `StandardTierChip` (Required/Recommended/Optional) now render through `StatusBadge` internally — their existing prop APIs (`{ readiness, compact, showReasons }` / `{ tier, compact }`) are unchanged, so every existing call site kept working. `FleetBuildCompletionBadge` intentionally still renders its own inline-styled pill: a test asserts its output contains the literal hex color (`#dcfce7`/`#fef3c7`/`#fee2e2`), which a Tailwind-class-based rewrite would no longer produce in server-rendered HTML. Its colors already match the same green/amber/red tones `StatusBadge` uses — it just isn't wired through the shared component.

## Responsive Table

`ResponsiveTable` is the one reusable table component (used today by Project Quote's Grouped Equipment Summary). Give it `columns` (`{ key, label, align, render(row), hideOnMobile, headerClassName, cellClassName }`) and `rows`; it renders a real `<table>` at `md` and above and stacked label/value cards below `md` from the same data — a table is defined once and never hand-duplicated into a second mobile layout.

It is deliberately **not** used for the Compare page's product-comparison grid or the Guided Upfit Builder's stepper: those are transposed (products-as-columns, not rows-as-records) or already have a hard test contract on their exact `className` (`class="hidden md:block"` / `class="md:hidden"`, asserted verbatim by `tests/product-comparison-selection.test.mjs`) tied to the same breakpoint convention `ResponsiveTable` itself uses internally. Forcing a generic component onto a shape it wasn't designed for isn't consolidation, it's a rewrite — see Card Consistency's mandate to reuse rather than redesign.

## Spacing & Typography Scale

No new scale was invented — Tailwind's default spacing scale (4px increments: `1`=4px, `2`=8px, `3`=12px, `4`=16px, `5`=20px, `6`=24px, `8`=32px) is used throughout every new primitive, matching the `px`/`padding` values the hand-rolled inline styles already converged on independently.

| Token | Use |
| --- | --- |
| `gap-2` / `gap-3` | Icon-to-label, chip rows |
| `gap-4` | Card grids, form rows |
| `gap-6` | Section-to-section, `SplitPanel` columns |
| `mb-8 sm:mb-10` | Between major page sections (`PageSection` default) |
| Card padding | `compact` = `p-4`, `default` = `p-5 sm:p-6` |

Typography: page titles (`PageHeader`'s `<h1>`) are `clamp(1.5rem,3vw,2rem)` font-black in `text-ink`, matching every existing page's hand-set clamp. Section eyebrows are `text-[13px] font-bold tracking-wide uppercase text-ink`. Body copy is `text-sm text-gray-600`. This mirrors, rather than replaces, the sizes every page already used.

## Responsive Rules

Every primitive is built mobile-first against the same four required widths (390 / 768 / 1024 / 1440):

- **390px (mobile):** single column. Card grids collapse to `grid-cols-1` or `grid-cols-2` for small tiles (product cards); `ResponsiveTable` renders stacked cards instead of a table; `SplitPanel` stacks the sidebar below the main content; `StickySidebar` becomes static (no sticky positioning below `lg`).
- **768px (tablet):** two-to-three column card grids (`sm:grid-cols-2`/`sm:grid-cols-3`); `ResponsiveTable` switches to its real `<table>` rendering at `md`.
- **1024px+ (desktop):** `SplitPanel` goes side-by-side (`lg:flex-row`); `StickySidebar` activates its sticky offset; three-to-five column grids where content supports it.
- **1440px:** content is capped at `max-w-7xl` (1280px) and centered — no primitive stretches full-bleed at this width except explicitly `fullBleed` page sections (hero bands, CTA bands).

## Accessibility

- **Touch targets:** `CTAButton` enforces `min-h-[44px]` on every variant; `TextButton`/`TextLink`-style inline actions across converted pages carry the same minimum.
- **Focus states:** `CTAButton` and `ActionCard` both set `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink` — visible keyboard focus, not just a browser default outline.
- **Heading hierarchy:** `PageHeader` always renders exactly one `<h1>` per page. `EmptyState` defaults to `<h2>` (it's usually one block within a page that already has its own `<h1>`) but accepts `headingLevel="h1"` for pages where the empty state *is* the entire page content (Saved Products, Compare) — never a second, competing `<h1>`.
- **Color contrast:** every `StatusBadge` tone pairs a `-100` background with an `-800` (or `-700`) foreground — WCAG AA for the pill's own text at that size.

## Applied To

Page shells converted to `PageLayout`/`PageHeader`/`PageSection` in this pass: **Workspace**, **Project Quote**, **Procurement**, **Guided Upfit Builder**, **Product Detail**, **Homepage**, **Search**, **Compare**, **Saved Products**. Status badges (`QuoteReadinessBadge`, `PackageReadinessBadge`, `StandardTierChip`) now render through `StatusBadge`. `PropertyGrid` replaced Product Detail's raw specifications `<table>`. `ResponsiveTable` replaced Project Quote's Grouped Equipment Summary table. `ActionCard`/`InfoCard` replaced Homepage's vertical-navigation, featured-category, and trust-point cards.

Every page's own domain composition (context reads, `src/domain/*` calls, handlers passed down to child sections) is untouched — only the JSX each page's view function returns changed. Deeply nested feature components (`components/fleetQuote/*`, `components/procurementPackages/*`, `components/upfitBuilder/*`, `components/fleetBuilds/*`, `components/product/*` beyond what's listed above) were left as-is in this pass; they're valid candidates for the same primitives in a follow-up, but converting dozens of already-shipped, independently-tested components in one pass was judged higher-risk than value for this foundation issue.

## QA

`npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` all pass against this change set. Manual verification at 390/768/1024/1440px covered the nine converted pages for horizontal overflow, card/table responsiveness, and typography hierarchy.
