import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FIREBASE } from '@core/infrastructure/firebase/firebase.providers';
import { AuthService } from '@core/infrastructure/auth/auth.service';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: FIREBASE,
          useValue: { app: {}, auth: {}, firestore: {} },
        },
        {
          provide: AuthService,
          useValue: { userId: () => null },
        },
      ],
    });
  });

  it('does not throw when logging before analytics is initialized', async () => {
    const service = TestBed.inject(AnalyticsService);

    await expect(service.logEvent('test_event', { source: 'unit-test' })).resolves.toBeUndefined();
  });
});
