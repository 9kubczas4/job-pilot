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
import { HeaderSearchSlotComponent } from '@core/layout/header-search-slot.component';
import { AppLinks } from '@core/app-paths';
import { setupLandingScrollReveal } from '@features/home/domain/landing-scroll-reveal';

interface LandingFeature {
  icon: string;
  title: string;
  text: string;
}

type LandingToolScope = 'global' | 'route';

interface LandingTool {
  name: string;
  scope: LandingToolScope;
  route?: string;
  description: string;
}

interface LandingStep {
  title: string;
  text: string;
}

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppShellComponent, HeaderSearchSlotComponent, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePageComponent {
  readonly links = AppLinks;
  readonly challengeUrl = 'https://webmcp.devpost.com/';
  readonly webmcpDocsUrl = 'https://angular.dev/ai/webmcp';

  readonly features: LandingFeature[] = [
    {
      icon: '⌕',
      title: 'Smart search',
      text: 'Filter by role, location, workplace, salary, and skills - list and map stay in sync.',
    },
    {
      icon: '◎',
      title: 'Map-aware results',
      text: 'The map zooms to your filtered results - one country or the whole world when offers span continents.',
    },
    {
      icon: '⚡',
      title: 'Agent-native',
      text: 'Seven global WebMCP tools share state with the UI. No brittle DOM automation.',
    },
  ];

  readonly globalTools: LandingTool[] = [
    {
      name: 'search_jobs',
      scope: 'global',
      description:
        'Replace text, location, and radius; preserve structured filters. Navigates to /jobs when needed.',
    },
    {
      name: 'filter_jobs',
      scope: 'global',
      description:
        'Patch structured filters and sort; preserve text and location. Array values match with OR.',
    },
    {
      name: 'get_profile',
      scope: 'global',
      description:
        'Read headline, experience, skills, and preferences for the signed-in user from any page.',
    },
    {
      name: 'get_job',
      scope: 'global',
      description: 'Read full details for a single job offer by id - no need to open the detail route first.',
    },
    {
      name: 'save_job',
      scope: 'global',
      description: 'Add a job to favourites. Idempotent when the job is already saved.',
    },
    {
      name: 'unsave_job',
      scope: 'global',
      description: 'Remove a job from favourites. Idempotent when the job is not saved.',
    },
    {
      name: 'apply_job',
      scope: 'global',
      description: 'Submit a real job application. Requires auth and a minimal profile.',
    },
  ];

  readonly routeTools: LandingTool[] = [
    {
      name: 'update_profile',
      scope: 'route',
      route: '/profile',
      description:
        'Update profile fields with validation (Signal Form implicit tool). Only available on the profile route.',
    },
  ];

  readonly globalToolCount = this.globalTools.length;
  readonly routeToolCount = this.routeTools.length;
  readonly sparks = Array.from({ length: 18 }, (_, index) => index);

  readonly steps: LandingStep[] = [
    {
      title: 'Open in ChatGPT',
      text: 'Launch Job Pilot in the ChatGPT desktop browser with WebMCP enabled (Chrome 149+).',
    },
    {
      title: 'Go to /profile',
      text: 'Route-scoped update_profile is only registered on the profile page - navigate there before editing fields.',
    },
    {
      title: 'Search in plain language',
      text: 'From any page: “Find senior frontend jobs, remote or hybrid in Warsaw, minimum $8k USD.”',
    },
    {
      title: 'Watch the UI react',
      text: 'Global tools update filters, list, map, saved jobs, and applications in real time.',
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

      setupLandingScrollReveal(this.host.nativeElement, (callback) =>
        this.destroyRef.onDestroy(callback),
      );
    });
  }
}
