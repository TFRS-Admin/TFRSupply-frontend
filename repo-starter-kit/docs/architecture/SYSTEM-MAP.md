# System Map

Document the major systems and their relationships here.

## Visual flow

```text
User-facing Entry Points
    ↓
Shared UI / Modules
    ↓
Domain Data / Configuration
    ↓
State / Context / Services
    ↓
External Integrations
    ↓
Outputs / Reports / Transactions
```

## Ownership map

| System | Owner persona | Purpose | Inputs | Outputs | Dependencies | Protected files / areas |
|---|---|---|---|---|---|---|
| Entry Points | Product Architect + Frontend Engineer | User-facing pages/routes. | Routes, user actions, approved content. | Rendered experience. | Shared UI, domain data. | App routes/pages. |
| Shared Modules | Frontend Engineer | Reusable UI or logic modules. | Props/configuration. | UI state and events. | Domain contracts. | Shared components. |
| Domain Data | Data Engineer | Approved source data. | Source systems, data contracts. | Validated data. | Data validation. | Data files/databases. |
| Integrations | Integration owner | External services. | Credentials, API contracts. | External effects/results. | Secrets, network, provider APIs. | Env/secrets/integration code. |
| QA/Release | QA Engineer | Verification and release evidence. | Build/test outputs. | QA report, release decision. | CI, screenshots, logs. | CI/release config. |
