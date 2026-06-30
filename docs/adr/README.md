# Architecture Decision Records

Architecture Decision Records (ADRs) document decisions that affect product architecture, data ownership, commerce behavior, configurator behavior, deployment, or agent-safe development practices.

## When an ADR is required

Create an ADR before implementation when a decision:

- Changes or constrains application architecture.
- Affects product data, commerce data, Shopify exports, pricing, fitment, or required components.
- Changes configurator behavior, module boundaries, or page ownership.
- Introduces or removes shared React architecture patterns.
- Creates exceptions to protected-file rules or agent workflow rules.
- Affects deployment, CI, security, secrets, authentication, or release processes.
- Is likely to guide more than one future PR or agent task.

An ADR is not required for small documentation edits, lint-only hygiene, typo fixes, or implementation work that directly follows an existing accepted ADR.

## Required sections

Every ADR must include:

1. **Status** — Proposed, Accepted, Superseded, Deprecated, or Rejected.
2. **Date** — Date the decision was proposed or accepted.
3. **Decision owners** — Responsible persona or reviewer group.
4. **Context** — Problem, constraints, and why the decision is needed.
5. **Decision** — The chosen approach.
6. **Consequences** — Benefits, tradeoffs, and risks.
7. **Implementation guidance** — What future agents should do or avoid.
8. **Protected files / approvals** — Files or areas requiring approval before changes.
9. **Related issues / PRs** — Links or references when available.
10. **Supersedes / superseded by** — Cross-references when the ADR changes.

## Status lifecycle

- **Proposed** — Drafted and ready for review; not binding.
- **Accepted** — Approved and binding for future work.
- **Rejected** — Reviewed and intentionally not adopted.
- **Deprecated** — Previously accepted but no longer recommended for new work.
- **Superseded** — Replaced by a newer ADR; include a link to the replacement.

Agents must treat Accepted ADRs as repository guidance. If an implementation conflicts with an Accepted ADR, stop and ask for clarification before editing.

## Review process

1. Draft the ADR using `000-template.md`.
2. Assign the responsible persona:
   - Product Architect for product behavior or family taxonomy.
   - Frontend Engineer for React architecture.
   - Data Engineer for product, fitment, or matrix data.
   - Commerce Engineer for Shopify, pricing, checkout, cart, quote, or order flows.
   - QA Engineer for verification and regression policy.
   - Documentation Engineer for ADR structure and documentation systems.
3. Request review from any persona whose protected area is affected.
4. Keep the ADR in Proposed status until approval is documented.
5. Change status to Accepted only after review.
6. Create a new ADR instead of rewriting history when a decision changes materially.

## Naming convention

Use a zero-padded numeric prefix and kebab-case title:

```text
docs/adr/001-short-decision-title.md
docs/adr/002-another-decision.md
```

The ADR title inside the file should use the same number:

```text
# ADR-001: Short Decision Title
```

Keep numbers stable. Do not renumber ADRs after merge.
