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
  app.ts, app.config.ts, app.routes.ts   # app-shell (bootstrap only)
  core/                    # auth, firebase, layout, shared domain models
    domains/               # cross-feature business types (e.g. job taxonomy)
    infrastructure/        # Firebase, auth services
    layout/                # AppShell, page scroll helpers
    pages/                 # core-level route pages
    app-paths.ts           # route constants
  shared/                  # business-agnostic UI kit, map helpers, WebMCP response utils
  features/{name}/
    pages/                 # smart page (route target)
    webmcp/                # agent tools for the feature
    ui/                    # presentational components
    domain/                # models and pure business rules
    data-access/           # repositories (Firestore, HTTP)
    state/                 # stores and facades
    shell/                 # app-shell projection slots (header search, etc.)
```

## Packages

| Package | Path | May import | Must not be imported by |
|---------|------|------------|---------------------------|
| **app-shell** | `app.ts`, `app.config.ts`, `app.routes.ts`, `main.ts`, … | `core`, `shared`, `features` (pages, webmcp) | anything (except tests) |
| **core** | `src/app/core/` | `core`, `shared` | — |
| **shared** | `src/app/shared/` | `shared`, external | — |
| **features** | `src/app/features/{name}/` | `shared`, `core`, own feature only | other features |

Features are fully isolated from each other. Shared logic between features belongs in `core/domains/` (e.g. job taxonomy used by both `jobs` and `profile`), not in cross-feature `domain/` imports.

## Feature layers

All layer imports below are scoped to the **same feature** unless noted.

| Layer | Path | May import |
|-------|------|------------|
| **domain** | `features/*/domain/` | external packages, own `domain`, `core/domains` |
| **data-access** | `features/*/data-access/` | own `domain`, `core` |
| **state** | `features/*/state/` | own `domain`, own `data-access`, `core` |
| **shell** | `features/*/shell/` | own `domain`, own `state`, own `ui`, `core` |
| **ui** | `features/*/ui/` | own `domain`, own `ui`, `shared`, `core` |
| **pages** | `features/*/pages/` | own `domain`, own `state`, own `ui`, `shared`, `core` |
| **webmcp** | `features/*/webmcp/` | own `domain`, own `state`, own `webmcp`, `core` |

Route constants live in `core/app-paths.ts` and may be imported by pages, UI, and core.

App shell files (`app.ts`, `app.config.ts`, `app.routes.ts`, `main.ts`) may import core, feature pages, feature webmcp, and shared.

## Rules in plain language

- **Domain** is pure business logic — no Angular services from other layers, no Firebase, no UI.
- **Data-access** talks to Firestore/HTTP and maps results to domain models.
- **State** is the facade for UI and WebMCP — it owns reads/writes via repositories.
- **UI** is presentational — it receives data through `input()` / `output()` and never injects stores or repositories directly.
- **Pages** compose UI + state — they wire smart behaviour but don't call repositories or register WebMCP tools.
- **WebMCP tools** live in `features/*/webmcp/` and inject **state** and **domain** — the same orchestration model as pages, but without importing UI components or repositories.
- **Core** stays feature-agnostic — no imports from `features/`.
- **Shared** stays business-agnostic — no feature-specific models (e.g. no `JobOffer` in shared).

### Dependency direction

```
domain ← data-access ← state ← pages / webmcp
                              ↑
                         ui (dumb, via pages)
```

UI and WebMCP never reach persistence directly — they go through **state**.

## Exceptions

| Scope | Rule |
|-------|------|
| `*.spec.ts` | May import any layer (test convenience) |
| `src/environments/**` | Excluded from boundary linting |
| `src/test-setup.ts` | Treated as test category |

## Adding a new file

1. Place it in the correct layer folder.
2. If ESLint warns `no-unknown-files`, add a matching element descriptor in `eslint.boundaries.config.js`.
3. If ESLint errors on an import, either fix the import or discuss whether the rule should change.

See [ADR-001](../decisions/001-layered-feature-architecture.md) and [ADR-002](../decisions/002-feature-colocated-webmcp-tools.md) for the rationale behind this layout.
