// Architectural import boundaries for Job Pilot.
//
// Target layout:
//   src/app/core/              - infra (auth, firebase, layout, webmcp)
//   src/app/shared/            - business-agnostic utilities and UI kit
//   src/app/features/{name}/
//     {name}.page.ts           - smart page (feature root)
//     ui/                      - presentational components
//     domain/                  - models and pure business rules
//     data-access/             - persistence (Firestore, HTTP)
//     state/                   - client state (stores)
//
// Legacy paths (remove after folder refactor):
//   src/app/{jobs,profile,saved-jobs}/feature-*  -> feature-page
//   src/app/{feature}/ui-*                     -> feature-ui
//   src/app/shared/models                        -> feature-domain (migrate out)

const boundariesElements = [
  // --- Core (most specific first) ---
  { type: 'core-webmcp', pattern: 'src/app/core/webmcp', partialMatch: false },
  { type: 'core-webmcp', pattern: 'src/app/webmcp', partialMatch: false },
  { type: 'core-webmcp', pattern: 'src/app/jobs/webmcp', partialMatch: false },
  { type: 'core-webmcp', pattern: 'src/app/profile/webmcp', partialMatch: false },
  { type: 'core', pattern: 'src/app/core', partialMatch: false },

  // --- Domain in shared (legacy — migrate to features/*/domain) ---
  { type: 'feature-domain', pattern: 'src/app/shared/models', partialMatch: false },
  { type: 'shared', pattern: 'src/app/shared', partialMatch: false },

  // --- Features (target) ---
  { type: 'feature-ui', pattern: 'src/app/features/*/ui', partialMatch: false },
  { type: 'feature-domain', pattern: 'src/app/features/*/domain', partialMatch: false },
  { type: 'feature-data-access', pattern: 'src/app/features/*/data-access', partialMatch: false },
  { type: 'feature-state', pattern: 'src/app/features/*/state', partialMatch: false },
  { type: 'feature-page', pattern: 'src/app/features', partialMatch: false },

  // --- Features (legacy) ---
  { type: 'feature-data-access', pattern: 'src/app/jobs/data-access', partialMatch: false },
  { type: 'feature-data-access', pattern: 'src/app/profile/data-access', partialMatch: false },
  { type: 'feature-data-access', pattern: 'src/app/saved-jobs/data-access', partialMatch: false },
  { type: 'feature-ui', pattern: 'src/app/jobs/ui-job-card', partialMatch: false },
  { type: 'feature-ui', pattern: 'src/app/jobs/ui-filters', partialMatch: false },
  { type: 'feature-ui', pattern: 'src/app/jobs/ui-job-list', partialMatch: false },
  { type: 'feature-ui', pattern: 'src/app/jobs/ui-job-map', partialMatch: false },
  { type: 'feature-page', pattern: 'src/app/jobs/feature-search', partialMatch: false },
  { type: 'feature-page', pattern: 'src/app/jobs/feature-details', partialMatch: false },
  { type: 'feature-page', pattern: 'src/app/profile/feature-profile', partialMatch: false },
  { type: 'feature-page', pattern: 'src/app/saved-jobs/feature-saved-jobs', partialMatch: false },
];

const boundariesFiles = [
  { category: 'app-shell', pattern: 'src/app/app.ts' },
  { category: 'app-shell', pattern: 'src/app/app.config.ts' },
  { category: 'app-shell', pattern: 'src/app/app.routes.ts' },
  { category: 'app-shell', pattern: 'src/main.ts' },
  { category: 'test', pattern: '**/*.spec.ts' },
];

const boundariesPolicies = [
  // External packages
  {
    allow: {
      to: { module: { origin: 'external' } },
    },
  },

  // Node.js built-ins
  {
    allow: {
      to: { module: { origin: 'core' } },
    },
  },

  // Relative imports within the same element (e.g. domain helpers)
  {
    allow: {
      dependency: { relationship: { to: 'internal' } },
      from: { element: { type: 'feature-domain' } },
      to: { element: { type: 'feature-domain' } },
    },
  },

  // --- Domain: pure TS, no app layers ---
  {
    from: { element: { type: 'feature-domain' } },
    disallow: {
      to: {
        element: {
          types: {
            anyOf: [
              'feature-ui',
              'feature-state',
              'feature-data-access',
              'feature-page',
              'core',
              'core-webmcp',
              'shared',
            ],
          },
        },
      },
    },
    message: 'Domain must stay free of UI, state, persistence, and infrastructure imports.',
  },

  // --- Data access ---
  {
    from: { element: { type: 'feature-data-access' } },
    allow: {
      to: { element: { types: ['feature-domain', 'core'] } },
    },
    message: 'Data-access may only depend on domain and core.',
  },

  // --- State ---
  {
    from: { element: { type: 'feature-state' } },
    allow: {
      to: { element: { types: ['feature-domain', 'feature-data-access', 'core'] } },
    },
    message: 'State may depend on domain, data-access, and core.',
  },

  // --- UI ---
  {
    from: { element: { type: 'feature-ui' } },
    allow: {
      to: { element: { types: ['feature-domain', 'feature-state', 'shared'] } },
    },
    message: 'UI may depend on domain, state, and shared — never data-access directly.',
  },

  // --- Feature pages (smart components) ---
  {
    from: { element: { type: 'feature-page' } },
    allow: {
      to: {
        element: {
          types: ['feature-ui', 'feature-state', 'feature-domain', 'shared', 'core'],
        },
      },
    },
    message: 'Pages compose UI and state — not data-access or WebMCP tools.',
  },

  // --- Core WebMCP ---
  {
    from: { element: { type: 'core-webmcp' } },
    allow: {
      to: {
        element: {
          types: ['feature-state', 'feature-domain', 'feature-data-access', 'core', 'shared'],
        },
      },
    },
    message: 'WebMCP tools orchestrate state/domain — not UI.',
  },

  // --- Core (non-webmcp) ---
  {
    from: { element: { type: 'core' } },
    allow: {
      to: { element: { types: ['shared'] } },
    },
    message: 'Core infra must not depend on features.',
  },

  // --- Shared ---
  {
    from: { element: { type: 'shared' } },
    allow: {
      to: { element: { type: 'shared' } },
    },
    message: 'Shared is business-agnostic — no feature or core imports.',
  },

  // --- App shell ---
  {
    from: { file: { categories: 'app-shell' } },
    allow: {
      to: {
        element: {
          types: ['core', 'core-webmcp', 'feature-page', 'shared'],
        },
      },
    },
  },
];

/** @type {import('eslint').Linter.Config} */
const boundariesConfig = {
  name: 'job-pilot/boundaries',
  files: ['src/**/*.ts'],
  settings: {
    'boundaries/root-path': process.cwd(),
    'boundaries/ignore': ['src/environments/**'],
    'boundaries/elements': boundariesElements,
    'boundaries/files': boundariesFiles,
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        message:
          '{{from.element.type}} must not import {{to.element.type}} ({{dependency.source}}).',
        policies: boundariesPolicies,
      },
    ],
    'boundaries/no-unknown-files': 'warn',
  },
};

module.exports = {
  boundariesElements,
  boundariesFiles,
  boundariesPolicies,
  boundariesConfig,
};
