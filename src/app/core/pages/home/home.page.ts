import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '@core/layout/app-shell.component';
import { AppLinks } from '@app/app-paths';

interface LandingFeature {
  icon: string;
  title: string;
  text: string;
}

interface LandingTool {
  name: string;
  scope: string;
  description: string;
}

interface LandingStep {
  title: string;
  text: string;
}

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePageComponent {
  readonly links = AppLinks;
  readonly challengeUrl = 'https://openai.com/pl-PL/webmcp-challenge/';
  readonly webmcpDocsUrl = 'https://angular.dev/ai/webmcp';

  readonly features: LandingFeature[] = [
    {
      icon: '⌕',
      title: 'Smart search',
      text: 'Filter by role, location, workplace, salary, and skills - list and map stay in sync.',
    },
    {
      icon: '◎',
      title: 'Map-first UX',
      text: 'Explore openings geographically with a split view on desktop.',
    },
    {
      icon: '⚡',
      title: 'Agent-native',
      text: 'Codex calls structured tools that read and write the same state as the UI - no DOM scraping.',
    },
  ];

  readonly tools: LandingTool[] = [
    {
      name: 'search_jobs',
      scope: 'global',
      description:
        'Replace text, location, and radius; preserve structured filters. Use filter_jobs to refine.',
    },
    {
      name: 'filter_jobs',
      scope: 'global',
      description:
        'Update structured filters and sort; preserve text and location. Array values match with OR.',
    },
    {
      name: 'get_profile',
      scope: 'global',
      description:
        'Read headline, experience, skills, and preferences for the signed-in user from any page.',
    },
    {
      name: 'update_profile',
      scope: '/profile',
      description: 'Update profile fields with validation and persist changes to the UI.',
    },
    {
      name: 'get_job',
      scope: '/jobs',
      description: 'Read full details for a single job offer.',
    },
    {
      name: 'save_job',
      scope: '/jobs',
      description: 'Add a job to favourites. Idempotent for already saved jobs.',
    },
    {
      name: 'apply_job',
      scope: '/jobs',
      description: 'Submit a real, potentially irreversible job application.',
    },
  ];

  readonly steps: LandingStep[] = [
    {
      title: 'Open in ChatGPT',
      text: 'Launch Job Pilot inside the ChatGPT desktop in-app browser with WebMCP enabled.',
    },
    {
      title: 'Complete your profile',
      text: 'Ask Codex: “Help me complete my profile based on this CV…”',
    },
    {
      title: 'Search in plain language',
      text: 'Try: “Find senior frontend jobs, remote or hybrid in Warsaw, minimum $8k USD.”',
    },
    {
      title: 'Watch the UI react',
      text: 'Filters, job list, and map update in real time as tools mutate shared state.',
    },
  ];

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const targets = this.host.nativeElement.querySelectorAll('[data-reveal]');
      if (!targets.length) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -8%', threshold: 0.12 },
      );

      const revealTargets = targets as NodeListOf<Element>;
      revealTargets.forEach((target) => observer.observe(target));
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
