import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringAnalyticsComponent } from './monitoring-analytics.component';

describe('MonitoringAnalyticsComponent', () => {
  let component: MonitoringAnalyticsComponent;
  let fixture: ComponentFixture<MonitoringAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoringAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoringAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
