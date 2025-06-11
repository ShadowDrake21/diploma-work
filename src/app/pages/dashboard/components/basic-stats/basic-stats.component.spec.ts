import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicStatsComponent } from './basic-stats.component';

describe('BasicStatsComponent', () => {
  let component: BasicStatsComponent;
  let fixture: ComponentFixture<BasicStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
