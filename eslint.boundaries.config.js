// Architectural import boundaries for Job Pilot.
//
// Every route-level feature lives directly under `features/{name}`. A feature
// may import its own layers. Cross-feature dependencies are denied unless an
// explicit consumer -> owner policy is listed below.

const boundariesElements = [
  { type: 'core-page', pattern: 'src/app/core/pages', partialMatch: true },
  { type: 'core-webmcp', pattern: 'src/app/core/webmcp', partialMatch: true },
  { type: 'core', pattern: 'src/app/core', partialMatch: true },
  { type: 'shared', pattern: 'src/app/shared', partialMatch: false },

  {
    type: 'feature-webmcp',
    pattern: 'src/app/features/*/webmcp',
    capture: ['feature'],
    partialMatch: false,
  },
  {
    type: 'feature-ui',
    pattern: 'src/app/features/*/ui',
    capture: ['feature'],
    partialMatch: false,
  },
  {
    type: 'feature-domain',
    pattern: 'src/app/features/*/domain',
    capture: ['feature'],
    partialMatch: false,
  },
  {
    type: 'feature-data-access',
    pattern: 'src/app/features/*/data-access',
    capture: ['feature'],
    partialMatch: false,
  },
  {
    type: 'feature-state',
    pattern: 'src/app/features/*/state',
    capture: ['feature'],
    partialMatch: false,
  },
  {
    type: 'feature-page',
    pattern: 'src/app/features/*/pages',
    capture: ['feature'],
    partialMatch: false,
  },
];

const boundariesFiles = [
  { category: 'app-shell', pattern: 'src/app/app.ts' },
  { category: 'app-shell', pattern: 'src/app/app.config.ts' },
  { category: 'app-shell', pattern: 'src/app/app.config.server.ts' },
  { category: 'app-shell', pattern: 'src/app/app.routes.ts' },
  { category: 'app-shell', pattern: 'src/app/app.routes.server.ts' },
  { category: 'app-shell', pattern: 'src/main.ts' },
  { category: 'app-shell', pattern: 'src/main.server.ts' },
  { category: 'app-shell', pattern: 'src/server.ts' },
  { category: 'app-shell', pattern: 'src/app/prerender/**' },
  { category: 'core-webmcp', pattern: 'src/app/core/webmcp/**' },
  { category: 'test', pattern: 'src/test-setup.ts' },
  { category: 'test', pattern: '**/*.spec.ts' },
];

const sameFeature = {
  feature: '{{from.element.captured.feature}}',
};

const ownedByJobs = {
  feature: 'jobs',
};

const boundariesPolicies = [
  { allow: { to: { module: { origin: 'external' } } } },
  { allow: { to: { module: { origin: 'core' } } } },

  // A feature can depend on its own layers according to the direction below.
  {
    from: { element: { type: 'feature-domain' } },
    allow: {
      to: { element: { type: 'feature-domain', captured: sameFeature } },
    },
    message: 'Domain may only import domain code owned by the same feature.',
  },
  {
    from: { element: { type: 'feature-data-access' } },
    allow: {
      to: { element: { type: 'feature-domain', captured: sameFeature } },
    },
    message: 'Data-access may only depend on domain owned by the same feature and core.',
  },
  {
    from: { element: { type: 'feature-data-access' } },
    allow: { to: { element: { type: 'core' } } },
  },
  {
    from: { element: { type: 'feature-state' } },
    allow: {
      to: {
        element: {
          types: ['feature-domain', 'feature-data-access'],
          captured: sameFeature,
        },
      },
    },
    message: 'State may only use domain and data-access owned by the same feature.',
  },
  {
    from: { element: { type: 'feature-state' } },
    allow: { to: { element: { type: 'core' } } },
  },
  {
    from: { element: { type: 'feature-ui' } },
    allow: {
      to: {
        element: {
          types: ['feature-ui', 'feature-domain', 'feature-state'],
          captured: sameFeature,
        },
      },
    },
    message: 'UI may only use UI, domain, and state owned by the same feature.',
  },
  {
    from: { element: { type: 'feature-ui' } },
    allow: { to: { element: { types: ['shared', 'core'] } } },
  },
  {
    from: { element: { type: 'feature-page' } },
    allow: {
      to: {
        element: {
          types: ['feature-ui', 'feature-state', 'feature-domain'],
          captured: sameFeature,
        },
      },
    },
    message: 'Pages may compose layers owned by the same feature, not persistence or WebMCP.',
  },
  {
    from: { element: { type: 'feature-page' } },
    allow: { to: { element: { types: ['shared', 'core'] } } },
  },
  {
    from: { element: { type: 'feature-webmcp' } },
    allow: {
      to: {
        element: {
          types: ['feature-webmcp', 'feature-state', 'feature-domain', 'feature-data-access'],
          captured: sameFeature,
        },
      },
    },
    message: 'WebMCP may orchestrate layers owned by the same feature, never UI.',
  },
  {
    from: { element: { type: 'feature-webmcp' } },
    allow: { to: { element: { types: ['shared', 'core', 'core-webmcp'] } } },
  },
  {
    from: { element: { type: 'feature-webmcp' } },
    allow: { to: { file: { categories: 'core-webmcp' } } },
  },

  // Profile reuses the jobs taxonomy and search header as explicit public capabilities.
  {
    from: {
      element: {
        types: ['feature-domain', 'feature-data-access'],
        captured: { feature: 'profile' },
      },
    },
    allow: {
      to: { element: { type: 'feature-domain', captured: ownedByJobs } },
    },
  },
  {
    from: {
      element: { type: 'feature-page', captured: { feature: 'profile' } },
    },
    allow: {
      to: { element: { types: ['feature-domain', 'feature-ui'], captured: ownedByJobs } },
    },
  },

  {
    from: { element: { type: 'core-page' } },
    allow: { to: { element: { types: ['core', 'shared'] } } },
  },
  {
    from: { element: { type: 'core-webmcp' } },
    allow: { to: { element: { type: 'shared' } } },
  },
  {
    from: { element: { type: 'core' } },
    allow: { to: { element: { type: 'shared' } } },
  },
  {
    from: { element: { type: 'shared' } },
    allow: { to: { element: { type: 'shared' } } },
  },

  {
    from: { file: { categories: 'app-shell' } },
    allow: { to: { file: { categories: 'app-shell' } } },
  },
  {
    from: { file: { categories: 'app-shell' } },
    allow: {
      to: {
        element: {
          types: ['core', 'core-page', 'feature-page', 'feature-webmcp', 'shared'],
        },
      },
    },
  },

  {
    from: { file: { categories: 'test' } },
    allow: { to: { file: { categories: ['test', 'app-shell'] } } },
  },
  {
    from: { file: { categories: 'test' } },
    allow: {
      to: {
        element: {
          types: [
            'core',
            'core-page',
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
