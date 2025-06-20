import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileProjectsComponent } from './profile-projects.component';
import { PageEvent } from '@angular/material/paginator';
import { By } from '@angular/platform-browser';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';

describe('ProfileProjectsComponent', () => {
  let component: ProfileProjectsComponent;
  let fixture: ComponentFixture<ProfileProjectsComponent>;

  const mockProjects: ProjectDTO[] = [
    {
      id: '1',
      title: 'Project 1',
      progress: 50,
      type: ProjectType.PUBLICATION,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: [],
      createdBy: 1,
    },
    {
      id: '2',
      title: 'Project 2',
      progress: 100,
      type: ProjectType.PATENT,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: [],
      createdBy: 1,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileProjectsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display projects when available', () => {
    fixture.componentRef.setInput('projects', mockProjects);
    fixture.componentRef.setInput('totalItems', 2);
    fixture.detectChanges();

    const projectCards = fixture.nativeElement.querySelectorAll(
      'shared-project-card'
    );
    expect(projectCards.length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain('Не знайдено');
  });

  it('should display "Not found" when no projects', () => {
    fixture.componentRef.setInput('projects', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Не знайдено');
  });

  it('should emit page change event', () => {
    spyOn(component.pageChange, 'emit');
    const pageEvent: PageEvent = { pageIndex: 1, pageSize: 5, length: 10 };

    component.onPageChange(pageEvent);
    expect(component.pageChange.emit).toHaveBeenCalledWith(pageEvent);
  });

  it('should emit filters when applied', () => {
    spyOn(component.filters, 'emit');
    const testFilters = { search: 'test' };

    component.onFiltersApplied(testFilters);
    expect(component.filters.emit).toHaveBeenCalledWith(testFilters);
  });

  it('should emit empty filters when reset', () => {
    spyOn(component.filters, 'emit');

    component.onFiltersReset();
    expect(component.filters.emit).toHaveBeenCalledWith({});
  });

  it('should show filter panel when isFiltered is true', () => {
    fixture.componentRef.setInput('isFiltered', true);
    fixture.componentRef.setInput('projects', mockProjects);
    fixture.detectChanges();

    const filterPanel = fixture.debugElement.query(
      By.css('profile-filter-panel')
    );
    expect(filterPanel).toBeTruthy();
  });

  it('should hide filter panel when isFiltered is false', () => {
    fixture.componentRef.setInput('isFiltered', false);
    fixture.componentRef.setInput('projects', mockProjects);
    fixture.detectChanges();

    const filterPanel = fixture.debugElement.query(
      By.css('profile-filter-panel')
    );
    expect(filterPanel).toBeNull();
  });
});
