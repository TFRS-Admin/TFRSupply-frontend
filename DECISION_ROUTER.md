<!-- Purpose: Map plain-language user requests to the correct playbook workflow, so an agent never has to guess which command to run. -->
<!-- Local copy of TFRS-Admin/tfrs-engineering-playbook DECISION_ROUTER.md (v2.4.0), part of the Minimum Baseline. Repo-agnostic — do not edit locally; changes belong upstream. -->
# TFRS Decision Router

## Purpose

An agent should be able to take a plain-language request — *"implement the next ready issue in `tfrs-website`"*, *"the app is slow"*, *"ship this PR"* — and know exactly which [`commands/`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/README.md) prompt to run, without relying on chat history or unstated assumptions. This document is that routing table. It is consulted at step 6–7 of the [Session Initialization Protocol](./AI_AGENT_OPERATING_MODEL.md#1-session-initialization-protocol); it does not restate that protocol or any command's own workflow.

## Routing Table

| User Request Type | Default Workflow |
| --- | --- |
| "Review this PR" | [`REVIEW_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REVIEW_STANDARD.md) (PR-approval review; not `commands/review.md` — see the [Terminology Map](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/AI_ENGINEERING_WORKFLOW.md#terminology-map)) |
| "Review this repo" | [`commands/repo-health.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/repo-health.md) if it's a scheduled/general check; [`commands/review.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/review.md) if it's scoped to a specific area or triggered by upcoming work |
| "Plan this feature" | [`commands/plan.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/plan.md), gated by [`PLANNING_STANDARD.md#when-a-full-spec-is-required`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/PLANNING_STANDARD.md#when-a-full-spec-is-required) — run Specification first when a trigger there applies |
| "Build this feature" | Specification (if triggered) → [`commands/plan.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/plan.md) → [`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) → [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md) — the full chain, not a shortcut to Execute |
| "Implement issue #N" | [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md) directly — **only if #N is `Ready` and unblocked**; see [Forbidden Until Planned/Backlogged](#forbidden-until-plannedbacklogged) below |
| "Fix this bug" | If a `Ready`, unblocked tracking issue already exists for this bug, route straight to [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md). **Otherwise there is no shortcut**, regardless of how small the fix looks: [`commands/review.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/review.md) to establish root cause → [`commands/plan.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/plan.md) (even a one-task plan for an obvious fix) → [`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) to create the actual issue with acceptance criteria → then [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md). "Small and obvious" shortens how long Plan and Backlog take — it never skips them; see [Forbidden Until Planned/Backlogged](#forbidden-until-plannedbacklogged) below. |
| "The app is slow" | [`commands/review.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/review.md) or the Testing/CI dimensions of [`commands/repo-health.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/repo-health.md) *before* any implementation — performance claims need evidence (reproduce and measure) before a fix is planned, not after |
| "Make the code cleaner" | [`commands/repo-health.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/repo-health.md) → file as backlog via [`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md), **not** an immediate refactor — see [`AI_AGENT_OPERATING_MODEL.md#7-how-to-avoid-scope-expansion`](./AI_AGENT_OPERATING_MODEL.md#7-how-to-avoid-scope-expansion) |
| "Ship this PR" | [`commands/verify.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/verify.md) → [`REVIEW_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REVIEW_STANDARD.md) approval → [`commands/ship.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/ship.md), in that order — never skip straight to ship |
| "What's next?" | Inspect the GitHub Project (or, absent a real board, the open issues' structured-text fields — see [Session Initialization Protocol](./AI_AGENT_OPERATING_MODEL.md#1-session-initialization-protocol) step 5) and recommend the next `Ready`, unblocked issue per [`AI_AGENT_OPERATING_MODEL.md#3-how-to-choose-the-next-issue`](./AI_AGENT_OPERATING_MODEL.md#3-how-to-choose-the-next-issue) — this is informational; don't start implementing without a separate explicit go-ahead |
| "Create a project from this review and plan" | [`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) |
| "Update the playbook" | [`commands/plan.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/plan.md) → [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md) → [`commands/verify.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/verify.md), same as any other repository — this repository is not exempt from its own lifecycle |

## Ambiguity Handling

- If a request could map to more than one row (e.g., "review this" without saying PR or repo), ask which is meant rather than guessing — the two rows have materially different scope and one runs against a diff, the other against the whole repository.
- If a request names an issue number but the issue doesn't exist, is closed, or is `Blocked`, say so and stop rather than silently picking the nearest match.
- If a request implies urgency ("just ship it," "quickly fix") that would skip a required gate (verification, review, planning for non-trivial work), name the gate being asked to skip explicitly and ask for confirmation — don't skip it silently, and don't refuse silently either.

## Approval Checkpoints

State-changing actions always get an explicit checkpoint before or immediately as they happen — reading, searching, and reasoning never require one:

- **Before opening a branch or PR** — confirm the target issue is `Ready` and unblocked (or explain why it isn't, per [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md)).
- **Before merging** — per [`commands/ship.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/ship.md), never implicit in "ship this."
- **Before any action affecting a shared resource** outside the specific repository (playbook-wide standard changes, GitHub Project schema changes) — always a human checkpoint, never routed to Execute unilaterally.

## When to Ask vs. Proceed vs. Refuse

- **Proceed** without asking when the request maps cleanly to one row above, the target issue (if any) is `Ready` and unblocked, and the action matches its acceptance criteria — per [`CLAUDE.md`](./CLAUDE.md#when-to-ask-vs-when-to-proceed).
- **Ask** when the request is ambiguous between rows, names an issue that isn't actually `Ready`, or would require skipping a gate (see Ambiguity Handling above).
- For anything execution-shaped ("fix this bug," "implement issue #N," "build this feature"), whether to proceed or ask is downstream of one prior question: is there already a `Ready`, unblocked, acceptance-criteria-bearing issue for this work? If not, see below — this isn't an ask/proceed judgment call, it's a hard stop.

## Forbidden Until Planned/Backlogged

**Implementation is forbidden** — not just "ask first," but flatly not-yet-possible — until planning and backlog exist for the work in question. This applies uniformly regardless of how the request was phrased ("implement issue #N," "fix this bug," "build this feature," or anything else that resolves to execution):

- No [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md) run against an issue with no acceptance criteria.
- No [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md) run against work that only exists as a chat request, a bug report with no tracking issue, or a "Build this feature" ask that hasn't passed through [`commands/plan.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/plan.md) and [`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) yet — see [`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) for what "passed through Backlog" actually requires (all ten GitHub Project fields set, or the structured-text equivalent, and `Blocked` = `No`).
- No [`commands/ship.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/ship.md) run without a passing [`commands/verify.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/verify.md) report attached.

This is the same rule [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md#issue-execution-protocol) enforces from the execution side (step 4: "confirm the issue is `Ready` and unblocked, or stop and explain why it isn't") — this section and that one are two views of one rule, not two rules.

## Related Documents

- [`AI_AGENT_OPERATING_MODEL.md`](./AI_AGENT_OPERATING_MODEL.md) — the Session Initialization Protocol this router is consulted from
- [`commands/README.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/README.md) — the full command library this table routes into
- [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md) — how to pick a skill once a workflow is selected
