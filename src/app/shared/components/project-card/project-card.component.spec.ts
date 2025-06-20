import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectCardComponent } from './project-card.component';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';

describe('ProjectCardComponent', () => {
  let component: ProjectCardComponent;
  let fixture: ComponentFixture<ProjectCardComponent>;

  const mockProject: ProjectDTO = {
    id: '1',
    title: 'Test Project',
    progress: 50,
    type: ProjectType.PUBLICATION,
    description: 'This is a test project description.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tagIds: [],
    createdBy: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display project title', () => {
    fixture.componentRef.setInput('project', mockProject);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h3').textContent).toContain(
      mockProject.title
    );
  });

  it('should display correct progress', () => {
    fixture.componentRef.setInput('project', mockProject);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar.getAttribute('ng-reflect-value')).toBe(
      mockProject.progress.toString()
    );
  });

  it('should have correct router link', () => {
    fixture.componentRef.setInput('project', mockProject);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('routerLink')).toBe(`/projects/${mockProject.id}`);
  });

  it('should show type on hover', () => {
    fixture.componentRef.setInput('project', mockProject);
    fixture.detectChanges();

    const typeElement = fixture.nativeElement.querySelector('div:nth-child(3)');
    expect(typeElement.textContent).toContain(mockProject.type);
  });
});
