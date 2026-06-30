# GitHub Project Setup Guide

Use this guide to create the epic-based GitHub Project board for TFR Supply launch work.

## Manual GitHub clicks

1. Open GitHub.
2. Go to the repository or owning organization.
3. Click **Projects**.
4. Click **New project**.
5. Choose **Board**.
6. Name the project: `TFR Supply Launch Board`.
7. Click **Create**.
8. Open the project settings or field configuration panel.
9. Create the `Status` field if it does not already exist.
10. Add the statuses listed below.
11. Create the custom fields listed below.
12. Add the recommended epics as Epic field options.
13. Create the launch issues from `docs/project-management/POLICE-LAUNCH-ISSUES.md`.
14. Assign each issue to the `Police Package Builder Launch` milestone.
15. Set initial status to `Backlog` unless the issue is ready to start.
16. Mark build issues as blocked until linked spec issues are approved.

## Columns / statuses

Create these project statuses exactly:

- Backlog
- Ready
- In Progress
- QA
- Approved
- Released

## Custom fields

Create these custom fields:

| Field | Type | Required usage |
|---|---|---|
| Epic | Single select | Required on every issue |
| Phase | Single select | SPEC, BUILD, QA, RELEASE |
| Agent Persona | Single select | Required on every issue |
| Risk Level | Single select | Low, Medium, High, Critical |
| Protected Files? | Single select | No, Yes - Approval Needed, Yes - Approved |
| Blocked | Checkbox | Checked when waiting on approval, access, or another issue |
| QA Required | Checkbox | Checked for all launch work |

## Recommended Epic field options

Create these exact Epic options:

1. Epic 000 Repository Foundation
2. Platform Architecture
3. Commerce Platform
4. Product Data Platform
5. Package Builder UI
6. Police Launch
7. Fire/EMS Launch
8. Work Truck Launch
9. QA & Regression
10. Documentation & ADRs

## Recommended Phase options

Create these exact Phase options:

- SPEC
- BUILD
- QA
- RELEASE

## Recommended Agent Persona options

Create these exact Agent Persona options:

- Product Architect
- Frontend Engineer
- Data Engineer
- Commerce Engineer
- QA Engineer
- Documentation Engineer
- Security / Platform Engineer

## Recommended Risk Level options

Create these exact Risk Level options:

- Low
- Medium
- High
- Critical

## Recommended Protected Files? options

Create these exact Protected Files? options:

- No
- Yes - Approval Needed
- Yes - Approved

## Board operating rules

- New issues start in Backlog.
- Approved spec issues move to Ready.
- Build issues remain blocked until their spec blockers are Approved.
- Work in active development moves to In Progress.
- Completed implementation moves to QA.
- QA-accepted issues move to Approved.
- Merged/released issues move to Released.

## Automation suggestions

If GitHub Project automation is available:

- New issue added → Backlog.
- Issue assigned → Ready, unless Blocked is checked.
- Pull request linked → In Progress.
- Pull request ready for review → QA.
- Pull request approved → Approved.
- Pull request merged → Released.

## Required manual repository settings

In **Settings → Branches**:

- Protect `develop`.
- Require pull request before merge.
- Require approvals.
- Require CI status checks.
- Require conversation resolution.
- Prevent force pushes.
- Protect `main`, `production`, or `prod` if they exist.

In **Settings → Secrets and variables → Actions**:

- Add deployment, Shopify, or integration secrets manually when needed.
- Never commit secrets to the repository.
