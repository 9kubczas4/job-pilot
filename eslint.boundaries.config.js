// Architectural import boundaries for Job Pilot.
//
// Every route-level feature lives directly under `features/{name}`. A feature
// may import its own layers. Cross-feature dependencies are denied unless an
// explicit consumer -> owner policy is listed below.

const path = require('path');

const projectRoot = path.resolve(__dirname);

const coreLayerTypes = ['core-domains', 'core-infrastructure', 'core-layout', 'core'];

const boundariesElements = [
  { type: 'core-page', pattern: 'src/app/core/pages', partialMatch: true },
  { type: 'core-domains', pattern: 'src/app/core/domains', partialMatch: true },
  { type: 'core-infrastructure', pattern: 'src/app/core/infrastructure', partialMatch: true },
  { type: 'core-layout', pattern: 'src/app/core/layout', partialMatch: true },
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
  { category: 'core-domains', pattern: 'src/app/core/domains/**' },
  { category: 'core-infrastructure', pattern: 'src/app/core/infrastructure/**' },
  { category: 'core-layout', pattern: 'src/app/core/layout/**' },
  { category: 'core', pattern: 'src/app/core/app-paths.ts' },
  { category: 'test', pattern: 'src/test-setup.ts' },
  { category: 'test', pattern: '**/*.spec.ts' },
];

/** App bootstrap / SSR entrypoints — excluded from no-unknown-files IDE false positives. */
const appShellFiles = [
  'src/app/app.ts',
  'src/app/app.config.ts',
  'src/app/app.config.server.ts',
  'src/app/app.routes.ts',
  'src/app/app.routes.server.ts',
  'src/main.ts',
  'src/main.server.ts',
  'src/server.ts',
  'src/app/prerender/**/*.ts',
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
    from: { element: { type: 'feature-domain' } },
    allow: { to: { element: { types: { anyOf: ['core-domains'] } } } },
  },
  {
    from: { element: { type: 'feature-domain' } },
    allow: { to: { file: { categories: 'core-domains' } } },
  },
  {
    from: { element: { type: 'feature-data-access' } },
    allow: { to: { element: { types: { anyOf: ['core-domains'] } } } },
  },
  {
    from: { element: { type: 'feature-data-access' } },
    allow: { to: { file: { categories: 'core-domains' } } },
  },
  {
    from: { element: { type: 'feature-data-access' } },
    allow: { to: { element: { types: { anyOf: ['core-infrastructure'] } } } },
  },
  {
    from: { element: { type: 'feature-data-access' } },
    allow: {
      to: { element: { type: 'feature-domain', captured: sameFeature } },
    },
    message: 'Data-access may only depend on domain owned by the same feature and core.',
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
    allow: { to: { element: { types: { anyOf: ['core-infrastructure'] } } } },
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
    allow: {
      to: { element: { types: { anyOf: ['shared', 'core', 'core-layout', 'core-infrastructure'] } } },
    },
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
    allow: {
      to: { element: { types: { anyOf: ['shared', 'core-layout', 'core-infrastructure', 'core'] } } },
    },
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
    allow: { to: { element: { types: { anyOf: ['shared', 'core', 'core-infrastructure'] } } } },
  },
  {
    from: { element: { type: 'feature-webmcp' } },
    allow: { to: { file: { categories: 'core-infrastructure' } } },
  },

  // Profile page reuses the jobs search header and option labels as explicit public capabilities.
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
    allow: { to: { element: { types: { anyOf: [...coreLayerTypes, 'shared'] } } } },
  },
  {
    from: { element: { type: 'core-layout' } },
    allow: { to: { element: { types: { anyOf: [...coreLayerTypes, 'shared'] } } } },
  },
  {
    from: { element: { type: 'core-infrastructure' } },
    allow: { to: { element: { types: { anyOf: ['core-infrastructure', 'core-domains', 'shared'] } } } },
  },
  {
    from: { element: { type: 'core-domains' } },
    allow: { to: { element: { type: 'core-domains' } } },
  },
  {
    from: { element: { type: 'core' } },
    allow: { to: { element: { types: { anyOf: coreLayerTypes } } } },
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
          types: ['core', 'core-page', 'core-domains', 'core-infrastructure', 'core-layout', 'feature-page', 'feature-webmcp', 'shared'],
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
            'core-domains',
            'core-infrastructure',
            'core-layout',
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
    'boundaries/root-path': projectRoot,
    'boundaries/elements-single-match': true,
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
  appShellFiles,
};
