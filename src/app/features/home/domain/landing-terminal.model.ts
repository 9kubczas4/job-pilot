export type LandingTerminalLineKind = 'muted' | 'prompt' | 'success';

export interface LandingTerminalLine {
  kind: LandingTerminalLineKind;
  prefix?: '#' | '›';
  text: string;
}

export interface LandingTerminalTypewriterState {
  completedLines: LandingTerminalLine[];
  activeLine: LandingTerminalLine | null;
  activeCharCount: number;
  done: boolean;
}

export const LANDING_TERMINAL_SCRIPT: readonly LandingTerminalLine[] = [
  {
    kind: 'muted',
    prefix: '#',
    text: 'global tools - callable from any route',
  },
  {
    kind: 'prompt',
    prefix: '›',
    text:
      'search_jobs({ query: "frontend", location: "Warsaw", radiusKm: 50, workplace: ["remote", "hybrid"], salaryMin: 8000 })',
  },
  {
    kind: 'success',
    text: '✓ 8 jobs matched · filters applied · navigated once · map synced',
  },
  {
    kind: 'prompt',
    prefix: '›',
    text:
      'compare_offers({ summary: "Frontend fits best…", offers: [{ jobId: "job-001", badge: "najlepsza", highlighted: true }, …] })',
  },
  {
    kind: 'success',
    text: '✓ comparison drawer opened · 3 offers · 1 highlighted',
  },
  {
    kind: 'muted',
    prefix: '#',
    text: '/jobs - highlight_job focuses a current result on the map',
  },
  {
    kind: 'prompt',
    prefix: '›',
    text: 'highlight_job({ jobId: "job-001" })',
  },
  {
    kind: 'success',
    text: '✓ marker selected · popover open · AI highlight on map',
  },
  {
    kind: 'muted',
    prefix: '#',
    text: '/profile - update_profile available here only',
  },
];

export const LANDING_TERMINAL_STATIC_LINE_COUNT = 5;

export const LANDING_TERMINAL_STATIC_LINES: readonly LandingTerminalLine[] =
  LANDING_TERMINAL_SCRIPT.slice(0, LANDING_TERMINAL_STATIC_LINE_COUNT);

export const LANDING_TERMINAL_ANIMATED_LINES: readonly LandingTerminalLine[] =
  LANDING_TERMINAL_SCRIPT.slice(LANDING_TERMINAL_STATIC_LINE_COUNT);

export function createInitialTerminalState(
  script: readonly LandingTerminalLine[] = LANDING_TERMINAL_SCRIPT,
  staticLineCount: number = LANDING_TERMINAL_STATIC_LINE_COUNT,
): LandingTerminalTypewriterState {
  const animatedLines = script.slice(staticLineCount);

  return {
    completedLines: script.slice(0, staticLineCount),
    activeLine: null,
    activeCharCount: 0,
    done: animatedLines.length === 0,
  };
}

export const INITIAL_TERMINAL_TYPEWRITER_STATE: LandingTerminalTypewriterState =
  createInitialTerminalState();
