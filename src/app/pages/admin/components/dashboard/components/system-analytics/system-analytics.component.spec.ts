import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAnalyticsComponent } from './system-analytics.component';

describe('SystemAnalyticsComponent', () => {
  let component: SystemAnalyticsComponent;
  let fixture: ComponentFixture<SystemAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
