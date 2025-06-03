import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStepperComponent } from './project-stepper.component';

describe('ProjectStepperComponent', () => {
  let component: ProjectStepperComponent;
  let fixture: ComponentFixture<ProjectStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectStepperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
