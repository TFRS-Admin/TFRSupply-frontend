# Branch Strategy

## Branch Naming

Use lowercase branches with an issue identifier and short title:

- `docs/<issue-id>-<short-title>`
- `feature/<issue-id>-<short-title>`
- `migration/<issue-id>-<short-title>`
- `bugfix/<issue-id>-<short-title>`
- `refactor/<issue-id>-<short-title>`
- `infra/<issue-id>-<short-title>`
- `hotfix/<issue-id>-<short-title>`
- `release/<version-or-date>`

## Release Cadence

- Standard releases ship from the protected main branch after required checks pass.
- Release candidates may be batched weekly when multiple migrations need coordinated QA.
- Hotfixes ship immediately after focused validation and required expedited approval.
- Documentation-only governance changes may merge independently when checks pass.

## Merge Policy

- Prefer squash merge for issue branches to keep main history readable.
- Use merge commits only for release branches that intentionally preserve multiple PR boundaries.
- Rebase local branches before PR review when history is noisy; do not rewrite reviewed history without coordination.
- Every merge must link to an issue, include test evidence, and satisfy Definition of Done.

## Protected Branch Policy

Protected branches must require:

- Pull request review before merge.
- Required checks for lint, typecheck, build, tests, and any configured data validation.
- Up-to-date branch before merge when production-impacting files change.
- Signed or verified commits when organization policy enables them.
- Admin bypass disabled except for documented incidents.
- Force-push disabled.
- Deletion disabled for main and active release branches.

## Review Ownership

- `architecture`: Architect approval.
- `commerce`: Commerce approval.
- `pricing`: Pricing approval.
- `configurator`: Architect plus QA approval.
- `security`: DevOps or security reviewer approval.
- `documentation`: Documentation approval.
- `infrastructure`: DevOps approval.

## Release Branch Handling

A release branch is used only when staging multiple approved PRs before production. It must contain release notes, known risks, rollback path, and post-release validation checklist. Release branches are deleted after merge and tag creation.
