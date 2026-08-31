import {
  DESCRIPTION_INTROS,
  ROLE_DESCRIPTION_ANGLES,
  WORKPLACE_LABELS,
} from './job-role-contexts.mjs';

/** Role-specific copy and salary bands (monthly gross USD). */
export const ROLE_TEMPLATES = [
  {
    title: 'Frontend Developer',
    stack: ['Angular', 'TypeScript', 'RxJS'],
    seniority: ['regular', 'senior'],
    salary: { poland: [5200, 8200], us: [7500, 11500] },
    descriptions: [
      'Build polished, accessible user interfaces for a B2B SaaS product used by thousands of customers daily. You will own feature delivery from design handoff through production release.',
      'Join a product squad shipping responsive web experiences with a strong focus on performance, maintainability, and design-system consistency.',
    ],
    responsibilities: [
      'Implement UI features in Angular with reusable, testable components',
      'Translate Figma designs into pixel-accurate, responsive layouts',
      'Collaborate with backend engineers on API contracts and error handling',
      'Write unit and integration tests for critical user flows',
      'Participate in code reviews and frontend guild sessions',
    ],
    requirements: [
      '3+ years of commercial frontend development experience',
      'Solid TypeScript and modern Angular (signals, standalone components)',
      'Experience with RxJS and state management patterns',
      'Understanding of REST APIs and async data loading',
      'Comfortable working in an agile, product-led team',
    ],
    niceToHave: [
      'NgRx or other structured state libraries',
      'Accessibility (WCAG 2.1) auditing experience',
      'Experience with design tokens and component libraries',
      'Basic knowledge of CI/CD for frontend pipelines',
    ],
    benefits: [
      ['Flexible working hours', 'Annual learning budget (2 000 USD)', 'Private medical care'],
      ['Home-office stipend', 'Conference ticket allowance', 'Mentorship program'],
      ['25+ days paid time off', 'Equipment budget', 'Team offsites twice a year'],
    ],
  },
  {
    title: 'Frontend Tech Lead',
    stack: ['React', 'TypeScript', 'Next.js'],
    seniority: ['senior', 'expert'],
    salary: { poland: [9000, 12500], us: [12000, 16500] },
    descriptions: [
      'Lead a frontend chapter of 4–6 engineers building a customer portal on React and Next.js. You set technical direction while still contributing hands-on code.',
      'Shape frontend architecture for a scale-up modernizing its legacy UI into a modular React ecosystem with SSR and edge delivery.',
    ],
    responsibilities: [
      'Define frontend architecture, coding standards, and review practices',
      'Break down epics with product and mentor mid-level developers',
      'Drive adoption of Next.js App Router and performance budgets',
      'Partner with design on component API and design-system evolution',
      'Own production incidents affecting the web client when needed',
    ],
    requirements: [
      '5+ years in frontend engineering with 2+ years in a lead role',
      'Deep React and TypeScript expertise, including hooks and composition',
      'Production experience with Next.js (SSR, routing, data fetching)',
      'Track record of shipping large features with measurable impact',
      'Strong communication skills in English',
    ],
    niceToHave: [
      'Experience introducing micro-frontends or module federation',
      'Familiarity with React Server Components',
      'Background in e-commerce or fintech domains',
      'Contributions to open-source UI libraries',
    ],
    benefits: [
      ['Leadership training budget', 'Stock options or phantom shares', 'Premium health package'],
      ['4 remote weeks per year abroad', 'Dedicated leadership coach', 'Top-tier laptop setup'],
      ['Annual team summit', 'Flexible hours', 'Parental leave top-up'],
    ],
  },
  {
    title: 'Staff Frontend Engineer',
    stack: ['React', 'TypeScript', 'GraphQL'],
    seniority: ['expert'],
    salary: { poland: [11000, 15000], us: [14500, 19000] },
    descriptions: [
      'Staff-level IC role spanning multiple product teams. You tackle cross-cutting frontend challenges: performance, observability, and platform tooling.',
      'Influence company-wide frontend strategy while partnering with staff backend and design peers on a unified customer experience.',
    ],
    responsibilities: [
      'Design and roll out frontend platform capabilities (build tooling, linting, testing)',
      'Lead performance initiatives: Core Web Vitals, bundle analysis, caching',
      'Author RFCs for major technical decisions and drive consensus',
      'Mentor senior engineers and raise the bar in code reviews',
      'Represent frontend in architecture reviews and incident post-mortems',
    ],
    requirements: [
      '8+ years of frontend experience with staff-level scope',
      'Expert-level React, TypeScript, and GraphQL client patterns',
      'Demonstrated impact on org-wide engineering metrics',
      'Experience designing systems used by 10+ engineers',
      'Ability to simplify complex trade-offs for non-technical stakeholders',
    ],
    niceToHave: [
      'Prior experience in a platform or infrastructure-adjacent team',
      'Knowledge of edge/CDN configuration for static assets',
      'Speaking experience at meetups or conferences',
      'Familiarity with experimentation platforms (A/B testing)',
    ],
    benefits: [
      ['Equity participation', 'Unlimited learning budget', 'Executive health plan'],
      ['Fully remote within EU/US time zones', 'Sabbatical after 4 years', 'Home office setup up to 3 000 USD'],
      ['Annual innovation week', 'Paid open-source contribution time', 'Premium equipment refresh cycle'],
    ],
  },
  {
    title: 'Senior Frontend Engineer',
    stack: ['Vue', 'TypeScript', 'Pinia'],
    seniority: ['senior'],
    salary: { poland: [7500, 11000], us: [10000, 14000] },
    descriptions: [
      'Senior engineer on a Vue 3 product team rebuilding a logistics dashboard used by warehouse operators across Europe.',
      'Own complex UI modules end-to-end in a Vue + TypeScript codebase with Pinia for state and Vite for builds.',
    ],
    responsibilities: [
      'Deliver high-complexity features with minimal supervision',
      'Improve component library coverage and documentation',
      'Optimize rendering for data-heavy tables and live updates',
      'Support QA with test plans for critical UI paths',
      'Onboard new team members on frontend conventions',
    ],
    requirements: [
      '4+ years with Vue (Vue 3 Composition API required)',
      'Strong TypeScript skills and Pinia or Vuex experience',
      'Experience with unit testing (Vitest/Jest) and E2E (Cypress/Playwright)',
      'Understanding of web security basics (XSS, CSRF)',
      'Fluent English for daily stand-ups and documentation',
    ],
    niceToHave: [
      'Nuxt 3 or SSR experience',
      'WebSocket or SSE real-time UI patterns',
      'Experience in logistics, supply chain, or IoT dashboards',
      'Familiarity with Tailwind or utility-first CSS',
    ],
    benefits: [
      ['Hybrid schedule (2 days office)', 'Sport subscription', 'Lunch card'],
      ['Remote Fridays', 'Training platform access', 'Referral bonuses'],
      ['Medical and dental care', 'Flexible start times', 'Team building budget'],
    ],
  },
  {
    title: 'Backend Developer',
    stack: ['Node.js', 'TypeScript', 'PostgreSQL'],
    seniority: ['regular', 'senior'],
    salary: { poland: [6000, 10000], us: [8500, 13000] },
    descriptions: [
      'Develop REST and event-driven services powering a subscription billing platform. Stack: Node.js, TypeScript, PostgreSQL, Redis.',
      'Join a backend squad responsible for order processing APIs serving mobile apps and partner integrations.',
    ],
    responsibilities: [
      'Design and implement HTTP APIs with clear versioning and error contracts',
      'Write efficient SQL queries and database migrations',
      'Integrate with third-party payment and notification providers',
      'Add observability: structured logging, metrics, and tracing',
      'Participate in on-call rotation (shared, lightweight)',
    ],
    requirements: [
      '3+ years of backend development with Node.js',
      'Production PostgreSQL experience (indexing, transactions)',
      'Solid TypeScript and async/await patterns',
      'Familiarity with Docker and containerized deployments',
      'Understanding of authentication (JWT, OAuth2)',
    ],
    niceToHave: [
      'Kafka or RabbitMQ messaging experience',
      'NestJS or Fastify framework knowledge',
      'Stripe or Adyen payment integration background',
      'Experience with feature flags and gradual rollouts',
    ],
    benefits: [
      ['On-call compensation', 'Private healthcare', 'Flexible hours'],
      ['Cloud certification reimbursement', 'Hack days quarterly', 'Bike parking / commuter benefit'],
      ['Learning budget', 'Team lunches', 'Extra days off for volunteering'],
    ],
  },
  {
    title: 'Full Stack Engineer',
    stack: ['TypeScript', 'React', 'Node.js'],
    seniority: ['regular', 'senior'],
    salary: { poland: [7000, 11000], us: [9500, 14500] },
    descriptions: [
      'Full stack role on a small product team: you ship features across React UI and Node.js APIs for an internal ops tool.',
      'End-to-end ownership from database schema to UI for a greenfield module in a TypeScript monorepo.',
    ],
    responsibilities: [
      'Build full features spanning React frontend and Express/Nest APIs',
      'Design database schemas and write migrations',
      'Implement authentication and role-based access in the stack',
      'Deploy services via CI/CD pipelines to cloud environments',
      'Collaborate directly with product owners on scope and timelines',
    ],
    requirements: [
      '4+ years across frontend and backend TypeScript',
      'React experience with modern hooks and component patterns',
      'Node.js API development and ORM usage (Prisma/TypeORM)',
      'Comfortable with Git flow and peer code reviews',
      'Pragmatic approach to testing critical paths',
    ],
    niceToHave: [
      'Monorepo tooling (Nx, Turborepo)',
      'GraphQL or tRPC API experience',
      'Basic DevOps: Terraform or Kubernetes exposure',
      'Prior startup or scale-up experience',
    ],
    benefits: [
      ['Broad ownership and minimal bureaucracy', 'Equity for senior hires', 'Remote-friendly culture'],
      ['Annual retreat', 'Home internet stipend', 'Wellness allowance'],
      ['Conference budget', 'Flexible PTO', 'Top-spec developer hardware'],
    ],
  },
  {
    title: 'Cloud Engineer',
    stack: ['AWS', 'Terraform', 'Kubernetes'],
    seniority: ['senior', 'expert'],
    salary: { poland: [9500, 13500], us: [12500, 17500] },
    descriptions: [
      'Design and operate cloud infrastructure on AWS for a multi-tenant SaaS platform. Infrastructure as code with Terraform and workloads on EKS.',
      'Cloud engineer role focused on reliability, cost optimization, and secure landing zones for product engineering teams.',
    ],
    responsibilities: [
      'Provision and maintain AWS resources via Terraform modules',
      'Operate Kubernetes clusters: upgrades, autoscaling, networking',
      'Implement IAM policies, secrets management, and compliance controls',
      'Build CI/CD integrations for infrastructure changes with review gates',
      'Monitor cloud spend and right-size resources quarterly',
    ],
    requirements: [
      '4+ years managing production AWS environments',
      'Hands-on Terraform and modular IaC practices',
      'Kubernetes administration (EKS or equivalent)',
      'Understanding of VPC design, load balancing, and DNS',
      'Experience with incident response in cloud environments',
    ],
    niceToHave: [
      'AWS certifications (Solutions Architect or DevOps)',
      'Service mesh experience (Istio/Linkerd)',
      'FinOps or cost allocation tooling',
      'Multi-region disaster recovery planning',
    ],
    benefits: [
      ['AWS certification paid', 'On-call bonus', 'Premium medical'],
      ['Remote work from EU', 'Infrastructure home lab budget', 'Conference attendance'],
      ['Extra PTO', 'Pension/retirement contribution', 'Flexible schedule'],
    ],
  },
  {
    title: 'ML Engineer',
    stack: ['Python', 'PyTorch', 'MLOps'],
    seniority: ['senior', 'expert'],
    salary: { poland: [10000, 14500], us: [13500, 18500] },
    descriptions: [
      'Build and deploy machine learning models for recommendation and ranking in a consumer marketplace. MLOps pipeline from training to A/B evaluation.',
      'ML engineer joining a data science team to productionize NLP models for document classification and entity extraction.',
    ],
    responsibilities: [
      'Train and evaluate models with PyTorch or scikit-learn',
      'Package models for serving (Docker, batch and real-time endpoints)',
      'Maintain feature stores and data validation checks',
      'Collaborate with data engineers on training datasets',
      'Monitor model drift and retraining triggers in production',
    ],
    requirements: [
      '3+ years in ML engineering or applied data science',
      'Strong Python and experience with PyTorch or TensorFlow',
      'Familiarity with MLOps tools (MLflow, Kubeflow, or SageMaker)',
      'Solid statistics and experiment design fundamentals',
      'Experience with cloud GPU workloads',
    ],
    niceToHave: [
      'LLM fine-tuning or RAG pipeline experience',
      'Spark or Databricks for large-scale data',
      'Published research or Kaggle rankings',
      'Knowledge of responsible AI and bias testing',
    ],
    benefits: [
      ['GPU cloud credits for experiments', 'Research paper subscription', 'Flexible hours'],
      ['Stock options', 'Data conference budget', 'Cross-team ML guild'],
      ['Health and mental wellness package', 'Remote-first', 'Sabbatical policy'],
    ],
  },
  {
    title: 'Platform Engineer',
    stack: ['Go', 'Kubernetes', 'Docker'],
    seniority: ['senior'],
    salary: { poland: [9000, 13000], us: [11500, 16000] },
    descriptions: [
      'Internal developer platform team building golden paths for 50+ engineers: CI templates, service scaffolding, and self-service environments.',
      'Platform engineer improving the paved road for microservices on Kubernetes with Go-based control plane components.',
    ],
    responsibilities: [
      'Develop platform services and CLIs in Go',
      'Maintain Kubernetes operators and Helm charts',
      'Define service templates, observability defaults, and SLO baselines',
      'Support product teams during migrations to the platform',
      'Document runbooks and internal platform RFCs',
    ],
    requirements: [
      '5+ years in software engineering with platform focus',
      'Production Go development experience',
      'Deep Kubernetes knowledge (networking, RBAC, workloads)',
      'Docker and container security best practices',
      'Experience supporting internal customers (developer empathy)',
    ],
    niceToHave: [
      'Backstage or similar developer portal experience',
      'GitOps workflows (Argo CD, Flux)',
      'Policy-as-code (OPA/Kyverno)',
      'Prior SRE or DevOps background',
    ],
    benefits: [
      ['Platform guild meetups', 'Learning stipend', 'Remote within timezone'],
      ['On-call rotation with compensation', 'Top-tier hardware', 'Health insurance'],
      ['Innovation days', 'Open-source Friday afternoons', 'Team offsite'],
    ],
  },
  {
    title: 'DevOps Engineer',
    stack: ['CI/CD', 'AWS', 'Observability'],
    seniority: ['regular', 'senior'],
    salary: { poland: [7500, 11500], us: [10000, 15000] },
    descriptions: [
      'DevOps engineer owning CI/CD pipelines, release automation, and observability stack (Prometheus, Grafana, Loki) for a microservices estate.',
      'Bridge development and operations: automate deployments, improve mean time to recovery, and harden release processes.',
    ],
    responsibilities: [
      'Maintain GitHub Actions / GitLab CI pipelines for 20+ services',
      'Manage AWS deployment targets and environment promotion',
      'Configure alerting, dashboards, and SLO error budgets',
      'Automate secrets rotation and certificate management',
      'Support developers with local dev environments and debugging',
    ],
    requirements: [
      '3+ years in DevOps or site reliability roles',
      'Strong CI/CD design and troubleshooting skills',
      'AWS operational experience (ECS, EKS, or Lambda)',
      'Observability tooling: metrics, logs, traces',
      'Scripting in Bash or Python for automation',
    ],
    niceToHave: [
      'Ansible or configuration management experience',
      'Infrastructure testing (Terratest, kitchen-terraform)',
      'Experience with blue-green or canary deployments',
      'ITIL or change management familiarity',
    ],
    benefits: [
      ['On-call pay', 'Certification budget', 'Flexible remote'],
      ['Gym membership', 'Team tooling budget', 'Extra vacation days'],
      ['Medical package for family', 'Commuter or parking benefit', 'Lunch allowance onsite'],
    ],
  },
  {
    title: 'Product Designer',
    stack: ['Figma', 'Design systems', 'UX research'],
    seniority: ['regular', 'senior'],
    salary: { poland: [5500, 9000], us: [8000, 12500] },
    descriptions: [
      'Product designer for a fintech mobile and web experience. Lead discovery, wireframes, and high-fidelity UI within an established design system.',
      'UX/UI designer embedded in a cross-functional squad shipping B2B workflow tools with regular user research cycles.',
    ],
    responsibilities: [
      'Run discovery sessions, user interviews, and usability tests',
      'Create wireframes, prototypes, and final UI in Figma',
      'Contribute to and extend the company design system',
      'Present design rationale to product and engineering',
      'Ensure accessibility and responsive behavior across breakpoints',
    ],
    requirements: [
      '3+ years in product design for digital products',
      'Strong Figma skills including components and variants',
      'Portfolio demonstrating end-to-end case studies',
      'Experience collaborating with agile engineering teams',
      'Understanding of design handoff and developer constraints',
    ],
    niceToHave: [
      'Basic HTML/CSS prototyping ability',
      'Experience with design tokens and Storybook',
      'B2B or enterprise UX background',
      'Facilitation of design sprints',
    ],
    benefits: [
      ['Figma Organization license', 'UX conference budget', 'Creative tools stipend'],
      ['Flexible hybrid schedule', 'Art and books allowance', 'Mental health days'],
      ['Premium healthcare', 'Design team critiques and mentorship', 'Paid parental leave'],
    ],
  },
  {
    title: 'Data Engineer',
    stack: ['Python', 'Spark', 'dbt'],
    seniority: ['regular', 'senior'],
    salary: { poland: [7000, 12000], us: [9500, 15000] },
    descriptions: [
      'Build batch and streaming data pipelines feeding analytics and ML features. Stack: Python, Apache Spark, dbt, and cloud warehouse (Snowflake/BigQuery).',
      'Data engineer modernizing ETL into an ELT architecture with dbt models and reliable orchestration (Airflow/Dagster).',
    ],
    responsibilities: [
      'Develop Spark jobs and orchestrate daily pipeline runs',
      'Model data in dbt with tests, documentation, and lineage',
      'Partner with analysts on semantic layer and metric definitions',
      'Monitor data quality SLAs and incident response for pipelines',
      'Optimize warehouse costs and query performance',
    ],
    requirements: [
      '3+ years in data engineering',
      'Proficient Python and SQL for large datasets',
      'Hands-on Spark (or similar distributed processing)',
      'dbt or comparable transformation framework experience',
      'Understanding of data modeling (star/snowflake schemas)',
    ],
    niceToHave: [
      'Kafka or Kinesis streaming pipelines',
      'Data catalog tools (DataHub, Amundsen)',
      'Experience with GDPR data governance',
      'dbt Cloud or Airflow advanced patterns',
    ],
    benefits: [
      ['Data conference attendance', 'Cloud warehouse sandbox', 'Flexible hours'],
      ['Learning platform access', 'Remote options', 'Health insurance'],
      ['Team data hackathons', 'Equipment upgrade', 'Bonus for on-call data incidents'],
    ],
  },
  {
    title: 'Security Engineer',
    stack: ['AppSec', 'Cloud security', 'IAM'],
    seniority: ['senior'],
    salary: { poland: [9500, 14000], us: [12500, 17500] },
    descriptions: [
      'Application security engineer conducting threat modeling, secure code reviews, and tooling integration (SAST/DAST) for product teams.',
      'Security engineer hardening cloud IAM, secrets, and network policies across AWS accounts with a DevSecOps mindset.',
    ],
    responsibilities: [
      'Perform threat modeling and security reviews for new features',
      'Run vulnerability assessments and coordinate remediation',
      'Maintain IAM policies, SSO, and least-privilege access',
      'Develop security training and secure coding guidelines',
      'Support incident response for security events',
    ],
    requirements: [
      '4+ years in application or cloud security',
      'OWASP Top 10 and secure SDLC knowledge',
      'AWS security services (GuardDuty, Security Hub, IAM)',
      'Experience with penetration testing findings remediation',
      'Relevant certification (OSCP, AWS Security Specialty) or equivalent',
    ],
    niceToHave: [
      'Bug bounty program management',
      'Container and Kubernetes security (Falco, OPA)',
      'SOC 2 or ISO 27001 audit participation',
      'Scripting for security automation (Python/Go)',
    ],
    benefits: [
      ['Security training budget', 'Certification reimbursement', 'Premium healthcare'],
      ['Conference travel', 'Flexible remote', 'On-call security bonus'],
      ['Extra PTO', 'Pension contribution', 'Home office security setup'],
    ],
  },
  {
    title: 'Mobile Developer',
    stack: ['React Native', 'TypeScript', 'iOS'],
    seniority: ['regular', 'senior'],
    salary: { poland: [6500, 10500], us: [9000, 13500] },
    descriptions: [
      'React Native developer shipping features for iOS and Android apps with 500k+ monthly active users in the health & wellness space.',
      'Mobile engineer improving app performance, offline mode, and native module integrations in a TypeScript React Native codebase.',
    ],
    responsibilities: [
      'Implement screens and navigation in React Native',
      'Integrate REST/GraphQL APIs with robust offline handling',
      'Write unit and Detox/Maestro E2E tests for releases',
      'Collaborate with designers on mobile-specific UX patterns',
      'Release to App Store and Google Play with CI automation',
    ],
    requirements: [
      '3+ years of mobile development (React Native required)',
      'TypeScript proficiency and component architecture skills',
      'Published apps on iOS and/or Android stores',
      'Understanding of mobile performance profiling',
      'Experience with push notifications and deep linking',
    ],
    niceToHave: [
      'Native Swift or Kotlin for custom modules',
      'App Store optimization and analytics (Firebase)',
      'Bluetooth or HealthKit integrations',
      'Fastlane or mobile CI/CD pipelines',
    ],
    benefits: [
      ['Latest iPhone/Android test devices', 'App store fee coverage', 'Flexible hours'],
      ['Remote-friendly', 'Gym/wellness benefit', 'Learning budget'],
      ['Medical care', 'Team mobile guild', 'Hackathon prizes'],
    ],
  },
  {
    title: 'Engineering Manager',
    stack: ['Team leadership', 'Agile', 'Hiring'],
    seniority: ['senior', 'expert'],
    salary: { poland: [10000, 15000], us: [13500, 19500] },
    descriptions: [
      'Engineering manager for a squad of 6–8 engineers building core platform services. Balance delivery, people development, and technical strategy.',
      'People leader guiding two product teams through a scale-up phase with focus on hiring, performance, and predictable delivery.',
    ],
    responsibilities: [
      'Lead hiring, onboarding, and career development for your team',
      'Partner with product on roadmap planning and estimation',
      'Remove blockers and improve engineering processes',
      'Conduct 1:1s, performance reviews, and feedback cycles',
      'Represent engineering in cross-functional leadership forums',
    ],
    requirements: [
      '3+ years managing software engineers (8+ years total in tech)',
      'Strong technical background to earn team credibility',
      'Experience with agile ceremonies and delivery metrics',
      'Proven hiring track record in competitive markets',
      'Excellent English communication and stakeholder management',
    ],
    niceToHave: [
      'Prior hands-on experience in the team\'s tech stack',
      'Coaching or leadership training certification',
      'Experience managing remote or distributed teams',
      'Budget and vendor management exposure',
    ],
    benefits: [
      ['Leadership coaching program', 'Higher equity band', 'Executive health plan'],
      ['Flexible location', 'Annual leadership offsite', 'Generous parental leave'],
      ['Performance bonus', 'Pension/401k match', 'Professional network budget'],
    ],
  },
  {
    title: 'Regional Sales Manager',
    stack: ['Sales', 'CRM', 'Negotiation'],
    seniority: ['senior'],
    salary: { poland: [5000, 8000], us: [7000, 11000] },
    descriptions: [
      'Own regional revenue targets for enterprise SaaS sales across the United States. Lead a team of account executives and key account growth.',
      'Regional sales manager driving new logo acquisition and expansion in retail and FMCG verticals with a consultative sales approach.',
    ],
    responsibilities: [
      'Hit quarterly ARR and pipeline targets for the region',
      'Coach account executives on discovery, demos, and closing',
      'Build relationships with C-level buyers and procurement',
      'Forecast accurately in Salesforce/HubSpot CRM',
      'Collaborate with marketing on regional campaigns and events',
    ],
    requirements: [
      '5+ years in B2B technology sales with management experience',
      'Track record of exceeding quota in enterprise deals',
      'Fluent English; experience selling into North American mid-market and enterprise accounts',
      'Experience selling SaaS with 6–12 month sales cycles',
      'Valid driving license for client visits',
    ],
    niceToHave: [
      'Existing network in retail or logistics sectors',
      'Experience with MEDDPICC or similar methodology',
      'Partner/channel sales background',
      'MBA or business education',
    ],
    benefits: [
      ['Uncapped commission structure', 'Company car or car allowance', 'Medical package'],
      ['Sales club incentives', 'Phone and laptop', 'Fuel card'],
      ['President\'s club trip', 'Training on negotiation', 'Flexible client visit schedule'],
    ],
  },
  {
    title: 'Marketing Specialist',
    stack: ['Content marketing', 'Google Analytics', 'Social media'],
    seniority: ['junior', 'regular'],
    salary: { poland: [3200, 5500], us: [4500, 7500] },
    descriptions: [
      'Digital marketing specialist planning content, social campaigns, and performance reporting for a B2B software brand entering new markets.',
      'Join the growth team to execute SEO content, paid social experiments, and marketing automation workflows.',
    ],
    responsibilities: [
      'Create and schedule content for blog, LinkedIn, and newsletters',
      'Set up UTM tracking and monthly performance dashboards',
      'Support paid campaigns on Google Ads and Meta with A/B tests',
      'Coordinate with design on landing pages and creatives',
      'Maintain editorial calendar and campaign documentation',
    ],
    requirements: [
      '1–3 years in digital marketing or communications',
      'Hands-on Google Analytics 4 and Search Console experience',
      'Strong copywriting in Polish and English',
      'Basic understanding of SEO and content funnels',
      'Organized, detail-oriented, comfortable with deadlines',
    ],
    niceToHave: [
      'HubSpot or Marketo marketing automation',
      'Canva or Figma for simple asset edits',
      'B2B SaaS marketing background',
      'Video or podcast production skills',
    ],
    benefits: [
      ['Remote-first with async culture', 'Training courses budget', 'Creative software licenses'],
      ['Flexible hours for students', 'Mentorship from head of marketing', 'Team workshops'],
      ['Medical care', 'Paid internships path to full-time', 'Marketing conference tickets'],
    ],
  },
  {
    title: 'QA Engineer',
    stack: ['Playwright', 'TypeScript', 'Test automation'],
    seniority: ['regular', 'senior'],
    salary: { poland: [5000, 8500], us: [7000, 11500] },
    descriptions: [
      'QA engineer building and maintaining Playwright E2E suites for a complex web application with weekly release trains.',
      'Quality specialist embedding with product squads to define test strategy, automate regression, and improve release confidence.',
    ],
    responsibilities: [
      'Author Playwright tests in TypeScript for critical user journeys',
      'Maintain test data fixtures and CI integration for nightly runs',
      'Perform exploratory testing on new features before release',
      'Log defects with clear reproduction steps and severity',
      'Advocate for quality gates in the development lifecycle',
    ],
    requirements: [
      '2+ years in test automation (web applications)',
      'Playwright or Cypress experience with TypeScript',
      'Understanding of API testing (Postman/REST)',
      'Familiarity with agile and definition of done',
      'Analytical mindset and attention to detail',
    ],
    niceToHave: [
      'Visual regression testing (Percy, Chromatic)',
      'Performance testing basics (k6, Lighthouse CI)',
      'Accessibility testing tools (axe)',
      'ISTQB or similar certification',
    ],
    benefits: [
      ['QA guild and testing conferences', 'Flexible hybrid', 'Healthcare'],
      ['Tools budget', 'Clear career path to SDET', 'No weekend releases policy'],
      ['Learning platform', 'Team quality awards', 'Remote stipend'],
    ],
  },
  {
    title: 'Site Reliability Engineer',
    stack: ['SRE', 'Prometheus', 'Kubernetes'],
    seniority: ['senior', 'expert'],
    salary: { poland: [9500, 14000], us: [12500, 18000] },
    descriptions: [
      'SRE owning reliability for customer-facing APIs with 99.9% SLO. Focus on error budgets, incident management, and toil reduction.',
      'Site reliability engineer improving observability, capacity planning, and chaos engineering practices on Kubernetes.',
    ],
    responsibilities: [
      'Define and monitor SLOs/SLIs with error budget policies',
      'Lead incident response, post-mortems, and action item follow-up',
      'Automate operational runbooks and reduce manual toil',
      'Capacity plan for traffic growth and seasonal peaks',
      'Partner with development teams on reliability design reviews',
    ],
    requirements: [
      '4+ years in SRE, DevOps, or production operations',
      'Strong Prometheus/Grafana or equivalent observability stack',
      'Kubernetes troubleshooting in production',
      'Programming skills (Go, Python, or similar) for tooling',
      'On-call experience with mature incident processes',
    ],
    niceToHave: [
      'Chaos engineering tools (Gremlin, Litmus)',
      'Service level objective coaching across org',
      'Multi-cloud or hybrid infrastructure',
      'Google SRE book practices in real environments',
    ],
    benefits: [
      ['On-call compensation and time off after incidents', 'SRE conference budget', 'Premium health'],
      ['Remote within EU', 'Toil reduction bonus program', 'Learning stipend'],
      ['Pension contribution', 'Flexible hours', 'Equipment refresh'],
    ],
  },
  {
    title: 'Solutions Architect',
    stack: ['AWS', 'System design', 'Integration'],
    seniority: ['expert'],
    salary: { poland: [12000, 16500], us: [15500, 22000] },
    descriptions: [
      'Presales solutions architect designing secure, scalable integrations for enterprise clients on AWS. Split between customer workshops and internal enablement.',
      'Principal architect defining reference architectures for multi-tenant SaaS on AWS with emphasis on compliance and data residency.',
    ],
    responsibilities: [
      'Lead technical discovery and architecture workshops with prospects',
      'Produce solution designs, diagrams, and effort estimates',
      'Guide engineering teams during complex integration deliveries',
      'Stay current on AWS services and industry compliance requirements',
      'Mentor senior engineers on system design patterns',
    ],
    requirements: [
      '8+ years in software architecture or senior engineering',
      'Deep AWS expertise across compute, networking, and data services',
      'Strong integration patterns (REST, events, ETL, iPaaS)',
      'Excellent presentation skills for C-level and technical audiences',
      'Experience with RFP responses and security questionnaires',
    ],
    niceToHave: [
      'AWS Solutions Architect Professional certification',
      'Experience in regulated industries (finance, healthcare)',
      'TOGAF or equivalent architecture framework',
      'Partner ecosystem knowledge (SI alliances)',
    ],
    benefits: [
      ['Customer travel budget', 'AWS certification fully funded', 'Executive healthcare'],
      ['High bonus tied to closed deals', 'Flexible schedule', 'Equity or profit share'],
      ['Thought leadership support', 'Home office setup', 'Sabbatical eligibility'],
    ],
  },
];

const TEMPLATE_BY_TITLE = new Map(ROLE_TEMPLATES.map((template) => [template.title, template]));

export function findRoleTemplate(title) {
  return TEMPLATE_BY_TITLE.get(title) ?? ROLE_TEMPLATES[0];
}

export function pick(array, index) {
  return array[index % array.length];
}

export function hashSeed(...parts) {
  let hash = 2166136261;
  for (const part of parts) {
    const value = String(part ?? '');
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
  }
  return hash >>> 0;
}

export function pickRotatedSubset(array, count, seed) {
  if (array.length === 0 || count <= 0) {
    return [];
  }

  const targetCount = Math.min(count, array.length);
  const start = seed % array.length;
  const step = 1 + (Math.floor(seed / array.length) % Math.max(1, array.length - 1));
  const items = [];
  const used = new Set();

  for (let i = 0; items.length < targetCount && i < array.length * 2; i += 1) {
    const item = array[(start + i * step) % array.length];
    if (used.has(item)) {
      continue;
    }
    used.add(item);
    items.push(item);
  }

  return items;
}

function buildDescriptionPool(template) {
  const extra = ROLE_DESCRIPTION_ANGLES[template.title] ?? [];
  return [...template.descriptions, ...extra];
}

function buildDescription(template, company, workplace, location, index) {
  const pool = buildDescriptionPool(template);
  const body = pick(pool, hashSeed(template.title, index, 'description'));
  const intro = DESCRIPTION_INTROS[hashSeed(template.title, index, 'intro') % DESCRIPTION_INTROS.length];
  const titleLower = template.title.toLowerCase();
  const city = location?.city ?? 'regional';
  const workplaceLabel = WORKPLACE_LABELS[workplace] ?? workplace;

  return `${intro({ company, titleLower, city, workplaceLabel })} ${body}`;
}

export function roundSalary(value) {
  return Math.round(value / 100) * 100;
}

const SENIORITY_MULTIPLIER = {
  junior: 0.7,
  regular: 0.88,
  senior: 1,
  expert: 1.15,
};

const CONTRACT_MULTIPLIER = {
  b2b: 1,
  employment: 0.82,
  'service-contract': 0.9,
  internship: 0.45,
};

export function resolveSalaryBand(template, location, seniority, contractType, index) {
  const market = location?.country === 'United States' ? 'us' : 'poland';
  const [baseMin, baseMax] = template.salary[market];
  const seniorityLevel = seniority?.[0] ?? 'regular';
  const seniorityFactor = SENIORITY_MULTIPLIER[seniorityLevel] ?? 1;
  const contractFactor = CONTRACT_MULTIPLIER[contractType] ?? 1;
  const spread = (index % 5) * Math.round((baseMax - baseMin) / 10);

  const min = roundSalary((baseMin + spread) * seniorityFactor * contractFactor);
  const max = roundSalary((baseMax + spread) * seniorityFactor * contractFactor);

  return [Math.min(min, max - 500), Math.max(max, min + 500)];
}

export function buildRoleContent(template, company, workplace, location, index) {
  const description = buildDescription(template, company, workplace, location, index);
  const contentSeed = hashSeed(template.title, index, company.id ?? company.name, 'content');

  const responsibilityCount = 3 + (contentSeed % 3);
  const responsibilities = pickRotatedSubset(
    template.responsibilities,
    Math.min(responsibilityCount, template.responsibilities.length),
    hashSeed(contentSeed, 'responsibilities'),
  );

  const requirementCount = 3 + ((contentSeed >> 3) % 3);
  const requirements = pickRotatedSubset(
    template.requirements,
    Math.min(requirementCount, template.requirements.length),
    hashSeed(contentSeed, 'requirements'),
  );

  const niceToHaveCount = 2 + ((contentSeed >> 6) % 3);
  const niceToHave = pickRotatedSubset(
    template.niceToHave,
    Math.min(niceToHaveCount, template.niceToHave.length),
    hashSeed(contentSeed, 'niceToHave'),
  );

  const baseBenefits = pick(template.benefits, hashSeed(contentSeed, 'benefits'));
  const workplaceBenefit =
    workplace === 'remote'
      ? 'Remote work stipend (internet & co-working)'
      : workplace === 'hybrid'
        ? 'Hybrid schedule with modern office space'
        : 'Central office location with meal subsidies';
  const benefits = [...new Set([...baseBenefits, workplaceBenefit])];

  return { description, responsibilities, requirements, niceToHave, benefits };
}

export function buildCompetencies(stack, index) {
  return stack.map((name, skillIndex) => ({
    name,
    level: 3 + ((index + skillIndex) % 3),
    scale: 5,
  }));
}
