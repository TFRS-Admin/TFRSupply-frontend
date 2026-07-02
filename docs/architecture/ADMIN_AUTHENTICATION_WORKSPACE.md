# Admin Authentication Workspace

The Admin Authentication Workspace is a frontend-only authentication boundary for `/admin/*` pages. It lets developers and future administrators sign in as one of a fixed set of deterministic demo identities, and gates `/admin/shopify-sync` and `/admin/quote-builder` behind that sign-in. It does **not** call any identity provider, does not issue a real token, and does not add a backend.

## Purpose

Prior admin pages used two unrelated, partial gates: `checkAdminAccess()` (a Base44-email allowlist check, still used by `AdminQuoteBuilderPage`) and no gate at all (`AdminShopifySyncDashboard`, by explicit prior-issue scope). Neither is a reusable authentication service, and neither models roles, permissions, or a session. This workspace introduces one consistent authentication boundary — types, schemas, an adapter interface, a service, hooks, and a login page — that any current or future `/admin/*` page can depend on without duplicating sign-in logic.

## Boundary

`AdminLoginPage` / `AdminAuthGuard` → `useAdminAuthentication` / `useAdminSession` / `useAdminPermissions` → `adminAuthenticationService` → `AdminAuthAdapter` (`mockAdminAuthAdapter` / `unavailableAdminAuthAdapter`)

This mirrors the existing service-oriented layering (`docs/architecture/SERVICE_LAYER.md`, `docs/architecture/PRICING_DOMAIN.md`): components call hooks, hooks call the service, the service calls the adapter. Nothing below the hook layer imports React or touches browser storage.

## Types and schemas

`src/types/adminAuth.ts` defines the public contracts, each paired with a `z.ZodType<...>` schema in `src/schemas/adminAuth.schema.ts`:

- `AdminRole` — `'super-admin' | 'ops-admin' | 'sales-admin' | 'viewer'`.
- `AdminPermission` — one string per guarded admin surface (`'admin.shopify-sync.view'`, `'admin.quote-builder.view'`, `'admin.quotes.view'`, `'admin.pricing-imports.view'`).
- `AdminUser` — id, label, email, role, and an explicit `permissions` list (permissions are not derived implicitly from role at read time; they are assigned per demo identity so a session can be evaluated with a single array lookup).
- `AdminSession` — `sessionToken`, `user`, `issuedAt`, `expiresAt` (always `null` today — demo sessions do not expire).
- `AuthenticationStatus` — the hook-facing state machine: `'idle' | 'authenticating' | 'authenticated' | 'unauthenticated' | 'error'`.
- `AdminSignInRequest` / `AdminSignInResult` / `AdminAuthError` — the sign-in request/response envelope, matching the `{status, data/session, error}`-shaped results used by the pricing and Shopify foundations.

Both `src/types/index.ts` and `src/schemas/index.ts` re-export these alongside the existing domain contracts.

## Adapter boundary

`src/adapters/adminAuth/`:

- `AdminAuthAdapter` (`adminAuthAdapter.ts`) — `listDemoUsers()`, `signIn(request)`, `signOut(sessionToken)`, `getSession(sessionToken)`.
- `mockAdminAuthAdapter.ts` — `createMockAdminAuthAdapter()` holds an in-memory `Map<sessionToken, AdminSession>` scoped to the adapter instance (same pattern as `createMockShopifyJobQueueAdapter`). Sign-in issues a deterministic token (`mock-admin-session-<userId>-<counter>`) and a fixed `issuedAt` (`2026-07-02T00:00:00.000Z`); nothing is persisted past the adapter instance's lifetime, and no network, crypto, or storage call is made. `mockAdminAuthAdapter` is the shared default instance; `src/adapters/adminAuth/mockAdminAuthUsers.ts` holds the four fixed demo identities (below).
- `unavailableAdminAuthAdapter.ts` — the default when no adapter is injected. `listDemoUsers()` returns `[]`, `signIn()` returns `{status: 'adapter-unavailable', session: null, error: {code: 'adapter-unavailable', retryable: true, ...}}`, `getSession()` returns `null`, `signOut()` is a no-op. This preserves the "no real auth exists" behavior anywhere the mock adapter isn't explicitly wired in, matching `unavailablePricingAdapter`.

Swapping `mockAdminAuthAdapter` for a real adapter in the future requires no service, hook, or page change — only a new module implementing `AdminAuthAdapter`.

## Service

`src/services/adminAuth/adminAuthenticationService.ts` exports `createAdminAuthenticationService(adapter)` and a default singleton (`adminAuthenticationService`) bound to `mockAdminAuthAdapter`, so `/admin/login` is functional out of the box — the same pattern `shopifySyncDashboardService` uses to wire mock Shopify adapters into a live route.

Responsibilities:

- `signIn(request)` — validates the request against `adminSignInRequestSchema`, delegates to `adapter.signIn`, and parses the result against `adminSignInResultSchema` before returning it.
- `signOut(sessionToken)` — delegates to `adapter.signOut`.
- `getSession(sessionToken)` — delegates to `adapter.getSession`; returns `null` immediately for an empty token without calling the adapter.
- `hasPermission(session, permission)` / `hasRole(session, role)` — synchronous, pure evaluation against an already-resolved `AdminSession | null`. A `null` session (no one signed in) fails every check.
- `listDemoUsers()` — delegates to `adapter.listDemoUsers()` so the login page can render the selector.

The service never imports React, never reads `window`/`sessionStorage`, and never calls `fetch` or an SDK — "never call external providers" is enforced structurally by only depending on the injected `AdminAuthAdapter`.

## Session lifecycle

1. **Sign in** — `useAdminAuthentication().signIn(demoUserId)` calls `adminAuthenticationService.signIn`, then writes the returned `sessionToken` to `window.sessionStorage` (`tfr-admin-session-token`) via `src/hooks/adminAuth/adminAuthStorage.ts`.
2. **Restore** — on mount, `useAdminAuthentication` reads the stored token and calls `adminAuthenticationService.getSession(token)`. If the mock adapter no longer has that token (e.g. a fresh page load created a new adapter instance in a different tab, or the in-memory session store was recreated), the stale token is cleared and status becomes `'unauthenticated'`.
3. **Session lookup** — `useAdminSession()` performs the same read-only restoration independently (for components that only need to *read* session state, not drive sign-in/out), and exposes `refresh()`.
4. **Permission/role checks** — `useAdminPermissions()` wraps `useAdminSession()` and formats `hasPermission` / `hasRole` closures plus the current `role`/`permissions` for render use.
5. **Sign out** — `useAdminAuthentication().signOut()` calls `adminAuthenticationService.signOut(token)`, then clears the stored token regardless of adapter outcome.

Session storage lives entirely in the hook layer (`adminAuthStorage.ts`), guarded for non-browser environments (SSR/tests) — it never touches `window` when `window` is undefined, so the same hooks render safely under the repository's Vite-SSR `node --test` stack.

## Mock identity strategy

Four fixed identities live in `src/adapters/adminAuth/mockAdminAuthUsers.ts`, each with an explicit permission list (not a role-implied default), so route protection is deterministic and testable:

| Demo user | Role | Permissions |
| --- | --- | --- |
| Ava Chen | `super-admin` | all four |
| Miguel Torres | `ops-admin` | `admin.shopify-sync.view`, `admin.pricing-imports.view` |
| Priya Patel | `sales-admin` | `admin.quote-builder.view`, `admin.quotes.view` |
| Jordan Lee | `viewer` | none |

There is no registration, password, MFA, or external directory — `/admin/login` only ever lets a visitor pick one of these four and "sign in" as them.

## UI and route integration

- `/admin/login` (`src/pages/AdminLoginPage.jsx`) — lists the demo administrators via `useAdminAuthentication`, signs in on click, displays the resulting session (name, email, role, permissions, token, issued-at), and offers sign-out. Redirects to the page the visitor was trying to reach (`location.state.from`) on successful sign-in, defaulting to `/admin/shopify-sync`.
- `AdminAuthGuard` (`src/components/AdminAuthGuard.jsx`) — a route-element wrapper (not a layout route, since each guarded route needs a different `requiredPermission`) that renders a checking state while `useAdminAuthentication` restores the session, redirects to `/admin/login` if unauthenticated, renders an "Access Restricted" message if the session lacks `requiredPermission`, or renders its children.
- `src/App.jsx` now registers `/admin/login` and wraps `/admin/shopify-sync` (`requiredPermission="admin.shopify-sync.view"`) and `/admin/quote-builder` (`requiredPermission="admin.quote-builder.view"`) in `AdminAuthGuard`. `AdminQuoteBuilderPage`'s existing `checkAdminAccess()` Base44-allowlist check is untouched and still runs inside the guarded route — this workspace adds a session gate in front of it, it does not remove or replace the pre-existing Base44 admin check.

## Explicit non-goals

This workspace does not implement Azure AD, Auth0, Clerk, Supabase Auth, Firebase Auth, OAuth, JWTs, password storage, user registration, MFA, or any backend authentication API. It does not persist sessions past the current browser tab's `sessionStorage` entry plus the in-memory adapter instance, and a full page reload in a fresh tab or a new server-rendered request starts unauthenticated. It does not replace `checkAdminAccess()` on `AdminQuoteBuilderPage` or add a gate to any other existing admin route (`/admin/debug`, `/admin/quotes`, `/admin/pricing-imports`) beyond the two named in scope.

## Future production integration

Swapping to a real identity provider (Azure AD, Auth0, Clerk, Supabase Auth, Firebase Auth, or a first-party backend) requires only a new `AdminAuthAdapter` implementation — real network calls, token verification, and error mapping live entirely inside that adapter. `adminAuthenticationService`, the three hooks, `AdminAuthGuard`, and `AdminLoginPage` would need no changes beyond swapping the adapter passed to `createAdminAuthenticationService`, and `AdminSignInRequest`/`AdminSession` would need extension (e.g. a real `expiresAt`, refresh token, or provider-issued claims) only if the new provider's contract requires fields the current shape doesn't carry.

## Testing

`tests/admin-authentication-workspace.test.mjs` covers: schema validation (valid/invalid role and permission values), the mock adapter (demo user listing, sign-in success/failure, session lookup, sign-out clearing the session), the unavailable adapter (every method fails closed), the service's sign-in → restore → sign-out lifecycle, permission/role evaluation for all four demo identities against both guarded routes' permissions (this is the deterministic core of route protection — `AdminAuthGuard` only calls `adminAuthenticationService.hasPermission`), and SSR smoke renders of `AdminAuthGuard`'s pre-restoration checking state and `AdminLoginPage`'s selector.

**Known gap**: the repository's `node --test` + Vite-SSR stack (`docs/migrations/TESTING_NOTES.md`) has no DOM/jsdom layer, so the *post-restoration* client-side behavior of `AdminAuthGuard` (redirecting to `/admin/login` once `status` resolves to `'unauthenticated'`, or rendering guarded children once `'authenticated'`) is not exercised by an automated browser test — only its synchronous first-paint state is. This mirrors the same gap already recorded for other hook-driven pages in `TESTING_NOTES.md`'s "Not Covered Yet" section, and would be closed by the same recommended next testing layer (Vitest + jsdom + Testing Library).
