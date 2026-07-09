<!-- Purpose: Define the canonical operating model every AI agent follows when it enters a TFRS repository. -->
<!-- Local copy of TFRS-Admin/tfrs-engineering-playbook AI_AGENT_OPERATING_MODEL.md (v3.0.0), part of the Minimum Baseline. Repo-agnostic — do not edit locally; changes belong upstream. -->
# TFRS AI Agent Operating Model

## Purpose

[`AGENTS.md`](./AGENTS.md) defines baseline conventions (naming, style, commits, branch prefixes). This document defines the **operating loop**: what an agent does from the moment it starts a session in a repository that has adopted this playbook, to the moment it stops. Every future TFRS repository should be usable by an AI agent that has read only this file plus the repository's own README.

## Architecture

This playbook is repository-centered, not GitHub-Project-centered:

```text
Repository-local guidance
        ↓
Repository engineering documentation
        ↓
GitHub Issues & Issue Hierarchy
        ↓
TFRS Engineering Playbook
        ↓
TFRS-Admin/agent-skills
```

**Repository-local documentation and GitHub Issues are the operational source of truth.** GitHub Projects, if a repository chooses to run one, are an optional visual dashboard — never a dependency for an agent to determine state or pick up work. Everywhere this document previously said "read the GitHub Project," it now means "read the repository's `docs/engineering/` files and the issue's `## Metadata` block" (see [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md)).

## 1. Session Initialization Protocol

This is how every AI engineering session begins, whether it's triggered by an explicit issue number or by a plain-language request like *"implement the next ready issue in `tfrs-website`"*. **Plain-language requests are expected, not an edge case** — the agent is responsible for routing them, not the user. Do this in order, and don't skip a step because a request "seems" execution-only:

1. **Read local repository guidance first.** The target repository's own `README.md` and any repository-specific instructions — these can override this playbook per the precedence rule in [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md#precedence-on-conflict). If the repository's own guidance conflicts with what follows, the repository wins; note the conflict rather than silently picking a side.
2. **Read `AGENTS.md`.** Baseline conventions: naming, style, commit format, what agents must never do.
3. **Read `CLAUDE.md`.** Response style, planning-before-execution, PR conventions, and the Ask-vs-Proceed rule you'll need in step 9.
4. **Identify the current repository.** Confirm which repository the request is about and that it has actually adopted this playbook (see the [Repository Readiness Checklist](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPOSITORY_BOOTSTRAP_GUIDE.md#repository-readiness-checklist)) — don't assume a repository is fully onboarded just because it's a TFRS repository; check.
5. **Read the repository's engineering documentation, then the relevant GitHub Issue(s).** Read `docs/engineering/CURRENT_SPRINT.md` for what's actively in flight, then the open issues themselves (each carries its own `## Metadata` block per [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md)), then `docs/engineering/BACKLOG.md` and `docs/engineering/ROADMAP.md` for broader context. This is the full source of truth — check a GitHub Project only if the repository happens to run one (see [`GITHUB_PROJECT_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/GITHUB_PROJECT_STANDARD.md)); its absence changes nothing about what an agent can determine.
6. **Determine the task category.** Every request is one of: *informational* (a question, no state change), *planning* (turning an idea into a strategy), *review* (assessing a diff or existing state), *execution* (implementing a specific issue), *verification* (proving a change works), or *release* (shipping). Use [`DECISION_ROUTER.md`](./DECISION_ROUTER.md) to map a plain-language request to one of these categories. If the request sounds execution-shaped (e.g., "fix this bug") but no `Ready`, unblocked, acceptance-criteria-bearing issue exists yet, the category is actually *planning* first — see [`DECISION_ROUTER.md#forbidden-until-plannedbacklogged`](./DECISION_ROUTER.md#forbidden-until-plannedbacklogged).
7. **Select the correct workflow.** Once the category is known, `DECISION_ROUTER.md` names the [`commands/`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/README.md) prompt(s) to run.
8. **Select the correct skill, if applicable.** Per [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md#skill-selection), most non-informational categories have a matching skill in [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) to consult before executing.
9. **State assumptions; ask for approval before any state-changing action.** If routing or scope is ambiguous, say what you assumed rather than silently picking one. Reading code, issues, and this playbook is never state-changing and needs no approval; opening a branch, PR, or editing an issue's `## Metadata` block does — per [`CLAUDE.md`](./CLAUDE.md#when-to-ask-vs-when-to-proceed), proceed only when the task is clear, scoped, and consistent with these standards.

Do not re-derive information already recorded in these documents by re-reading the entire codebase. Trust the standards; verify only the specific issue you are working. Steps 6–8 above are the entry point into the per-issue execution work — see [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md#issue-execution-protocol) for the detailed protocol once a specific `Ready` issue has been selected.

## 2. How to Determine Current Work

Current work is whatever the repository — its engineering docs and its issues — says it is, not what a prior chat message implied. To determine current state, in this order:

1. **`AGENTS.md`** — confirm baseline conventions haven't changed.
2. **`CLAUDE.md`** — confirm response/execution conventions haven't changed.
3. **`docs/engineering/CURRENT_SPRINT.md`** — what's actively committed this sprint and its current state.
4. **GitHub Issues** — read each in-flight issue's `## Metadata` block directly (see [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md)). Check `In Progress` and `In Review` items first — an agent should finish or hand off in-flight work before starting new work. If nothing is in flight, check `Ready`.
5. **`docs/engineering/BACKLOG.md`** — the full backlog if nothing in the current sprint answers the question.
6. **`docs/engineering/ROADMAP.md`** — broader sequencing context if the request is about what's coming, not what's ready now.
7. **This playbook's standards** — for anything the repository's own docs don't resolve (e.g., how `Priority` and `Risk` should order two competing `Ready` issues).
8. **The relevant skill in [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills)** — once the task type is known, per [`SKILLS_STANDARD.md#skill-selection`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md#skill-selection).

If you were invoked with an explicit issue or PR number, that takes precedence over scanning — but still read that issue's `## Metadata` block to confirm its `Status` and `Blocked` values before acting, in case it's stale relative to reality. A GitHub Project, if one exists for the repository, may be consulted as a convenience view at any point in this order — it is never a required step, and if it disagrees with an issue's `## Metadata` block, the issue body wins.

## 3. How to Choose the Next Issue

When multiple issues are in `Ready`, choose using this order:

1. **Assigned to you or unassigned and explicitly requested** — never pick up an issue assigned to another agent or human without confirming the handoff.
2. **`Blocked` = `No`** — never start work that is flagged blocked, even if it looks unblocked from the code.
3. **Highest `Priority`**, then highest `Risk` (resolve risk while there is runway in the sprint), then smallest `Size` when priority and risk tie (see [`BACKLOG_STANDARD.md#execution-ordering`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/BACKLOG_STANDARD.md#execution-ordering)).
4. **Matches your `Agent Persona`** — an agent operating as `Implementer` should not pick up an issue whose `Agent Persona` is `Verifier` or `Release-Manager`; hand it off instead.

All four fields are read directly from the issue's `## Metadata` block per [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md). If no issue in `Ready` satisfies these constraints, stop and report that the backlog needs attention rather than inventing work.

## 4. When to Stop

Stop and hand control back to a human when any of the following is true:

- The acceptance criteria are ambiguous or contradictory.
- Completing the issue would require changing architecture, security posture, or a cross-repository convention not already documented.
- A dependency you did not know about surfaces mid-implementation (undocumented `Blocked` state).
- You have completed the acceptance criteria and produced verification evidence — stop and open the PR; do not keep "improving" beyond scope.
- You have hit the same failure twice after attempting a fix — a third blind attempt is not more likely to work; escalate instead.

Stopping is not failure. An agent that stops with a clear, documented reason is more valuable than one that guesses past a real blocker.

## 5. How to Update State

The repository — issue bodies and `docs/engineering/` files — is the source of truth; update it as state changes, not only at the end:

1. Move the issue's `## Metadata` `Status` line when you start (`Ready` → `In Progress`), when you open a PR (`In Progress` → `In Review`), and when QA is required (`In Review` → `QA`). If the repository also runs an optional GitHub Project, mirror the change there too, but the issue body edit is the one that is never optional.
2. Set `Blocked` to `Yes` immediately when you hit a blocker, with a comment explaining what is needed — do not silently pause.
3. Reference the issue number in every commit and the PR description (see [`EXECUTION_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/EXECUTION_STANDARD.md)).
4. Close issues with the correct `state_reason` (`completed` vs. `not_planned`) — never close silently.
5. Update `docs/engineering/CURRENT_SPRINT.md` when an item enters or leaves the active sprint, and `docs/engineering/BACKLOG.md` when the backlog's shape changes.
6. Never let a chat-only status update substitute for a repository update. If it did not happen in the issue body or the repository's engineering docs, it did not happen.

## 6. How to Document Evidence

Every claim of "this works" must be backed by evidence attached to the PR or issue, not asserted in prose:

1. Use [`commands/verify.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/verify.md) and [`templates/verification-report-template.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/templates/verification-report-template.md) to produce the evidence artifact.
2. Evidence is command output, test results, or a description of the exact manual steps taken and observed — never "should work" or "looks correct."
3. Attach the verification report to the PR before requesting review, and paste its result into the issue's `## Verification` section before moving `Status` to `Done`.
4. If a criterion could not be verified (no test infrastructure, no way to reproduce), say so explicitly in the report rather than omitting it.

## 7. How to Avoid Scope Expansion

1. Treat the issue's acceptance criteria as the complete definition of "done" — not a starting point for adjacent improvements.
2. If you notice an unrelated bug or improvement while working, do not fix it inline. File it as a new issue using [`templates/engineering-task-template.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/templates/engineering-task-template.md) or [`templates/technical-debt-template.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/templates/technical-debt-template.md) and link it from your PR description as a follow-up.
3. Keep PRs under the size guideline in [`EXECUTION_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/EXECUTION_STANDARD.md); a PR that keeps growing is a sign the issue was under-scoped at `Plan` or `Backlog` time — flag that upstream rather than absorbing the growth silently.
4. When in doubt whether something is in scope, it is out of scope. Ask (per [`CLAUDE.md`](./CLAUDE.md#when-to-ask-vs-when-to-proceed)) rather than deciding unilaterally.

## 8. Agent Personas

[`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md) assigns every issue an `Agent Persona` value. Here is what each one actually does:

| Persona | Behavior |
| --- | --- |
| `Reviewer` | Runs [`commands/review.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/review.md) — assesses current state and produces findings. Does not fix anything. |
| `Planner` | Runs [`commands/roadmap.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/roadmap.md) and [`commands/plan.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/plan.md) — sequences findings into Epics and turns approved work into a sized strategy. |
| `Backlog-Manager` | Runs [`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) — converts a plan into Epics, Issues, and repository engineering documentation, dependency-ordered for execution. |
| `Implementer` | Runs [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md) — implements a single `Ready` issue within its acceptance criteria. |
| `Verifier` | Runs [`commands/verify.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/verify.md) — produces the evidence artifact for an implementation; does not implement fixes itself, sends failures back to `Implementer`. |
| `Release-Manager` | Runs [`commands/ship.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/ship.md) — merges, releases, and communicates a verified change. |
| `Repo-Health-Auditor` | Runs [`commands/repo-health.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/repo-health.md) — recurring, cadence-driven assessment across all eight health dimensions. |

## 9. Orchestration Between Personas

**The governing rule: a human, or the command/phase an agent is currently running, is the orchestrator. Personas do not invoke other personas.** An agent operating as `Implementer` does not spawn a `Verifier` sub-agent mid-task to check its own work — it finishes execution, updates state, and hands off; a separate agent (or the same agent starting a new command) picks up `commands/verify.md` next. This mirrors a hard platform constraint on Claude Code specifically (subagents cannot spawn other subagents), but the rule applies regardless of which agent is operating.

The one endorsed exception is **parallel fan-out with a merge step**: independent perspectives on the *same* input, run concurrently, with their reports merged by whoever requested them — never one persona calling another. TFRS makes this available, optionally, for `Risk: High` or `Risk: Critical` items at the [`commands/ship.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/ship.md) gate: a `Reviewer`-persona pass, a `Verifier`-persona pass, and a security check against [`SECURITY_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SECURITY_STANDARD.md) can run concurrently against the same diff, with findings merged before the merge/no-merge decision — each with a fresh context window, none aware of or dependent on the others' output. This is optional guidance for high-stakes work, not a default requirement for every PR; `commands/ship.md`'s standard flow remains sequential.

Do not build a "router" persona whose only job is deciding which other persona to invoke — that's the job of the command layer (`commands/`) and this operating model, not an agent role.

## Summary Loop

```text
Read standards → Read repo docs & issues → Pick next issue → Update state (start)
  → Implement within acceptance criteria → Verify with evidence
  → Update state (PR opened) → Stop or hand off → Update state (closed)
```

This loop applies identically whether the acting agent is Claude Code, GitHub Copilot, or a future agent — the model is agent-agnostic by design. The "Implement within acceptance criteria → Verify with evidence" steps have their own detailed sub-procedure — the nine-step skill-consultation workflow in [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md#the-skill-consultation-workflow) — for exactly how to bring [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) into a given task; this loop doesn't restate that detail.

## Related Documents

- [`AGENTS.md`](./AGENTS.md) — baseline conventions
- [`CLAUDE.md`](./CLAUDE.md) — Claude-specific response and PR conventions
- [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md) — the field vocabulary this document reads and updates on every issue
- [`BACKLOG_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/BACKLOG_STANDARD.md) — how work enters the state this model operates on
- [`GITHUB_PROJECT_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/GITHUB_PROJECT_STANDARD.md) — the optional dashboard layer, consulted only if a repository runs one
- [`commands/execute.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/execute.md), [`commands/verify.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/verify.md), and [`commands/ship.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/ship.md) — the executable procedures this model governs
- [`SECURITY_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SECURITY_STANDARD.md) — referenced by the optional parallel fan-out pattern in section 9
- [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md) — the skill-consultation workflow nested inside this model's Summary Loop
