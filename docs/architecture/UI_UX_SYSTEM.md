# UI/UX System Specification

## Purpose

This document is the master reference for TFRSupply's visual direction, layout rules, component conventions, responsive behavior, and interaction patterns. It exists so that every future feature — commerce, fleet, workspace, or admin — reads as one product rather than a collection of independently-styled pages.

This is a **documentation-first, describe-what-exists** specification. It does not rewrite any page, introduce a new component library, or change routes, contexts, services, or business logic. Every pattern below is drawn directly from the shipped codebase (file and line citations are given wherever a concrete convention is described) and from the architecture docs listed in "Reference Documents." Where the codebase contains inconsistencies or gaps, this document names them explicitly in **Future Design-System Backlog** rather than papering over them with an idealized rule nobody is following yet.

### Reference Documents

This spec composes, and should be read alongside, the following existing docs — it does not duplicate their service/state architecture, only their **UI surface**:

| Doc | UI surface it defines |
| --- | --- |
| `PROJECT_WORKSPACE.md` | `/workspace` dashboard composition |
| `PRODUCT_DETAIL_EXPERIENCE.md` | Product detail page composition |
| `GUIDED_UPFIT_BUILDER.md` | `/upfit-builder` wizard layout |
| `FLEET_INTELLIGENCE.md` | Department Standards, Fleet Health, Product Intelligence UI |
| `FLEET_QUOTE_BUILDER.md` | `/project-quote` workspace layout |
| `FLEET_PROCUREMENT_PACKAGES.md` | `/procurement` workspace layout |
| `PRODUCT_DISCOVERY.md` | `/search` page, `ProductCard`/`ProductSearchBar`/`ProductFilterPanel` |
| `COMMERCE_FOUNDATION.md` | Commerce/Shopify adapter boundaries surfaced as read-only UI panels |

**A note on "the Design System foundation."** At the time this document was written, no `docs/architecture/DESIGN_SYSTEM.md` exists in this repository, and no uploaded visual-reference files (mockups, mood boards, screenshots) were found in the repo. This document was therefore built by directly auditing the shipped `src/index.css`, `tailwind.config.js`, `src/components/ui/` (shadcn primitives), and the real page/component code that ships today — the closest thing to a "visual reference" currently in the repository is the homepage redesign shipped in `3b1403f` ("Redesign homepage for storefront conversion," issue #066). See **Visual Reference Interpretation** and **Future Design-System Backlog** for what this means going forward.

---

## Design Philosophy

TFRSupply is a **catalog-and-configuration tool wearing storefront clothing**. Customers are fleet managers, upfitters, and public-safety procurement officers — not impulse shoppers. The product therefore favors:

- **Density and legibility over decoration.** Tables, badges, and completion percentages carry more product weight than imagery. White backgrounds, 1px borders, and small type sizes dominate everything past the homepage.
- **Honesty over polish.** Several read-only integration panels (Storefront readiness, commerce availability, fitment compatibility) deliberately render an honest "not ready" / "unknown" state rather than a fabricated success state, because their backing adapters are intentionally unavailable until a later issue connects them (`COMMERCE_FOUNDATION.md`). The UI must keep communicating this honestly — a locked-down "coming soon" look, not a fake green checkmark.
- **Guidance, never a hard gate.** Every wizard, completion badge, and "missing equipment" indicator is advisory. `GUIDED_UPFIT_BUILDER.md`'s "Continue Anyway" convention is a platform-wide rule, not a one-feature choice: nothing in TFRSupply should block a customer from proceeding just because a recommendation is unmet.
- **One brand-forward layer, one utility layer.** The homepage, vertical landing pages, and category hero bands are the "storefront" layer (dark bands, brand red, large type). Everything a logged-in-feeling customer touches after that — search results, product detail, workspace, quote builder, procurement — is the "utility" layer (white background, small type, tables, badges). Both layers share the same brand red/navy accent vocabulary; they differ in density, not in palette.

## Brand Direction

The actual, shipped brand palette is **not** the shadcn/ui HSL token set wired into `tailwind.config.js` — see the callout in **Future Design-System Backlog**. The real brand vocabulary, taken directly from the pages customers see, is:

| Role | Value | Where it's used |
| --- | --- | --- |
| Brand red (primary action / accent) | `#c8102e` (hover `#a50d25`) | Primary CTA buttons, active-card borders, link hover color, the 1px hero bottom accent bar |
| Deep navy (secondary / dark band) | `#1a2744` | Category hero band, secondary/outline button border+text, "Optional" tier chip |
| Homepage navy (darkest band) | `#0d1b2e` | Homepage hero background |
| Marketing black band | `#111` | Vertical landing hero background |
| Neutral border | `#e5e7eb` (Tailwind `gray-200`) | Card borders, table dividers, breadcrumb bar border |
| Neutral surface | `#f9fafb`/`gray-50` | Breadcrumb bar background, subtle section backgrounds |
| Body text | Tailwind `gray-900`/`700`/`600`/`500`/`400` (a five-step gray ramp) | Nearly all body copy, in descending emphasis order |

Typography carries brand identity more than color does:

- **Oswald** (400/500/600/700) — `--font-heading` / `--font-display` (`src/index.css:1,34,36`) — condensed, bold, all-caps-friendly. Used for hero headlines and section headings — it is the platform's "shout" typeface.
- **Inter** (300–700) — `--font-body` (`src/index.css:35`) — all body copy, labels, table text, form inputs.
- **JetBrains Mono** — `--font-mono` (`src/index.css:37`) — reserved for SKU/part-number-style values (used sparingly today).

**Icon language:** `lucide-react` exclusively (`package.json`). No other icon set should be introduced without a documented reason — a second icon library is a common source of visual drift.

## Visual Reference Interpretation

No uploaded mockups or moodboards accompanied this issue, and no `DESIGN_SYSTEM.md` foundation doc exists yet to interpret. In its place, this section documents the closest thing the repository has to an intentional visual reference: the homepage (`src/pages/StoreLanding.jsx`, redesigned in issue #066) and the shared hero/section patterns it established. Treat this section as the seed of a future "visual reference" gallery, not a substitute for one.

The homepage redesign establishes three repeating motifs that this document treats as platform-wide conventions (see **Hero Patterns**):

1. **The 1px red bottom accent bar** on every marketing hero (`StoreLanding`, `CategoryTemplate`, `VerticalHero`) — the single strongest piece of brand identity in the UI. Any new hero-style banner should carry it.
2. **Dark-band-with-low-opacity-image** hero backgrounds (`opacity-20`/`opacity-25`/`opacity-40` image layers over a navy/black fill, never a full-strength photo). This keeps headline text legible without a separate scrim component.
3. **Red-primary / navy-outline** two-button CTA pairing (e.g. "Shop All Products" filled red + "Configure Your Equipment" white-outline) as the default hero CTA shape — one committed action, one exploratory action.

**Recommendation:** when real visual references (brand guidelines, competitor teardown, Figma files) become available, add them under `docs/architecture/assets/` and link them from this section rather than restating them inline — do not let this document become the dumping ground for raw image assets.

## Page Hierarchy

TFRSupply pages fall into four tiers, each with a distinct visual density (see **Design Philosophy**):

1. **Marketing / Landing** — `/` (`StoreLanding`), `/police`, `/fire`, `/work-truck` (vertical landings via `VerticalLandingTemplate`), `/:verticalId/:categoryId` (`CategoryTemplate`). Dark-band heroes, trust bands, featured grids.
2. **Discovery / Commerce** — `/search`, `/compare`, `/saved-products`, `/:verticalId/:categoryId/:productId` (product detail). White background, cards and specs dominate, hero is functional rather than promotional.
3. **Workspace / Planning** — `/workspace`, `/upfit-builder`, `/project-quote`, `/procurement`. Dense, dashboard-like: summary stat rows, section cards, tables, completion badges. No marketing chrome at all.
4. **Admin / Developer** — `/admin/*`, `/dev/storefront`, `/showcase`. Utility-only; no brand styling requirement beyond legibility. These pages are explicitly out of scope for brand polish and should stay that way — do not spend design effort here beyond function.

New pages must declare which tier they belong to before any layout decision is made; mixing tier conventions on one page (e.g. a dark marketing hero atop a workspace table) is the single most common way this platform's visual consistency breaks.

## Layout System

- **Container width:** `max-w-7xl mx-auto px-4` (or `px-6`) is the dominant content-width convention across marketing and discovery pages (`ProductBreadcrumb.jsx`, `CategoryTemplate.jsx`, `ProductHero.jsx`). Workspace pages (`WorkspaceDashboard`, `ProjectQuotePage`, `ProcurementPage`) use the same convention at the page-shell level, then subdivide internally with card grids.
- **No CSS Grid framework beyond Tailwind's `grid-cols-*` utilities.** Layout is composed with flexbox (`flex`, `gap-*`) for one-dimensional rows and `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for card/summary grids (`PROJECT_WORKSPACE.md`'s Mobile Layout section). Do not introduce a second grid system (CSS Grid template areas, a third-party layout library) without a documented reason.
- **Sidebars are flex siblings, not overlays**, on desktop — see **Sidebar System**.
- **No fixed pixel page widths.** Every documented mobile-safe feature (`PROJECT_WORKSPACE.md`, `GUIDED_UPFIT_BUILDER.md`) explicitly calls out "no fixed pixel widths are used in the layout" as a verified constraint. Fixed pixel widths are reserved for **sidebar rails only** (see **Sidebar System**) — never for a page's main column.
- **Breakpoints are Tailwind's defaults** (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px) — `tailwind.config.js` does not override `theme.screens`. Do not introduce a custom breakpoint for a single feature; use the existing scale.

## Hero Patterns

Two distinct hero archetypes exist today. Both must keep their existing shape — do not merge them:

**1. Marketing Hero** (`StoreLanding` homepage hero, `CategoryTemplate`'s category band, `VerticalHero`) — dark navy/black fill, a low-opacity image layer (`opacity-20`–`opacity-40`), an eyebrow label in brand red uppercase, a large Oswald headline, optional CTA pair, and the signature 1px `#c8102e` bottom accent bar. Heights vary by context (homepage: viewport-flexible; category: `minHeight: 220`; vertical landing: `minHeight: 380`) but the visual formula is identical.

**2. Functional Hero** (`ProductHero.jsx`) — white background, no dark band, no accent bar. A two-column layout (image gallery ~60%, info panel ~40%) with the product name as a plain black `<h1>`, not a marketing headline. This is intentional: a product detail page is a reference surface, not a persuasion surface.

**Rule:** a new page must pick one archetype based on its **Page Hierarchy** tier (Marketing → Marketing Hero; Discovery/Workspace → Functional Hero or no hero at all — most workspace pages use a plain header row instead of a hero, see **Dashboard System**). Never invent a third hero shape.

## Section Rhythm

The homepage establishes the platform's only "long-scroll marketing page" rhythm, and it is deliberate — personalization first, discovery second, trust third, conversion last:

```
Hero
→ Saved Products (only if the customer has any — hidden otherwise)
→ Recently Viewed (same rule)
→ "Shop by Vertical" card grid
→ Featured Categories grid (conditional on data)
→ Featured Products grid (conditional on data)
→ "Why TFR Supply" trust band (4-column icon cards)
→ Red CTA band (phone / resources)
→ Footer
```

Category and vertical landing pages follow a shorter version of the same rhythm: hero → breadcrumb → filter/product grid, with no trust band or secondary CTA band. **Do not add a trust band or secondary CTA band to any page below the homepage** — it is a homepage-only, first-impression device, not a section any page can request.

## Card System

No page-level UI in this codebase uses the shadcn `Card` primitive (`src/components/ui/card.jsx`) — it exists but is unused outside `src/components/ui/` itself. Every real card (`ProductCard.jsx`, `FleetBuildCard.jsx`, `FleetProjectCard.jsx`, `PackageSummaryCard.jsx`, `WorkspaceDashboard`'s `.workspace-card`) is a hand-styled `<div>` following one consistent convention instead:

- **Border:** `1px solid #e5e7eb`, becoming `2px solid #c8102e` when the card represents the "active" item (active Fleet Build, active Fleet Project).
- **Radius:** `4px` (`borderRadius: 4`) — noticeably tighter than the shadcn primitive's `rounded-xl`. `ProductCard` is the one exception, rendering square corners entirely.
- **Background:** white, switching to a tinted background for state (`#fff8f8` active, `#fafafa` archived) rather than a border-color-only change.
- **No box-shadow anywhere.** Elevation is communicated by border color/weight, never shadow.
- **Hover feedback** is a border-color swap (`#e5e7eb` → `#c8102e`), not an elevation or scale change.

**Rule for new cards:** reuse this hand-rolled convention (1px `#e5e7eb` border / 4px radius / white surface / red-border active state) rather than reaching for the shadcn `Card` primitive, until a dedicated design-system issue formally migrates the whole app onto it (see **Future Design-System Backlog**). Introducing `rounded-xl`/shadow cards next to the existing 4px/borderless convention on the same page is the fastest way to make a feature look bolted-on.

## Dashboard System

`WorkspaceDashboard` (`/workspace`), `ProjectQuotePage` (`/project-quote`), and `ProcurementPage` (`/procurement`) share one dashboard shape:

1. A **stat/summary row** at the top (Workspace's Selected Vehicle / Cart Summary / Compare Queue / Recent Configurations / Quote Builder / Keep Building cards, in a `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` grid; Procurement's Package Count/Ready/Minor Issues/Needs Review/Blocked bar).
2. A **fixed, documented vertical order of full-width sections** beneath it, each independently reading its own context/hook. `WorkspaceDashboard.jsx`'s actual composed order is:

   ```
   Summary card grid (Vehicle, Cart, Compare, Configs, Quote shortcut, Keep Building)
   → WorkspaceFleetIntelligenceSection ("Fleet Readiness")
   → RecommendedNextActionsSection
   → FleetProjectsWorkspaceSection
   → DepartmentStandardsSection
   → GuidedUpfitBuilderWorkspaceSection
   → ProjectQuoteWorkspaceSection
   → ProcurementPackagesWorkspaceSection
   → FleetBuildsWorkspaceSection
   → FleetTemplatesWorkspaceSection
   → Saved Products
   → Recently Viewed
   ```

   A new workspace section is inserted at a specific, named point in this sequence (see the placement language in `FLEET_QUOTE_BUILDER.md`/`FLEET_PROCUREMENT_PACKAGES.md` — "composed directly after X and before Y") — never appended to the end by default and never reordering an existing section.
3. **Dashboard sections always render, even empty** — with a friendly message and a "Browse Products" link back into discovery — unlike the homepage's Saved Products/Recently Viewed sections, which hide entirely when empty (`PROJECT_WORKSPACE.md`). This is the one rule that most sharply distinguishes "marketing" rhythm from "dashboard" rhythm: a dashboard tells the customer what's available to fill in; a marketing page never shows its own emptiness.

## Table System

Tables are plain HTML `<table>` elements with inline styles (`QuoteItemsSection.jsx`, `PackageContentsPanel.jsx`) — the shadcn `table.jsx` primitive exists but is not used by any page. The convention:

- `borderCollapse: 'collapse'`, `fontSize: 13`.
- Header row: uppercase text, `color: '#999'`, `letterSpacing: '0.05em'`, no background fill.
- Body rows: `borderTop: '1px solid #f0f0f0'` — no zebra striping, no row hover highlight today.
- **Responsive handling is horizontal scroll only** — every table is wrapped in `<div style={{ overflowX: 'auto' }}>`. There is no collapse-to-card responsive variant anywhere in the codebase (see **Future Design-System Backlog** — this is a real gap on narrow viewports for wide tables like Package Contents' product grid).

**Rule:** new tabular data (quote line items, procurement package contents, any future admin grid) should reuse this exact table convention and the `overflowX: 'auto'` wrapper, not the shadcn `table.jsx` primitive, to stay visually consistent with the two tables that already exist.

## Sidebar System

Three sidebar instances exist, each with different rules — there is no single shared `Sidebar` component in use (the shadcn `sidebar.jsx` primitive is imported nowhere in `src/`):

| Sidebar | Width | Responsive | Sticky |
| --- | --- | --- | --- |
| `ProductFilterPanel` (search/category filters) | `220px` fixed | Always rendered, no breakpoint hiding | No |
| `UpfitBuilderStepperSidebar` (guided builder steps) | `240px` fixed | `hidden lg:block` | No |
| `UpfitBuilderSummarySidebar` (guided builder summary) | `260px` fixed | `hidden lg:block` | Yes — inner card `position: 'sticky', top: 16` |

**Rule:** a sidebar that must survive on tablet/mobile (like a product filter panel) should render inline/full-width below the content instead of hiding, matching `ProductFilterPanel`'s current "always visible" choice. A sidebar that's a secondary, desktop-enhancement affordance (progress/summary rails) should use `hidden lg:block`, matching the Upfit Builder's two sidebars — this is also the documented convention for the header's icon-row extras (`WorkspaceButton`, `FleetProjectIndicator`, vehicle selector: all `hidden md:flex`). Do not introduce a drawer/overlay sidebar pattern without a specific reason; nothing in the app currently uses one for content navigation (the mobile nav drawer is the one legitimate overlay, and it's for site navigation, not page content).

## Status System

Status is communicated through pill-shaped `<span>` badges (`borderRadius: 999`) with a **consistent red/amber/green color grammar** used across every readiness concept in the app:

| Meaning | Text / BG | Used by |
| --- | --- | --- |
| Blocked / critical / required | `#b91c1c` / `#fee2e2` | `FleetBuildCompletionBadge`, `PackageReadinessBadge` (Blocked), `QuoteReadinessBadge` (Blocked), `StandardTierChip` (Required), `PackageContentsPanel` (Missing) |
| In progress / minor issue / recommended | `#92400e` / `#fef3c7` | Same set (Minor Issues / Recommended / Partial) |
| Ready / complete | `#166534` / `#dcfce7` | Same set (Ready / Complete) |
| Needs review *(Procurement Packages only)* | `#3730a3` / `#e0e7ff` (indigo) | `PackageReadinessBadge` — a fourth level that Fleet Quote Builder's `QuoteReadinessBadge` deliberately does not have (it uses **Incomplete**, `#c2410c`/`#ffedd5`, orange, instead) — a documented, intentional divergence between the two readiness models, not a bug to reconcile |

A separate, square (`borderRadius: 2`), outlined badge style exists for binary sync/system status (`AdminShopifySyncDashboard`'s `StatusBadge`: green/red only, with `CheckCircle2`/`XCircle` icons) — this style is reserved for **infrastructure status** (sync succeeded/failed), never for **business readiness** (quote/package/build completion), which always uses the pill shape above.

**Rule:** any new readiness/status concept should map onto this same red=blocked / amber=in-progress / green=ready grammar first, and only introduce a new color (like Procurement's indigo "needs review") when the existing three-level model genuinely cannot express the new state — and if it does, add a one-line note here documenting why, the way this section already does for Procurement vs. Quote.

## Button Hierarchy

No page-level CTA area uses the shadcn `Button` component's `variant` prop — every button is hand-styled, but converges on one hierarchy everywhere it's used (`CommerceActionPanel.jsx`, `UpfitBuilderStepPanelShell.jsx`, `FleetProjectCard.jsx`):

- **Primary** — filled `#c8102e`, white text. Exactly one primary action per view/step (e.g. "Configure Product," "Continue"/"Next," "Open" project). Disabled state fades toward `#e5b3bd`, never grays out to neutral.
- **Secondary** — transparent/white background, `1.5–2px solid #1a2744` border, navy text. Used for "Request Quote," "Add to Cart," "Contact Sales," "Back," "Duplicate/Rename/Archive."
- **Destructive** — transparent background, red-toned border/text (`color: '#b91c1c'`, `border: '1.5px solid #fca5a5'`). Reserved for "Delete" actions only.

**Rule:** a screen should never present two filled-red primary buttons at once — if two actions feel equally important, one must become the secondary (navy-outline) style. This is already how `UpfitBuilderStepPanelShell` and `CommerceActionPanel` resolve "Configure" vs. "Request Quote" vs. "Add to Cart," and new CTA areas should resolve conflicts the same way rather than inventing a fourth button color.

## Empty States

Every empty state follows the same four-part shape: **icon → heading → one-line explanatory copy → a red "Browse Products" CTA** back into discovery (`ComparePageView`'s `GitCompare` empty state, `SavedProductsPage`'s `Heart` empty state, `WorkspaceDashboard`'s Cart Summary/Compare Queue `EmptyNote` blocks). Copy is always specific to the section ("You haven't saved any products yet," "Select up to {MAX} products while browsing to compare them side by side") — never a generic "No data."

**Rule:** a new empty state reuses this icon/heading/copy/CTA shape. If the section has no natural "browse" destination, link to the next most relevant existing page (e.g. `/upfit-builder` for an empty Fleet Build) rather than omitting the CTA — see **Do / Don't Examples**.

## Loading States

There is no skeleton-loading convention in active use — the shadcn `skeleton.jsx` primitive exists (`animate-pulse rounded-md bg-primary/10`) but is not referenced by any page. Every hook-driven page instead renders a short inline loading string in place of the content it's replacing (`ProductSearchPage`'s result-count line reading `'Searching…'`, `WorkspaceDashboard`'s Cart Summary rendering `<EmptyNote>Loading cart…</EmptyNote>`). There are no spinners, progress bars, or layout-shifting loaders.

**Rule:** new hook-driven UI should follow the existing "replace the content region with a short em-dash-style string ('Loading…', 'Searching…')" pattern rather than introducing skeleton loaders — adopting skeletons is a design-system-level decision (see **Future Design-System Backlog**), not a per-feature one.

## Mobile Behavior

The verified mobile target across every fleet/workspace feature's manual QA is a **390px viewport** (`PROJECT_WORKSPACE.md`, `FLEET_PROJECTS.md`, `GUIDED_UPFIT_BUILDER.md` all cite 390px explicitly as the checked width). Rules drawn from that testing:

- The header's icon row (vehicle selector, saved products, mini cart, "Where to Buy," hamburger) is **at its practical width limit at 390px** — any new header icon must be `hidden md:flex` (desktop-only) with an equivalent entry added to `MobileNavDrawer`'s accordion, never squeezed into the mobile icon row.
- Desktop-only sidebars (`UpfitBuilderStepperSidebar`/`SummarySidebar`) are replaced by a **sticky top progress bar** on mobile (`UpfitBuilderMobileProgress`: "Step N of 18: {label}" + a completion bar), not simply hidden with nothing in their place.
- No fixed pixel widths in main-column layout (see **Layout System**) — this is what keeps 390px overflow-free.
- Card/summary grids collapse to `grid-cols-1` below `md`.

## Tablet Behavior

Tablet behavior is less mature than mobile and has one **known, currently-unresolved issue**: a pre-existing header/navigation horizontal overflow at the **768px** breakpoint, present today on `/workspace` and `/search`, explicitly called out as out-of-scope in both `GUIDED_UPFIT_BUILDER.md` and `PROJECT_WORKSPACE.md`'s testing notes. This document does not fix it, but formally tracks it — see **Future Design-System Backlog**. Until it's fixed, any new tablet-width design decision should assume the header may already be visually broken at that width and avoid compounding it (e.g. don't add another `md:flex`-only element to the header row without checking real 768px rendering first).

Aside from that known gap, tablet inherits desktop's `md:`/`lg:` breakpoint rules directly — there is no dedicated "tablet-only" layout anywhere in the codebase (no `md:`-only styles that don't also apply through `lg:`), which is intentional simplicity worth preserving rather than adding a third responsive tier.

## Accessibility Rules

`aria-label`, `aria-hidden`, `role`, and `sr-only` attributes appear across roughly five dozen files today, concentrated in the shadcn `src/components/ui/*` primitives (which ship with Radix's built-in accessibility behavior) and in a smaller set of domain components with icon-only controls (`SiteHeader`, `MobileNavDrawer`, `ProductHero`'s gallery arrows, `FleetProjectCard`, `FleetProjectIndicator`, `CloneBuildDialog`). Coverage is real but **not systematically audited** — there is no accessibility test suite or lint rule enforcing it (see **Future Design-System Backlog**).

Working rules until a dedicated accessibility issue is scoped:

- **Every icon-only button must carry an `aria-label`** describing its action (not its icon) — this is already the convention on gallery/nav arrows and hamburger/close controls; extend it, don't invent a different pattern.
- **Reuse shadcn primitives for interactive chrome** (`Dialog`, `Sheet`, `DropdownMenu`, `Accordion`, `Tabs`) rather than hand-rolling a modal/menu/accordion — this is the one place in the app where accessibility (focus trapping, `Escape` handling, ARIA roles) comes for free from Radix, and hand-rolled equivalents would need to reimplement all of it.
- **Status is never color-only.** Every status badge in this app already pairs color with text (`Ready`, `Blocked`, `Missing`) or an icon (`CheckCircle2`/`XCircle` on sync badges) — new status indicators must keep doing both, not drop to a bare colored dot.
- **Focus states rely on the browser/Radix default outline today** — there is no custom `focus-visible` ring system layered on top. Do not remove the default outline (`outline: none`) on a custom control without providing an equivalent visible focus style.

## Animation / Motion Rules

`framer-motion` and `tailwindcss-animate` are both installed, but their usage is **not evenly distributed**: `framer-motion` is used only in marketing/effects components (`src/components/effects/*`, `src/pages/team44/Layout.jsx`), while every commerce, fleet, and workspace surface uses plain Tailwind transition utilities instead — `transition-colors`, `transition-all`, and inline `style.transition` strings (e.g. `ProductCard.jsx`'s `'border-color 0.15s'`). The only registered keyframes are `accordion-down`/`accordion-up` (`tailwind.config.js`, `0.2s ease-out`), powering Radix `Accordion` height animation.

**Rules:**

- **Utility surfaces (workspace, fleet, quote, procurement, product detail) use color/border transitions only** — `transition-colors`/`transition-all` at 150–200ms. No transform/scale-on-hover, no framer-motion, anywhere in this layer today; don't introduce it piecemeal on one card when its siblings don't have it.
- **`framer-motion` stays scoped to marketing/effects components.** If a future marketing surface needs entrance animation, reuse the existing `src/components/effects/` patterns rather than hand-rolling a new one inline.
- **Radix-driven components (`Accordion`, `Dialog`, `Sheet`, `Toast`) keep their built-in animation** — do not override or disable it per-instance.
- No page-load skeleton/shimmer animation exists (see **Loading States**) — do not add one to a single feature without a design-system-level decision first.

## Navigation Patterns

`SiteHeader.jsx` is a three-row shell:

1. **Row 1** — dark (`#1c1c1c`) utility bar: mega-menu vertical triggers + utility links (Resources, Articles, Product News, Trade Shows). `hidden md:flex` — entirely absent on mobile.
2. **Row 2** — white main bar: logo, centered search (`hidden md:flex`), and a right-side action cluster (Fleet Project indicator, vehicle selector, Workspace button, Saved Products button, Mini Cart, "Where to Buy") — every element in that cluster except "Where to Buy" and the hamburger is `hidden md:flex`.
3. **Row 3** — category sub-nav for the active vertical, `hidden md:block`.

**Mobile** replaces all three rows' functionality with `MobileNavDrawer` — a shadcn `Sheet` sliding from the left, containing search, "Select Your Vehicle," "My Workspace," and an `Accordion` of the fleet-project switcher plus every nav vertical, followed by the same utility links from Row 1.

**Rule:** any new header-level entry point follows the Row 2 action-cluster convention — `hidden md:flex` in the desktop icon row, with a matching entry added to `MobileNavDrawer`'s accordion/list, never squeezed into the always-visible mobile row (which is intentionally limited to logo, search trigger, "Where to Buy," and the hamburger).

Breadcrumbs (`ProductBreadcrumb.jsx`) are a separate, secondary nav layer: a `bg-gray-50`/`border-b border-gray-200` strip, chevron-separated (`ChevronRight`, `text-gray-300`), links in brand-red-on-hover, current page as plain bold gray text — used on category and search pages, not on product detail (which uses its own inline structure) or workspace pages (which have no breadcrumb at all, being one level deep from `/workspace` itself).

## Product Detail Patterns

Product Detail (`ProductDetailTemplateView`) has one fixed vertical composition order that every future addition must slot into at a named point, not append to the end:

```
SiteHeader / ProductBreadcrumb
ProductHero (Functional Hero, infoPanel = ProductCommerceSummary)
CommerceActionPanel
Specifications / ProductTabs / ConfiguratorSection   (unchanged, id="build-configure")
FitmentSummary
StorefrontProductPanel                                (read-only Shopify Storefront readiness)
FinishYourUpfitPanel  (+ Guided Build status, Department Standard status, Quote/Package inclusion, Recommendations)
ProductIntelligencePanel  (Recommended For / Required By / Department Standards / Commonly Installed With / Companions / Upgrades)
RelatedPackages
RecommendedProducts
PrototypeFooter
```

Every panel in this stack is read-only composition over an existing service/context (`PRODUCT_DETAIL_EXPERIENCE.md`) — a new Product Detail panel is inserted at a specific named point in this list (stating which existing panel it comes directly after/before), matching how `ProductIntelligencePanel`, `StorefrontProductPanel`, and the Guided-Build/Quote/Package status blocks were each added.

## Workspace Patterns

See **Dashboard System** for the exact, current `WorkspaceDashboard` section order. Two additional rules specific to workspace surfaces:

- **A workspace section is always a "View + connected wrapper" pair** (`WorkspaceDashboardView`/`WorkspaceDashboard`, `ProjectQuotePageView`/`ProjectQuotePage`, `ProcurementPageView`/`ProcurementPage`) — the pure view takes props and renders, the connected default export wires contexts/hooks. This split is what makes every workspace surface's fixture-based test coverage possible; a new workspace page should follow it from the start rather than being retrofitted later.
- **A workspace "shortcut" section is a summary, not a duplicate UI.** `ProjectQuoteWorkspaceSection`, `ProcurementPackagesWorkspaceSection`, and `GuidedUpfitBuilderWorkspaceSection` each show a handful of stats and a single "Open {X}" link into the full page — they never re-render that page's tables/forms inline. Keep this shape for any future workspace shortcut.

## Fleet / Procurement Patterns

Fleet Builds, Fleet Projects, Fleet Quote, and Procurement Packages share one visual vocabulary distinct from plain commerce pages:

- **Completion is always shown as a percent + colored bar/badge** (`FleetBuildCompletionBadge`), never a bare percent number alone.
- **Readiness is always a named level with reasons**, not a raw score — `resolveQuoteReadiness`/`resolvePackageReadiness`'s Ready/Minor Issues/Incomplete-or-Needs-Review/Blocked levels, each rendered via the pill badges in **Status System**, each carrying a human-readable reasons list.
- **Missing equipment is always grouped by tier** (Required/Recommended/Optional) before it's grouped by anything else (vehicle, category, department) — tier is the primary visual axis across `FinishYourUpfitPanel`, the Guided Upfit Builder checklist, the Missing Equipment Report, and Package Contents.
- **Every aggregation surface (Quote, Procurement) reuses the same `FleetBuildCompletionBadge`/`RecommendationCard`/`QuoteStat` presentational components** rather than introducing a parallel stat-tile design — see the "Reused foundations" tables in `FLEET_QUOTE_BUILDER.md`/`FLEET_PROCUREMENT_PACKAGES.md`. A new fleet surface should look for an existing shared component in `src/components/fleetQuote/` or `src/components/departmentStandards/` before building a new stat/badge component.

## Resource / Documentation Patterns

The header's Row 1 utility links (Resources, Articles, Product News, Trade Shows) are the only shipped entry points toward informational/content pages today — none of them yet has a dedicated content-page template in `src/pages`. Until a real resource/article template is built, any new informational page should follow the **Discovery** tier convention from **Page Hierarchy** (white background, `max-w-7xl mx-auto px-4` container, breadcrumb, Inter body copy, Oswald section headings) rather than the Marketing tier's dark-band hero — a resource/documentation page is closer to a reference surface (like product detail) than a persuasion surface (like the homepage). This is a placeholder convention, not a shipped pattern; formalize it as its own doc once the first resource page is actually built (see **Future Design-System Backlog**).

## Do / Don't Examples

| Do | Don't |
| --- | --- |
| Use the hand-rolled 1px `#e5e7eb` / 4px-radius card convention (`ProductCard`, `FleetBuildCard`) | Import the shadcn `Card` primitive on one new page while every sibling page uses the hand-rolled convention |
| Give a screen exactly one filled-red primary button | Style two competing actions both as filled red |
| Add a new header icon as `hidden md:flex` + a `MobileNavDrawer` entry | Add a 5th always-visible icon to the mobile header row (it already overflows at 390px) |
| Reuse the red/amber/green readiness grammar for a new status concept | Invent a new badge color without a one-line justification in **Status System** |
| Wrap a new table in `<div style={{ overflowX: 'auto' }}>` matching the existing two tables | Ship a wide table with no horizontal-scroll wrapper on mobile |
| Insert a new Product Detail panel at a named point in the existing composition order | Append a new panel to the bottom of Product Detail "because that's easiest" |
| Keep a workspace shortcut section to a few stats + one "Open" link | Re-render a full page's table/form inline inside its own workspace shortcut |
| Give every empty state an icon, heading, one-line copy, and a "Browse Products" CTA | Render a bare "No data" string with no path back into the product |
| Keep `framer-motion` scoped to `src/components/effects/`-style marketing components | Add framer-motion to one workspace card without adding it to its siblings |

## Future Design-System Backlog

This document intentionally surfaces gaps rather than hiding them. The following are not fixed by this issue (documentation-only, no runtime change) and should be scoped as their own dedicated issues:

1. **Write the actual `DESIGN_SYSTEM.md` foundation doc.** This issue's instructions assumed one already existed; it does not. A follow-up issue should formally decide whether the shadcn token system (`src/index.css`, currently an unused near-black "dark" palette baked into `:root` itself) is replaced with real brand tokens (`#c8102e`/`#1a2744`/the gray ramp documented above), or removed in favor of the hand-rolled hex-value convention every real page already uses. Right now the app effectively runs on two unreconciled palettes.
2. **Decide the fate of unused shadcn primitives.** `Card`, `Table`, `Sidebar`, `Skeleton`, and `Button`'s `variant` prop are installed but not used by any real page — either adopt them platform-wide (a real migration issue, page by page) or remove them to stop them from being accidentally reached for on a new page and creating a visual outlier.
3. **Fix the known 768px tablet header/nav overflow.** Documented as out-of-scope in `GUIDED_UPFIT_BUILDER.md`/`PROJECT_WORKSPACE.md`; still unresolved. Needs its own bugfix issue with the header row's actual icon-cluster width audited at 768px.
4. **Add a responsive collapse-to-card mode for wide tables.** Today's `overflowX: 'auto'` wrapper is the only responsive behavior for Quote Items/Package Contents tables — acceptable, but not ideal on a 390px phone with a 6-column equipment table.
5. **Formalize a loading-skeleton decision.** Either adopt the already-installed `skeleton.jsx` primitive platform-wide, or explicitly retire it and keep the existing "Loading…"/"Searching…" text convention as the documented standard (this doc currently documents the text convention as-is, but doesn't resolve whether skeletons should replace it).
6. **Accessibility audit.** No lint rule or test suite enforces `aria-label` coverage on icon-only controls today; a dedicated accessibility-review issue should audit the ~60 files that already touch ARIA attributes and close the systematic gaps this document could only describe qualitatively.
7. **Build the first Resource/Documentation page template.** "Resources," "Articles," and "Product News" are live header links with no destination template yet (see **Resource / Documentation Patterns**) — first real build should formalize the placeholder convention this doc proposes, or supersede it.
8. **Collect real visual references.** If/when brand guidelines, competitor teardowns, or Figma files become available, add them under `docs/architecture/assets/` and link them from **Visual Reference Interpretation** instead of leaving that section sourced only from the shipped homepage.
