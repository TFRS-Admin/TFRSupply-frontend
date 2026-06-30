# Prompt: Install AI Operating System

Copy/paste this into Codex from the target repository root:

```text
You are acting as the Repository Systems Architect.

Install the AI operating system from `repo-starter-kit/` into this repo.

Rules:
- Read `repo-starter-kit/README.md` first.
- Do not modify application source code.
- Copy starter-kit files into repo-native locations:
  - `repo-starter-kit/AGENTS.md` → `AGENTS.md`
  - `repo-starter-kit/CLAUDE.md` → `CLAUDE.md`
  - `repo-starter-kit/docs/**` → `docs/**`
  - `repo-starter-kit/agents/**` → `agents/**`
  - `repo-starter-kit/github/**` → `.github/**`
- Make templates generic but adapt placeholders to this repo where obvious.
- Preserve existing project-specific docs unless replacing them is explicitly safe.
- Create `develop` from the current default branch if `develop` does not exist.
- Create a feature branch for the install.
- Run available checks, at minimum lint/build/test if present.
- Commit changes.
- Open a PR against `develop`.

QA report required:
- Files created
- Files changed
- Branch name
- PR target branch
- Tests/checks run
- Confirm no application source code changed
```
