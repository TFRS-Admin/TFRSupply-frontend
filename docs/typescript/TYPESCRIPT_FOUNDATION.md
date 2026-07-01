# TypeScript Foundation

## Purpose

This foundation enables TypeScript in the TFRSupply frontend without migrating existing application code, renaming JSX files, or changing runtime behavior.

## Scope

Configured in this change:

- TypeScript compiler configuration through `tsconfig.json`.
- Existing JavaScript editor compatibility through `jsconfig.json` extending the TypeScript config.
- Vite `@/*` path alias resolution for source imports.
- `npm run typecheck` for no-emit TypeScript validation.
- ESLint boundaries that preserve current JavaScript lint coverage while TypeScript parser dependencies are unavailable in this environment.

## Mixed JS/TS Operation

The repository is intentionally configured for gradual adoption:

- Existing `.js` and `.jsx` files remain valid and are included by TypeScript via `allowJs`.
- JavaScript semantic checking is disabled with `checkJs: false` to avoid turning the foundation PR into an application migration.
- New TypeScript files may be added as `.ts` or `.tsx` in future PRs.
- The compiler runs with `noEmit`, so Vite remains responsible for bundling.

## Migration Rules

Future TypeScript migration work should follow these rules:

1. Do not rename files unless the issue specifically requests migration of that file or module.
2. Keep runtime behavior unchanged when adding types.
3. Prefer typing pure domain, service, and adapter modules before React components.
4. Add shared types near the domain they describe before creating global type barrels.
5. Keep `strict` disabled until the JavaScript surface has been reduced enough for a dedicated strictness issue.

## Recommended Next Steps

1. Add TypeScript ESLint parser support when registry access allows installing `typescript-eslint` packages.
2. Create a shared domain types issue for configurator sessions, SKU options, Shopify mappings, and quote payloads.
3. Migrate one pure utility or service module as the first low-risk `.ts` conversion.
