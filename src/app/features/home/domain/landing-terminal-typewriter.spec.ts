import { describe, expect, it, vi } from 'vitest';
import { LANDING_TERMINAL_SCRIPT, LandingTerminalTypewriterState } from './landing-terminal.model';
import {
  createInstantTerminalState,
  runLandingTerminalTypewriter,
} from './landing-terminal-typewriter';

describe('landing-terminal-typewriter', () => {
  it('keeps a static prefix and only types the remainder', async () => {
    vi.useFakeTimers();

    const updates: LandingTerminalTypewriterState[] = [];
    const script = [
      { kind: 'muted' as const, prefix: '#' as const, text: 'static' },
      { kind: 'prompt' as const, prefix: '›' as const, text: 'ab' },
      { kind: 'success' as const, text: 'ok' },
    ];

    const runPromise = runLandingTerminalTypewriter(
      script,
      (state) => updates.push(structuredClone(state)),
      { initialDelayMs: 0, charDelayMs: 10, linePauseMs: 20, staticLineCount: 1 },
    );

    await vi.runAllTimersAsync();
    await runPromise;

    expect(updates[0]?.completedLines).toEqual([script[0]]);
    expect(updates.at(-1)).toEqual({
      completedLines: [...script],
      activeLine: null,
      activeCharCount: 0,
      done: true,
    });
  });

  it('types the script letter by letter before marking done', async () => {
    vi.useFakeTimers();

    const updates: string[] = [];
    const script = [
      { kind: 'prompt' as const, prefix: '›' as const, text: 'ab' },
      { kind: 'success' as const, text: 'ok' },
    ];

    const runPromise = runLandingTerminalTypewriter(
      script,
      (state) => {
        if (state.activeLine) {
          updates.push(state.activeLine.text.slice(0, state.activeCharCount));
        } else if (state.done) {
          updates.push('done');
        }
      },
      { initialDelayMs: 0, charDelayMs: 10, linePauseMs: 20 },
    );

    await vi.runAllTimersAsync();
    await runPromise;

    expect(updates).toEqual(['', 'a', 'ab', '', 'o', 'ok', 'done']);
    expect(LANDING_TERMINAL_SCRIPT.length).toBe(11);
  });

  it('renders the full script instantly for reduced-motion fallback helpers', () => {
    const state = createInstantTerminalState(LANDING_TERMINAL_SCRIPT);
    expect(state.done).toBe(true);
    expect(state.completedLines).toHaveLength(11);
    expect(state.activeLine).toBeNull();
  });
});
