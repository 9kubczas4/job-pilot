/** Extra “about the role” angles - merged with template.descriptions for per-offer variation. */
export const ROLE_DESCRIPTION_ANGLES = {
  'Frontend Developer': [
    'Own the customer onboarding wizard and checkout funnel used by 2 000+ business accounts.',
    'Improve Core Web Vitals and bundle budgets for a high-traffic marketing and docs site.',
    'Extend a shared component library consumed by four product squads across the org.',
    'Lead a gradual migration from legacy widgets to modern Angular standalone components.',
  ],
  'Frontend Tech Lead': [
    'Coach mid-level engineers while driving a design-system refresh ahead of a major rebrand.',
    'Own frontend quality gates: bundle analysis, visual regression, and release checklists.',
    'Partner with product on quarterly roadmap breakdowns and realistic capacity planning.',
    'Introduce module federation so three teams can ship UI independently on one domain.',
  ],
  'Staff Frontend Engineer': [
    'Define the frontend RFC process and mentor seniors across two business units.',
    'Own observability for the web client: Real User Monitoring, error budgets, and tracing.',
    'Evaluate and roll out a new build toolchain that cuts CI time for 15+ repositories.',
    'Partner with security on CSP, dependency scanning, and supply-chain hardening for UI assets.',
  ],
  'Senior Frontend Engineer': [
    'Rebuild warehouse operator dashboards with live inventory updates and offline-tolerant views.',
    'Own the reporting module end-to-end: complex filters, exports, and role-based layouts.',
    'Drive accessibility remediation across legacy screens ahead of an enterprise audit.',
    'Introduce visual regression testing and story-driven reviews for the component library.',
  ],
  'Backend Developer': [
    'Own the invoicing microservice that processes thousands of transactions daily.',
    'Build partner-facing webhooks and idempotent retry flows for external integrations.',
    'Modernize a monolithic module into event-driven services with clear bounded contexts.',
    'Improve API latency and caching strategy for mobile clients in peak shopping hours.',
  ],
  'Full Stack Engineer': [
    'Ship a greenfield analytics module from Postgres schema to React dashboards.',
    'Own the internal ops tool used daily by customer success and finance teams.',
    'Replace spreadsheet workflows with a typed TypeScript app and audited API layer.',
    'Build self-service admin features with role-based access and audit logging.',
  ],
  'Cloud Engineer': [
    'Design a multi-account AWS landing zone with guardrails for ten product teams.',
    'Lead a Kubernetes upgrade and node-pool right-sizing initiative to cut cloud spend.',
    'Implement disaster-recovery runbooks and quarterly game days for critical services.',
    'Automate compliance checks (CIS benchmarks, drift detection) across Terraform estates.',
  ],
  'ML Engineer': [
    'Productionize a ranking model with shadow deployments and online A/B evaluation.',
    'Build feature pipelines feeding real-time inference for personalization.',
    'Own model monitoring: drift alerts, retraining schedules, and rollback playbooks.',
    'Partner with legal on bias testing and documentation for customer-facing models.',
  ],
  'Platform Engineer': [
    'Ship a self-service environment provisioner used by every new microservice team.',
    'Maintain golden-path templates: CI, observability defaults, and security baselines.',
    'Reduce developer onboarding time with documented paved roads and internal CLIs.',
    'Run office hours and migration support during a company-wide platform adoption push.',
  ],
  'DevOps Engineer': [
    'Cut release lead time by redesigning promotion pipelines across staging and production.',
    'Own the observability stack: alert tuning, SLO dashboards, and on-call runbooks.',
    'Automate certificate rotation and secrets sync for 30+ services.',
    'Partner with security on container scanning and hardened base images in CI.',
  ],
  'Product Designer': [
    'Redesign the mobile checkout flow after usability studies showed a 40% drop-off.',
    'Lead discovery for a new B2B workflow tool with weekly customer interviews.',
    'Evolve design tokens and Figma libraries ahead of a multi-product rebrand.',
    'Facilitate design sprints with engineering and product for quarterly initiatives.',
  ],
  'Data Engineer': [
    'Rebuild nightly ETL into incremental dbt models with tested contracts and lineage.',
    'Own streaming ingestion for clickstream events feeding personalization features.',
    'Partner with finance on revenue metrics definitions and audited reporting pipelines.',
    'Optimize warehouse spend through partition strategy and query cost reviews.',
  ],
  'Security Engineer': [
    'Run threat modeling for new payment features and track remediation in Jira.',
    'Harden IAM and secrets management across development, staging, and production accounts.',
    'Build developer-friendly SAST gates that block merges without slowing delivery.',
    'Support SOC 2 evidence collection and coordinate third-party penetration tests.',
  ],
  'Mobile Developer': [
    'Ship offline-first flows for field technicians with sync conflict resolution.',
    'Improve cold start time and memory usage flagged in App Store reviews.',
    'Integrate HealthKit / Google Fit data with privacy-first consent UX.',
    'Own the release train: store listings, staged rollouts, and crash triage.',
  ],
  'Engineering Manager': [
    'Scale a squad from four to eight engineers while keeping predictable delivery.',
    'Partner with HR on leveling, compensation bands, and performance review cycles.',
    'Drive hiring for two senior roles and redesign the team on-call rotation.',
    'Align two product streams after an org restructure with clear ownership boundaries.',
  ],
  'Regional Sales Manager': [
    'Expand enterprise ARR in Poland and CEE with a team of five account executives.',
    'Build pipeline in retail verticals through executive workshops and proof-of-value pilots.',
    'Coach reps on multi-threaded deals with procurement and legal stakeholders.',
    'Partner with marketing on regional events, case studies, and localized campaigns.',
  ],
  'Marketing Specialist': [
    'Launch localized landing pages and paid experiments for three new country entries.',
    'Own the editorial calendar: blog, LinkedIn, and nurture emails with UTM discipline.',
    'Report monthly funnel metrics and recommend budget shifts across channels.',
    'Coordinate product marketing assets for feature launches and customer webinars.',
  ],
  'QA Engineer': [
    'Expand Playwright coverage for checkout, billing, and admin flows before peak season.',
    'Introduce contract tests between UI and BFF layers to catch integration regressions.',
    'Own test data strategy and flaky-test triage in nightly CI pipelines.',
    'Embed with two squads to define acceptance criteria and release sign-off checklists.',
  ],
  'Site Reliability Engineer': [
    'Own error budgets for customer APIs and lead blameless post-mortems after incidents.',
    'Automate toil-heavy runbooks and reduce manual deploy steps for on-call engineers.',
    'Run game days and chaos experiments on Kubernetes workloads before Black Friday traffic.',
    'Partner with product teams on capacity planning and graceful degradation patterns.',
  ],
  'Solutions Architect': [
    'Lead discovery workshops for enterprise prospects with complex integration requirements.',
    'Produce reference architectures for multi-tenant SaaS with data residency constraints.',
    'Support sales on RFP responses, security questionnaires, and effort estimates.',
    'Mentor customer engineering teams during phased rollouts and cutover weekends.',
  ],
};

export const DESCRIPTION_INTROS = [
  ({ company, titleLower }) => `${company.name} is hiring a ${titleLower}.`,
  ({ company, titleLower }) => `Join ${company.name} as a ${titleLower}.`,
  ({ company, titleLower, city }) => `${company.name}'s ${city} team is looking for a ${titleLower}.`,
  ({ company, titleLower, workplaceLabel }) => `${company.name} is expanding its ${workplaceLabel} hiring with a ${titleLower} role.`,
  ({ company, titleLower }) => `An experienced ${titleLower} is needed at ${company.name} to strengthen the product engineering org.`,
  ({ company, titleLower, workplaceLabel }) =>
    `${company.name} offers ${workplaceLabel.startsWith('on-') ? 'an' : 'a'} ${workplaceLabel} ${titleLower} position on a cross-functional product team.`,
];

export const WORKPLACE_LABELS = {
  remote: 'remote-first',
  hybrid: 'hybrid',
  onsite: 'on-site',
};
