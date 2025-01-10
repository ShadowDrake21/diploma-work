import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectPublicationFormComponent } from './project-publication-form.component';

describe('ProjectPublicationFormComponent', () => {
  let component: ProjectPublicationFormComponent;
  let fixture: ComponentFixture<ProjectPublicationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectPublicationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectPublicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
