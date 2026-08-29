# Import Boundaries

Job Pilot enforces architectural import rules with [`eslint-plugin-boundaries`](https://www.jsboundaries.dev/docs/overview/).

Run:

```bash
npm run lint
```

Requires `eslint-import-resolver-typescript` (already in devDependencies) so the plugin can resolve local imports.

Configuration lives in [`eslint.boundaries.config.js`](../eslint.boundaries.config.js).

## Layers

| Layer | Path | May import |
|-------|------|------------|
| **domain** | `features/*/domain/` | external packages only |
| **data-access** | `features/*/data-access/` | domain, core |
| **state** | `features/*/state/` | domain, data-access, core |
| **ui** | `features/*/ui/` | domain, state, shared |
| **page** | `features/*/*.page.ts` | ui, state, domain, shared, core |
| **core** | `src/app/core/` | shared |
| **core/webmcp** | `src/app/core/webmcp/` | feature state/domain/data-access, core, shared |
| **shared** | `src/app/shared/` | shared, external |

## Rules in plain language

- **Domain** is pure business logic — no Angular services from other layers, no Firebase.
- **UI** never talks to Firestore directly — it goes through **state**.
- **Pages** compose UI + state — they don't call repositories.
- **WebMCP tools** live in **core/webmcp** and inject **state** / **domain** — same model as the UI.
- **Shared** stays business-agnostic — no `JobOffer`, no feature imports.

## Legacy paths

Until the folder refactor lands, legacy paths are mapped to the same element types:

- `src/app/jobs/ui-*` → `feature-ui`
- `src/app/*/feature-*` → `feature-page`
- `src/app/shared/models` → `feature-domain` (migrate out)

Remove legacy patterns from `eslint.boundaries.config.js` after migration.

## Adding a new file

1. Place it in the correct layer folder.
2. If ESLint warns `no-unknown-files`, add a matching element descriptor.
3. If ESLint errors on an import, either fix the import or discuss whether the rule should change.
