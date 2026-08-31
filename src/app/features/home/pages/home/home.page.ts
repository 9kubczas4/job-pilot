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
import { LandingTerminalShowcaseComponent } from '@features/home/ui/landing-terminal-showcase/landing-terminal-showcase.component';

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
  imports: [AppShellComponent, HeaderSearchSlotComponent, LandingTerminalShowcaseComponent, RouterLink],
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
      text: 'The map zooms to your filtered results - highlight_job focuses a marker with a live popover.',
    },
    {
      icon: '✦',
      title: 'Agent feedback',
      text: 'compare_offers opens a recommendation drawer with badges, notes, and an optional highlighted pick.',
    },
    {
      icon: '⚡',
      title: 'Agent-native',
      text: 'Eight global WebMCP tools share state with the UI. Two route-scoped tools for map focus and profile edits.',
    },
  ];

  readonly globalTools: LandingTool[] = [
    {
      name: 'search_jobs',
      scope: 'global',
      description:
        'Replace complete search criteria and update filters, results, URL, and map in one operation.',
    },
    {
      name: 'get_job',
      scope: 'global',
      description: 'Read full details for a single job offer by id - no need to open the detail route first.',
    },
    {
      name: 'compare_offers',
      scope: 'global',
      description:
        'Open a comparison drawer with agent summary, per-offer badges and notes, and an optional highlighted primary pick.',
    },
    {
      name: 'get_saved_jobs',
      scope: 'global',
      description: 'Read the signed-in user saved shortlist with lightweight job details from any page.',
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
      description: 'Open the apply dialog with a pre-filled message; user submits manually. Requires auth.',
    },
    {
      name: 'get_profile',
      scope: 'global',
      description:
        'Read headline, experience, skills, and preferences for the signed-in user from any page.',
    },
  ];

  readonly routeTools: LandingTool[] = [
    {
      name: 'highlight_job',
      scope: 'route',
      route: '/jobs',
      description:
        'Focus one job from the current search results on the map - marker, popover, and AI highlight animation.',
    },
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
      title: 'Search in plain language',
      text: 'From any page: “Find senior frontend jobs, remote or hybrid in Warsaw, minimum $8k USD.”',
    },
    {
      title: 'Compare and recommend',
      text: 'Ask Codex to compare offers — compare_offers opens a drawer with badges, notes, and a highlighted pick.',
    },
    {
      title: 'Watch the UI react',
      text: 'Tools update filters, list, map, saved jobs, applications, and agent feedback surfaces in real time.',
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
