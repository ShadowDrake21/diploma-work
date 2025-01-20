import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalylicsTrendsComponent } from './analylics-trends.component';

describe('AnalylicsTrendsComponent', () => {
  let component: AnalylicsTrendsComponent;
  let fixture: ComponentFixture<AnalylicsTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalylicsTrendsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalylicsTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
