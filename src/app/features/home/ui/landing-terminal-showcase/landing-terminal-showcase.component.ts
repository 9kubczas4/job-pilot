import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import {
  createInitialTerminalState,
  LANDING_TERMINAL_SCRIPT,
  LANDING_TERMINAL_STATIC_LINE_COUNT,
  LandingTerminalTypewriterState,
} from '@features/home/domain/landing-terminal.model';
import {
  createInstantTerminalState,
  runLandingTerminalTypewriter,
} from '@features/home/domain/landing-terminal-typewriter';

@Component({
  selector: 'app-landing-terminal-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-terminal-showcase.component.html',
  styleUrl: './landing-terminal-showcase.component.scss',
})
export class LandingTerminalShowcaseComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly script = LANDING_TERMINAL_SCRIPT;
  readonly staticLineCount = LANDING_TERMINAL_STATIC_LINE_COUNT;
  readonly state = signal<LandingTerminalTypewriterState>(
    createInitialTerminalState(this.script, this.staticLineCount),
  );

  private readonly terminalBody = viewChild<ElementRef<HTMLElement>>('terminalBody');

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        this.updateState(createInstantTerminalState(this.script));
        return;
      }

      const abortController = new AbortController();
      this.destroyRef.onDestroy(() => abortController.abort());

      if (prefersReducedMotion()) {
        this.updateState(createInstantTerminalState(this.script));
        return;
      }

      void runLandingTerminalTypewriter(
        this.script,
        (nextState) => this.updateState(nextState),
        {
          staticLineCount: this.staticLineCount,
          signal: abortController.signal,
        },
      ).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        throw error;
      });
    });
  }

  private updateState(nextState: LandingTerminalTypewriterState): void {
    this.state.set(nextState);
    queueMicrotask(() => this.syncTerminalScroll());
  }

  activeText(state: LandingTerminalTypewriterState): string {
    const line = state.activeLine;
    if (!line) {
      return '';
    }

    return line.text.slice(0, state.activeCharCount);
  }

  isStaticLine(index: number): boolean {
    return index < this.staticLineCount;
  }

  private syncTerminalScroll(): void {
    const body = this.terminalBody()?.nativeElement;
    if (!body) {
      return;
    }

    body.scrollTop = body.scrollHeight;
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
