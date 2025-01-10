import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectResearchFormComponent } from './project-research-form.component';

describe('ProjectResearchFormComponent', () => {
  let component: ProjectResearchFormComponent;
  let fixture: ComponentFixture<ProjectResearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectResearchFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectResearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
