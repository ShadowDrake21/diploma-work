import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricCardItemComponent } from './metric-card-item.component';

describe('MetricCardItemComponent', () => {
  let component: MetricCardItemComponent;
  let fixture: ComponentFixture<MetricCardItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricCardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
