<!-- Purpose: Standardize pull request summaries, validation notes, and self-review for this repository. -->
# Summary

Provide a concise explanation of the change.

# Governing Issue

Closes #

# Type of Change

- [ ] Feature
- [ ] Fix
- [ ] Docs
- [ ] Chore

# Files Changed

List the main files or directories touched.

# Testing Notes

Describe automated checks, manual validation, or why no tests were available. Paste output of the commands you ran:

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

# Checklist

- [ ] I self-reviewed the diff.
- [ ] I updated documentation when needed (including `docs/architecture/ARCHITECTURE.md` if a boundary changed).
- [ ] I verified no secrets were introduced.
- [ ] Only files in this issue's declared scope were touched.
- [ ] If this PR closes/touches a `docs/engineering/backlog/` work item, its `status` and any relevant narrative are updated **in this PR**, not as a follow-up — a stale backlog index was found and corrected during the 2026-08-04 Engineering OS re-sync; don't reintroduce that gap.
