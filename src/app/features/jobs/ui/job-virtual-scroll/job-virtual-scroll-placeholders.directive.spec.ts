import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { JobVirtualScrollPlaceholdersDirective } from './job-virtual-scroll-placeholders.directive';
import { JobVirtualScrollStrategyDirective } from './job-virtual-scroll-strategy.directive';

@Component({
  imports: [ScrollingModule, JobVirtualScrollPlaceholdersDirective, JobVirtualScrollStrategyDirective],
  template: `
    <cdk-virtual-scroll-viewport
      appJobVirtualScrollStrategy
      appJobVirtualScrollPlaceholders
      #placeholders="appJobVirtualScrollPlaceholders"
      [jobVirtualScrollItemSize]="50"
      [jobVirtualScrollInsetTop]="8"
      (activeChange)="placeholdersActive = $event"
      style="height: 200px"
    >
      <div *cdkVirtualFor="let item of items" style="height: 50px">{{ item }}</div>
    </cdk-virtual-scroll-viewport>
  `,
})
class HostComponent {
  readonly items = Array.from({ length: 100 }, (_, index) => index);
  placeholdersActive = false;

  @ViewChild('placeholders')
  placeholders!: JobVirtualScrollPlaceholdersDirective;
}

describe('JobVirtualScrollPlaceholdersDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    });
  });

  it('starts inactive and activates on any scroll movement', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const viewport = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;

    expect(fixture.componentInstance.placeholders.active()).toBe(false);
    expect(fixture.componentInstance.placeholdersActive).toBe(false);

    viewport.scrollTop = 12;
    viewport.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(fixture.componentInstance.placeholders.active()).toBe(true);
    expect(fixture.componentInstance.placeholdersActive).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();

    expect(fixture.componentInstance.placeholders.active()).toBe(false);
    expect(fixture.componentInstance.placeholdersActive).toBe(false);
  });
});
