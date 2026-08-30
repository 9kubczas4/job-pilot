import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '@environments/environment';
import { DEFAULT_PAGE_SEO, PageSeoMetadata } from '@core/domains/seo/page-seo.model';

@Injectable({ providedIn: 'root' })
export class PageSeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(metadata: PageSeoMetadata): void {
    this.title.setTitle(metadata.title);
    this.meta.updateTag({ name: 'description', content: metadata.description });
    this.meta.updateTag({ property: 'og:title', content: metadata.ogTitle });
    this.meta.updateTag({ property: 'og:description', content: metadata.ogDescription });
    this.meta.updateTag({ property: 'og:url', content: metadata.url });
    this.meta.updateTag({ name: 'twitter:title', content: metadata.twitterTitle });
    this.meta.updateTag({ name: 'twitter:description', content: metadata.twitterDescription });
    this.setCanonical(metadata.url);
  }

  restoreDefaults(): void {
    const siteRoot = `${environment.siteUrl.replace(/\/$/, '')}/`;
    this.apply({ ...DEFAULT_PAGE_SEO, url: siteRoot });
  }

  private setCanonical(url: string): void {
    const head = this.document.head;
    const existing = head.querySelector('link[rel="canonical"]');

    if (existing instanceof HTMLLinkElement) {
      existing.href = url;
      return;
    }

    const link = this.document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    head.appendChild(link);
  }
}
