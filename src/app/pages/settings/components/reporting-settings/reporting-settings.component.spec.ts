import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingSettingsComponent } from './reporting-settings.component';

describe('ReportingSettingsComponent', () => {
  let component: ReportingSettingsComponent;
  let fixture: ComponentFixture<ReportingSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
