# Import Boundaries

Job Pilot enforces architectural import rules with [`eslint-plugin-boundaries`](https://www.jsboundaries.dev/docs/overview/).

Run:

```bash
npm run lint
```

Requires `eslint-import-resolver-typescript` (already in devDependencies) so the plugin can resolve local imports.

Configuration lives in [`eslint.boundaries.config.js`](../../eslint.boundaries.config.js).

## Folder layout

```
src/app/
  core/                    # auth, firebase, layout, home page
    pages/
  shared/                  # business-agnostic UI kit, map helpers, WebMCP response utils
  features/{name}/
    pages/                 # smart page (route target)
    webmcp/                # agent tools for the feature
    ui/                    # presentational components
    domain/                # models and pure business rules
    data-access/           # repositories (Firestore, HTTP)
    state/                 # stores and facades
    {subfeature}/          # optional nested slice (e.g. jobs/saved-jobs)
```

## Layers

| Layer | Path | May import |
|-------|------|------------|
| **domain** | `features/*/domain/` | external packages, sibling feature domain |
| **data-access** | `features/*/data-access/` | domain, core |
| **state** | `features/*/state/` | domain, data-access, core |
| **ui** | `features/*/ui/` | domain, state, shared, core, sibling ui |
| **page** | `features/*/pages/` | ui, state, domain, shared, core |
| **webmcp** | `features/*/webmcp/` | state, domain, data-access, shared, core |
| **core** | `src/app/core/` (excl. pages) | shared |
| **core-page** | `src/app/core/pages/` | core, shared |
| **shared** | `src/app/shared/` | shared, external |

Route constants live in `core/app-paths.ts` and may be imported by pages, UI, and core.

App shell files (`app.ts`, `app.config.ts`, `app.routes.ts`, `main.ts`) may import core, feature pages, feature webmcp, and shared.

## Rules in plain language

- **Domain** is pure business logic - no Angular services from other layers, no Firebase, no UI.
- **UI** never talks to Firestore directly - it goes through **state**.
- **Pages** compose UI + state - they don't call repositories or register WebMCP tools.
- **WebMCP tools** live in **`features/*/webmcp/`** and inject **state** / **domain** / **data-access** - the same model as the UI, but without importing UI components.
- **Core** stays feature-agnostic - no imports from `features/`.
- **Shared** stays business-agnostic - no feature-specific models (e.g. no `JobOffer` in shared).

## Adding a new file

1. Place it in the correct layer folder.
2. If ESLint warns `no-unknown-files`, add a matching element descriptor in `eslint.boundaries.config.js`.
3. If ESLint errors on an import, either fix the import or discuss whether the rule should change.

See [ADR-001](../decisions/001-layered-feature-architecture.md) and [ADR-002](../decisions/002-feature-colocated-webmcp-tools.md) for the rationale behind this layout.
