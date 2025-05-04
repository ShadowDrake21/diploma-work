import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGeneralInfoStepComponent } from './project-general-info-step.component';

describe('ProjectGeneralInfoStepComponent', () => {
  let component: ProjectGeneralInfoStepComponent;
  let fixture: ComponentFixture<ProjectGeneralInfoStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectGeneralInfoStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectGeneralInfoStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
