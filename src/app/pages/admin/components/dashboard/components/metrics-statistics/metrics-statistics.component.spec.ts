import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsStatisticsComponent } from './metrics-statistics.component';

describe('MetricsStatisticsComponent', () => {
  let component: MetricsStatisticsComponent;
  let fixture: ComponentFixture<MetricsStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricsStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
