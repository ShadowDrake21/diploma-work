import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricCardItemComponent } from './metric-card-item.component';
import { DashboardMetricCardItem } from '@shared/types/dashboard.types';

describe('MetricCardItemComponent', () => {
  let component: MetricCardItemComponent;
  let fixture: ComponentFixture<MetricCardItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCardItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCardItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct data', () => {
    const testData: DashboardMetricCardItem = {
      icon: 'home',
      title: 'Test Title',
      value: '123',
      link: '/test',
    };

    fixture.componentRef.setInput('data', testData);

    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.querySelector('mat-icon').textContent.trim()).toBe(
      testData.icon
    );
    expect(element.querySelector('div:nth-child(2)').textContent.trim()).toBe(
      testData.title
    );
    expect(element.querySelector('div:nth-child(3)').textContent.trim()).toBe(
      testData.value
    );
    expect(element.querySelector('a').getAttribute('routerLink')).toBe(
      testData.link
    );
  });

  it('should handle missing link', () => {
    const testData: DashboardMetricCardItem = {
      icon: 'home',
      title: 'Test Title',
      value: '123',
    };

    fixture.componentRef.setInput('data', testData);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.querySelector('a').getAttribute('routerLink')).toBe('');
  });
});
