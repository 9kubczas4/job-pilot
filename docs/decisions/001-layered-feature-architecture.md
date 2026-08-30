# ADR-001: Layered feature architecture with ESLint boundaries

## Status
Accepted

## Date
2026-08-29

## Context

Job Pilot combines a human-facing job board with WebMCP tools that operate on the same domain model. The codebase needs:

- Clear separation between pure business rules, persistence, UI, and agent tools
- Predictable import direction so features don't become a tangled graph
- A structure that scales as features (`jobs`, `profile`, `saved-jobs`) grow independently

## Decision

Organize each feature under `src/app/features/{name}/` with five layers:

| Layer | Responsibility |
|-------|----------------|
| `domain/` | Models and pure functions (matching, formatting, URL parsing) |
| `data-access/` | Firestore and HTTP repositories |
| `state/` | Signal-based stores consumed by UI and WebMCP |
| `ui/` | Presentational components |
| `pages/` | Route-level smart components that compose UI + state |
| `webmcp/` | Agent tools that inject stores (see ADR-002) |

Infrastructure lives in `core/` (auth, Firebase, layout). Business-agnostic code lives in `shared/`.

Enforce import rules with `eslint-plugin-boundaries` - configuration in `eslint.boundaries.config.js`.

## Alternatives Considered

### NgModules per feature
- Pros: Familiar Angular pattern, built-in encapsulation
- Cons: Verbose boilerplate; project uses standalone components and Signals throughout
- Rejected: Standalone + ESLint boundaries achieve the same isolation with less ceremony

### Flat `src/app/jobs/` folder (no layer subfolders)
- Pros: Fewer directories, faster to navigate initially
- Cons: No enforced separation; repositories and components end up co-located
- Rejected: Already caused boundary violations during early development

### Nx monorepo with path-mapped libraries
- Pros: Strongest enforcement, publishable libs
- Cons: Overhead for a single-app hackathon project
- Rejected: ESLint boundaries give 80% of the benefit at 20% of the cost

## Consequences

- Every new file has an obvious home - reduces "where does this go?" debates
- Domain logic is testable without Angular TestBed
- Features are isolated from each other; shared domain types live in `core/domains/` (e.g. job taxonomy used by both `jobs` and `profile`)
- UI and WebMCP reach persistence only through `state/` - never via direct repository imports
- ESLint must be run (`npm run lint`) to catch boundary violations at CI time
