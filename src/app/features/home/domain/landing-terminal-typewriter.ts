import {
  createInitialTerminalState,
  LandingTerminalLine,
  LandingTerminalTypewriterState,
} from './landing-terminal.model';

export interface LandingTerminalTypewriterOptions {
  charDelayMs?: number;
  linePauseMs?: number;
  initialDelayMs?: number;
  staticLineCount?: number;
  signal?: AbortSignal;
}

const DEFAULT_CHAR_DELAY_MS = 22;
const DEFAULT_LINE_PAUSE_MS = 280;
const DEFAULT_INITIAL_DELAY_MS = 700;

export async function runLandingTerminalTypewriter(
  script: readonly LandingTerminalLine[],
  onUpdate: (state: LandingTerminalTypewriterState) => void,
  options: LandingTerminalTypewriterOptions = {},
): Promise<void> {
  const charDelayMs = options.charDelayMs ?? DEFAULT_CHAR_DELAY_MS;
  const linePauseMs = options.linePauseMs ?? DEFAULT_LINE_PAUSE_MS;
  const initialDelayMs = options.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
  const staticLineCount = Math.min(options.staticLineCount ?? 0, script.length);
  const signal = options.signal;
  const animatedLines = script.slice(staticLineCount);

  onUpdate(createInitialTerminalState(script, staticLineCount));

  if (!animatedLines.length) {
    onUpdate({
      completedLines: [...script],
      activeLine: null,
      activeCharCount: 0,
      done: true,
    });
    return;
  }

  if (initialDelayMs > 0) {
    await delay(initialDelayMs, signal);
  }

  const completedLines = script.slice(0, staticLineCount);

  for (const line of animatedLines) {
    throwIfAborted(signal);

    for (let charIndex = 0; charIndex <= line.text.length; charIndex += 1) {
      onUpdate({
        completedLines,
        activeLine: line,
        activeCharCount: charIndex,
        done: false,
      });

      const pauseMs = charIndex === line.text.length ? linePauseMs : charDelayMs;
      if (pauseMs > 0) {
        await delay(pauseMs, signal);
      }
    }

    completedLines.push(line);
    onUpdate({
      completedLines: [...completedLines],
      activeLine: null,
      activeCharCount: 0,
      done: false,
    });
  }

  onUpdate({
    completedLines: [...completedLines],
    activeLine: null,
    activeCharCount: 0,
    done: true,
  });
}

export function createInstantTerminalState(
  script: readonly LandingTerminalLine[],
): LandingTerminalTypewriterState {
  return {
    completedLines: [...script],
    activeLine: null,
    activeCharCount: 0,
    done: true,
  };
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(createAbortError());
  }

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timeoutId);
      reject(createAbortError());
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw createAbortError();
  }
}

function createAbortError(): DOMException {
  return new DOMException('Typewriter aborted', 'AbortError');
}
