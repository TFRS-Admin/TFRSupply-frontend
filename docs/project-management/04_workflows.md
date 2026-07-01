# Workflows

## Issue Lifecycle

1. **Intake**: Create an issue with the correct template, labels, objective, scope, non-goals, and acceptance criteria.
2. **Triage**: Assign epic, priority, owner persona, dependencies, risk level, and target milestone.
3. **Ready for Codex**: Apply `ready-for-codex` only after files allowed to change, forbidden areas, checks, and rollback expectations are explicit.
4. **Implementation**: Create a scoped branch from the current protected base. Keep changes limited to the issue.
5. **Review**: Open a PR linked to the issue. Apply `needs-review` until all required reviewers approve.
6. **QA**: Run automated checks and required smoke tests. Attach evidence for visual, commerce, pricing, or configurator changes.
7. **Ready for Merge**: Apply `ready-for-merge` only after checks pass, documentation is updated, and release impact is known.
8. **Closed**: Close the issue through PR merge or explicit no-op decision with rationale.

## Branch Naming

Use lowercase, hyphenated names:

- `docs/<issue-id>-<short-title>`
- `feature/<issue-id>-<short-title>`
- `migration/<issue-id>-<short-title>`
- `bugfix/<issue-id>-<short-title>`
- `refactor/<issue-id>-<short-title>`
- `hotfix/<issue-id>-<short-title>`
- `infra/<issue-id>-<short-title>`

Branches must describe the work, not the agent. One branch should map to one issue unless a release branch is being prepared.

## Commit Format

Use concise imperative commits:

```text
<type>: <summary>
```

Allowed types:

- `docs`
- `feature`
- `migration`
- `fix`
- `refactor`
- `test`
- `infra`
- `release`

Every commit should be reviewable on its own and avoid mixing product data, application code, and governance documentation unless the issue explicitly requires it.

## PR Workflow

1. Link the governing issue.
2. Summarize changed files and business impact.
3. List tests and checks with exact commands.
4. Document screenshots for perceptible UI changes.
5. Include rollout and rollback notes for release-affecting work.
6. Request reviewer personas matching labels and risk.
7. Address review comments with follow-up commits; do not force-push away reviewed history unless coordination is explicit.
8. Merge only after protected branch requirements pass.

## Release Workflow

1. Open a release issue with scope, included PRs, risk classification, and release owner.
2. Create or update a release branch only when batching changes is necessary.
3. Run required checks: lint, typecheck, build, tests, data validation, and smoke tests.
4. Verify preview or staging routes tied to changed areas.
5. Publish release notes with user impact, operational impact, and rollback plan.
6. Merge or tag the release according to protected branch policy.
7. Perform post-release smoke tests and close release issue with evidence.

## Hotfix Workflow

1. Create a critical bug or incident issue.
2. Branch from production base with `hotfix/<issue-id>-<short-title>`.
3. Limit changes to the minimum safe fix.
4. Run focused regression tests plus lint, typecheck, and build when possible.
5. Obtain expedited approval from architecture and affected domain owner.
6. Deploy and immediately validate the affected production path.
7. Open a follow-up issue for root-cause remediation if the hotfix intentionally leaves debt.

## Emergency Rollback

1. Declare rollback owner and affected release or commit.
2. Freeze non-essential merges until production state is stable.
3. Prefer platform rollback or revert commit over manual mutation.
4. Validate core routes, catalog pages, configurator entry points, and checkout availability after rollback.
5. Record incident timeline, customer impact, cause, rollback command or deployment action, and follow-up prevention work.
