// Architectural import boundaries for Job Pilot.
//
// Layout:
//   src/app/core/              - infra (auth, firebase, layout)
//   src/app/shared/            - business-agnostic utilities and UI kit
//   src/app/features/{name}/
//     {name}.page.ts           - smart page (feature root)
//     webmcp/                  - agent tools for the feature
//     ui/                      - presentational components
//     domain/                  - models and pure business rules
//     data-access/             - persistence (Firestore, HTTP)
//     state/                   - client state (stores)

const boundariesElements = [
  // --- Core ---
  { type: 'core', pattern: 'src/app/core', partialMatch: false },

  // --- Shared ---
  { type: 'shared', pattern: 'src/app/shared', partialMatch: false },

  // --- Features (most specific first) ---
  { type: 'feature-webmcp', pattern: 'src/app/features/*/webmcp', partialMatch: true },
  { type: 'feature-ui', pattern: 'src/app/features/*/ui', partialMatch: true },
  { type: 'feature-domain', pattern: 'src/app/features/*/domain', partialMatch: false },
  { type: 'feature-data-access', pattern: 'src/app/features/*/data-access', partialMatch: false },
  { type: 'feature-state', pattern: 'src/app/features/*/state', partialMatch: false },
  { type: 'feature-page', pattern: 'src/app/features/jobs', partialMatch: true },
  { type: 'feature-page', pattern: 'src/app/features/profile', partialMatch: true },
  { type: 'feature-page', pattern: 'src/app/features/saved-jobs', partialMatch: true },
];

const boundariesFiles = [
  { category: 'app-shell', pattern: 'src/app/app.ts' },
  { category: 'app-shell', pattern: 'src/app/app.config.ts' },
  { category: 'app-shell', pattern: 'src/app/app.routes.ts' },
  { category: 'app-routing', pattern: 'src/app/app-paths.ts' },
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

  // Cross-feature domain imports (shared enums between profile and jobs)
  {
    from: { element: { type: 'feature-domain' } },
    allow: {
      to: { element: { type: 'feature-domain' } },
    },
  },

  // UI components may import sibling UI within the same feature
  {
    from: { element: { type: 'feature-ui' } },
    allow: {
      to: { element: { type: 'feature-ui' } },
    },
  },

  // WebMCP tools internal imports
  {
    allow: {
      dependency: { relationship: { to: 'internal' } },
      from: { element: { type: 'feature-webmcp' } },
      to: { element: { type: 'feature-webmcp' } },
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

  // --- Feature WebMCP ---
  {
    from: { element: { type: 'feature-webmcp' } },
    allow: {
      to: {
        element: {
          types: ['feature-state', 'feature-domain', 'feature-data-access', 'shared'],
        },
      },
    },
    message: 'WebMCP tools orchestrate state/domain — not UI.',
  },

  // --- Core ---
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

  // App routing constants
  {
    from: { file: { categories: 'app-shell' } },
    allow: {
      to: { file: { categories: 'app-routing' } },
    },
  },
  {
    from: { element: { types: ['feature-page', 'feature-ui', 'core'] } },
    allow: {
      to: { file: { categories: 'app-routing' } },
    },
  },

  // --- App shell ---
  {
    from: { file: { categories: 'app-shell' } },
    allow: {
      to: { file: { categories: 'app-shell' } },
    },
  },
  {
    from: { file: { categories: 'app-shell' } },
    allow: {
      to: {
        element: {
          types: ['core', 'feature-page', 'feature-webmcp', 'shared'],
        },
      },
    },
  },

  // --- Tests ---
  {
    from: { file: { categories: 'test' } },
    allow: {
      to: { file: { categories: 'app-shell' } },
    },
  },
  {
    from: { file: { categories: 'test' } },
    allow: {
      to: {
        element: {
          types: [
            'core',
            'feature-page',
            'feature-webmcp',
            'feature-ui',
            'feature-state',
            'feature-domain',
            'feature-data-access',
            'shared',
          ],
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
