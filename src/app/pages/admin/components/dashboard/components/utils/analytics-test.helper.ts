import { AnalyticsService } from '@core/services/analytics.service';
import { NotificationService } from '@core/services/notification.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MockBuilder } from 'ng-mocks';
import { of } from 'rxjs';

export function setupTestBed(component: any) {
  const mockAnalyticsService = {
    getUserGrowth: jest.fn(() => of([])),
    getSystemPerformance: jest.fn(() => of({})),
    getCommentActivity: jest.fn(() => of([])),
  };

  const mockNotificationService = {
    showError: jest.fn(),
    showSuccess: jest.fn(),
  };

  return MockBuilder(component)
    .provide({
      provide: AnalyticsService,
      useValue: mockAnalyticsService,
    })
    .provide({
      provide: NotificationService,
      useValue: mockNotificationService,
    })
    .keep(LoaderComponent);
}
