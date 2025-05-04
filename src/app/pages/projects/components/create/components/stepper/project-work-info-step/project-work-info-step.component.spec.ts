import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectWorkInfoStepComponent } from './project-work-info-step.component';

describe('ProjectWorkInfoStepComponent', () => {
  let component: ProjectWorkInfoStepComponent;
  let fixture: ComponentFixture<ProjectWorkInfoStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectWorkInfoStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectWorkInfoStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
