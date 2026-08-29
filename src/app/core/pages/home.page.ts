import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../layout/app-shell.component';
import { AppLinks } from '../../shared/routing/app-paths';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, RouterLink],
  template: `
    <app-shell>
      <section class="hero">
        <p class="eyebrow">WebMCP Challenge</p>
        <h1>A modern job board for humans and agents</h1>
        <p class="lead">
          Browse jobs with a clean UI, then let Codex complete your profile, search offers, and apply —
          all through WebMCP tools that share the same domain model as the interface.
        </p>

        <div class="actions">
          <a [routerLink]="links.jobs" class="btn btn-primary">Browse jobs</a>
          <a [routerLink]="links.profile" class="btn btn-ghost">Open profile</a>
        </div>

        <article class="panel">
          <h2>How to test with Codex</h2>
          <ol>
            <li>Open this app in the ChatGPT desktop in-app browser.</li>
            <li>In Codex, ask: “Help me complete my profile based on this CV…”</li>
            <li>Then ask: “Find lead frontend jobs, remote or hybrid in Warsaw, minimum 25k PLN.”</li>
            <li>Watch filters, list, and map update in real time.</li>
          </ol>
        </article>
      </section>
    </app-shell>
  `,
  styles: `
    .hero {
      max-width: 840px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    .eyebrow {
      color: var(--primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
    }

    h1 {
      font-size: clamp(2rem, 4vw, 3rem);
      margin: 0.5rem 0 1rem;
    }

    .lead {
      color: var(--text-muted);
      font-size: 1.125rem;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      margin: 1.5rem 0 2rem;
    }

    .panel {
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      background: var(--surface-elevated);
    }

    ol {
      margin: 0;
      padding-left: 1.25rem;
      color: var(--text-muted);
      line-height: 1.7;
    }
  `,
})
export class HomePageComponent {
  readonly links = AppLinks;
}
