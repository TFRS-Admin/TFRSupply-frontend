# Agent Rules

These rules apply to AI agents working in this repository.

## Before editing

- Confirm the requested scope and identify files likely to change.
- Read `docs/START-HERE.md` and `docs/architecture/REPO-MAP.md`.
- Check the current git status and avoid overwriting user changes.
- Do not change application source code unless the task explicitly requests it.

## During implementation

- Make the smallest practical change that satisfies the request.
- Follow the repository's existing conventions for naming, formatting, and structure.
- Never commit secrets, tokens, credentials, local environment files, or dependency folders.
- Do not wrap imports in `try`/`catch` blocks.
- Keep documentation and workflow changes separate from application behavior changes when possible.

## Verification

- Run the most relevant checks available for the change.
- For this frontend, prefer `npm run lint` and `npm run build` when dependencies are available.
- If a check cannot run because of an environment limitation, record the limitation clearly.

## Pull requests

Every PR should include:

- A concise summary of changes.
- Tests or checks run.
- Known risks or follow-up work.
- Confirmation that application source code was not changed when the task is documentation or agent-infrastructure only.
