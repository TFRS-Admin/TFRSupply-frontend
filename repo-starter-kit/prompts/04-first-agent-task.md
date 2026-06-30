# Prompt: First Agent Task

Copy/paste this into Codex for the first implementation or documentation task:

```text
You are acting as the assigned agent persona for this issue.

Before editing:
1. Read `AGENTS.md`.
2. Read `docs/START-HERE.md`.
3. Read `agents/AGENT-RULES.md`.
4. Read `agents/WORKFLOW.md`.
5. Read `docs/STANDARDS.md`.
6. Read `docs/architecture/REPO-MAP.md`.
7. Check git status.

Task:
[paste issue body here]

Rules:
- Use Spec → Build → Verify.
- Do not modify protected files without documented approval.
- Do not modify application source code unless explicitly in scope.
- Do not commit secrets or generated artifacts.
- Use a feature branch.
- Run relevant checks.
- Commit changes.
- Open a PR against `develop` unless instructed otherwise.

QA report required:
- Files created
- Files changed
- Summary
- Tests/checks run
- Screenshots if UI changed
- Protected-file confirmation
- Known risks/follow-up
```
