export const DEMO_ACCOUNTS = [
  { id: 'alex', name: 'Alex Demo', email: 'alex@job-pilot.local' },
  { id: 'sam', name: 'Sam Demo', email: 'sam@job-pilot.local' },
  { id: 'taylor', name: 'Taylor Demo', email: 'taylor@job-pilot.local' },
] as const;

export type DemoAccountId = (typeof DEMO_ACCOUNTS)[number]['id'];
