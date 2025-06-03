import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTypeStepComponent } from './project-type-step.component';

describe('ProjectTypeStepComponent', () => {
  let component: ProjectTypeStepComponent;
  let fixture: ComponentFixture<ProjectTypeStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTypeStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTypeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
