# Issue Templates

## Architecture

```markdown
## Objective

## Current Architecture

## Proposed Architecture

## Affected Boundaries
- React:
- Hooks:
- Services:
- Loaders:
- Validators/Schemas:
- Data:

## Non-Goals

## Dependency Direction Check

## Acceptance Criteria
- [ ] Documentation updated.
- [ ] No runtime behavior changes unless explicitly approved.
- [ ] Architecture diagram updated when dependencies change.
- [ ] Risks and rollback path documented.

## Validation Plan

## Agent Assignment
```

## Feature

```markdown
## User / Business Outcome

## Scope

## Out of Scope

## User Flow

## Data and Service Dependencies

## Accessibility Requirements

## Acceptance Criteria
- [ ] Feature is service-backed where platform data is required.
- [ ] Loading, empty, success, and error states are defined.
- [ ] Tests cover expected behavior and failure paths.
- [ ] Documentation and release notes are updated.

## QA Plan

## Rollback Plan
```

## Migration

```markdown
## Migration Target

## Current Dependency Path

## Target Dependency Path

## Behavior Preservation Requirements

## Files Allowed to Change

## Files Forbidden to Change

## Acceptance Criteria
- [ ] Runtime behavior is unchanged unless explicitly listed.
- [ ] Direct legacy imports are removed only from the migrated scope.
- [ ] Service, hook, or loader tests are updated.
- [ ] Migration notes are added under docs/migrations when runtime surfaces change.

## Smoke Test Checklist

## Rollback Plan
```

## Bug

```markdown
## Problem

## Impact

## Reproduction Steps

## Expected Behavior

## Actual Behavior

## Affected Routes / Services / Data

## Suspected Cause

## Acceptance Criteria
- [ ] Root cause is documented.
- [ ] Regression test is added when practical.
- [ ] Fix is limited to the affected boundary.
- [ ] QA verifies the original reproduction path.

## Severity
- [ ] Critical
- [ ] High
- [ ] Medium
- [ ] Low
```

## Refactor

```markdown
## Refactor Goal

## Current Problem

## Target Structure

## Behavior Preservation Requirements

## Acceptance Criteria
- [ ] Public behavior is unchanged.
- [ ] Imports follow approved dependency direction.
- [ ] Dead code is removed only when proven unused.
- [ ] Tests and type checks pass.

## Validation Plan

## Rollback Plan
```

## Documentation

```markdown
## Documentation Goal

## Audience

## Documents to Create or Update

## Source Material

## Acceptance Criteria
- [ ] Documentation is complete and production-ready.
- [ ] No placeholders or stale references remain.
- [ ] Commands, file paths, and ownership are explicit.
- [ ] Related docs are cross-linked when appropriate.

## Reviewers
```

## Research

```markdown
## Research Question

## Decision Needed

## Constraints

## Sources to Review

## Output Required
- [ ] Findings summary.
- [ ] Recommendation.
- [ ] Risks.
- [ ] Follow-up issues.

## Acceptance Criteria
- [ ] Findings cite reviewed repository files or authoritative external sources.
- [ ] Recommendation includes implementation implications.
- [ ] No application code changes are included.
```

## QA

```markdown
## QA Objective

## Build / Environment

## Test Scope

## Test Data

## Acceptance Criteria
- [ ] Critical paths are verified.
- [ ] Failures include reproduction steps, screenshots when visual, and logs when available.
- [ ] Release-blocking issues are labeled correctly.
- [ ] QA evidence is attached to the related PR or release.

## Results
- Pass:
- Fail:
- Blocked:
```

## Performance

```markdown
## Performance Goal

## Affected Route / Component / Service

## Baseline Metrics

## Target Metrics

## Measurement Method

## Acceptance Criteria
- [ ] Performance measurement is repeatable.
- [ ] Bundle, render, network, or data bottleneck is identified.
- [ ] Optimization does not change product behavior.
- [ ] Before and after metrics are documented.

## Rollback Plan
```

## Infrastructure

```markdown
## Infrastructure Goal

## Affected Environment

## Configuration Changes

## Secrets / Variables

## Deployment Impact

## Acceptance Criteria
- [ ] Change is documented.
- [ ] Required checks and rollback steps are defined.
- [ ] Secrets are never committed.
- [ ] Production impact window is approved when applicable.

## Validation Plan

## Rollback Plan
```
