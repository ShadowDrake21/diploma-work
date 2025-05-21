import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResearchAnalyticsComponent } from './research-analytics.component';

describe('ResearchAnalyticsComponent', () => {
  let component: ResearchAnalyticsComponent;
  let fixture: ComponentFixture<ResearchAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResearchAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResearchAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
