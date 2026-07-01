# Labels

| Name | Color | Description | Recommended usage |
|---|---:|---|---|
| architecture | `5319e7` | Changes to platform structure, dependency direction, domain contracts, or ADRs. | Apply to issues that alter boundaries, types, schemas, service ownership, or diagrams. |
| feature | `1d76db` | New user-facing or business-facing capability. | Apply when behavior is intentionally added, not merely migrated or refactored. |
| migration | `fbca04` | Behavior-preserving movement from legacy paths to platform architecture. | Apply to service, hook, loader, TypeScript, or data-access migrations. |
| bug | `d73a4a` | Defect causing incorrect behavior, broken UI, invalid data, or failed workflow. | Apply to reproducible failures with expected versus actual behavior. |
| configurator | `b60205` | Configurator sections, options, SKU filtering, accessories, or quote handoff. | Pair with feature, migration, bug, or qa as appropriate. |
| catalog | `0e8a16` | Product, category, vertical, media, merchandising, or catalog data access. | Use for catalog services, loaders, hooks, pages, and data validation. |
| pricing | `c5def5` | MSRP, dealer cost, contract pricing, bundles, margins, or pricing warnings. | Use when pricing policy, source hierarchy, or calculations are involved. |
| commerce | `006b75` | Shopify mapping, variants, inventory, carts, checkout, or purchasability. | Use for commerce adapters, cart readiness, and checkout behavior. |
| vehicle | `bfdadc` | Vehicle identity, make/model/year, fitment, and compatibility rules. | Use for vehicle services, data, or configurator fitment logic. |
| qa | `fef2c0` | Test planning, manual verification, smoke tests, or release evidence. | Use for QA tasks and defects discovered during verification. |
| documentation | `0075ca` | Repository documentation, guides, governance, or operating procedures. | Use when the primary deliverable is markdown or process documentation. |
| performance | `a2eeef` | Loading, rendering, bundle, network, build, or runtime performance. | Use when metrics and before/after evidence are required. |
| security | `ee0701` | Secrets, access control, dependency risk, data exposure, or secure workflow. | Use for vulnerabilities, hardening, and security reviews. |
| blocked | `b60205` | Work cannot proceed until a dependency or decision is resolved. | Apply with a comment naming the blocker, owner, and next action. |
| good-first-issue | `7057ff` | Small, well-scoped issue suitable for a new contributor or AI agent. | Use only when scope, files, and acceptance criteria are clear. |
| needs-review | `fbca04` | Work is ready for human or specialist review but not merge-ready. | Apply to PRs or issues needing architectural, QA, or domain review. |
| ready-for-codex | `0e8a16` | Issue is fully specified and ready for AI implementation. | Apply when scope, forbidden files, tests, and acceptance criteria are complete. |
| ready-for-merge | `0e8a16` | PR has required approvals, passing checks, and release notes. | Apply only after final review and all merge gates are satisfied. |
| research | `d4c5f9` | Investigation or decision work before implementation. | Use when output is a recommendation, not code. |
| infrastructure | `0052cc` | CI, deployment, environment, secrets, branch protection, or tooling. | Use for operational platform changes. |
| refactor | `cfd3d7` | Internal code improvement with no intentional behavior change. | Use for cleanup, decomposition, and dependency realignment. |
| high-risk | `b60205` | Work touches revenue, checkout, pricing, configurator, or production deployment. | Requires explicit rollback and reviewer assignment. |
| release | `5319e7` | Release planning, release PR, notes, cutover, or post-release validation. | Use for release coordination and evidence tracking. |
