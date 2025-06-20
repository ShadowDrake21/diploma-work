import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectService } from '@core/services/project/models/project.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ProfileProjectsComponent } from '@shared/components/profile-projects/profile-projects.component';
import { of, throwError } from 'rxjs';
import { MyCommentsComponent } from './components/my-comments/my-comments.component';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { ProjectSearchFilters } from '@shared/types/search.types';
describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;

  const mockProjectsResponse = {
    success: true,
    message: '',
    data: [
      { id: '1', title: 'Project 1' },
      { id: '2', title: 'Project 2' },
    ],
    totalItems: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getMyProjects',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        MatPaginatorModule,
        MatProgressSpinnerModule,
        ProfileInfoComponent,
        ProfileProjectsComponent,
        MyCommentsComponent,
        LoaderComponent,
      ],
      providers: [{ provide: ProjectService, useValue: mockProjectService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentPage()).toBe(0);
    expect(component.pageSize()).toBe(5);
    expect(component.searchFilters()).toEqual({});
    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('should load projects when search params change', fakeAsync(() => {
    mockProjectService.getMyProjects.and.returnValue(of(mockProjectsResponse));
    fixture.detectChanges();

    tick();

    expect(mockProjectService.getMyProjects).toHaveBeenCalled();
    expect(component.myProjects().length).toBe(2);
    expect(component.totalItems()).toBe(2);
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle project loading error', fakeAsync(() => {
    const errorResponse = { status: 404, message: 'Not Found' };
    mockProjectService.getMyProjects.and.returnValue(
      throwError(() => errorResponse)
    );
    fixture.detectChanges();

    tick();

    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toBe(
      'Не знайдено проектів, що відповідають вашим критеріям'
    );
  }));

  it('should update filters and reset page', () => {
    const filters = { search: 'test' };
    component.onFiltersChanged(filters);

    expect(component.searchFilters()).toEqual(filters);
    expect(component.currentPage()).toBe(0);
  });

  it('should reset filters', () => {
    component.searchFilters.set({ search: 'test' });
    component.onFiltersReset();

    expect(component.searchFilters()).toEqual({});
    expect(component.currentPage()).toBe(0);
  });

  it('should handle page change', () => {
    const pageEvent: PageEvent = { pageIndex: 2, pageSize: 10, length: 50 };
    component.onPageChanged(pageEvent);

    expect(component.currentPage()).toBe(2);
    expect(component.pageSize()).toBe(10);
  });

  it('should clean filters by removing empty values', () => {
    const dirtyFilters: ProjectSearchFilters = {
      search: 'test',
    };

    const cleanFilters = component.cleanFilters(dirtyFilters);

    expect(cleanFilters).toEqual({
      search: 'test',
    });
  });

  it('should return appropriate error messages', () => {
    expect(component.getErrorMessage({ status: 404 }, 'default')).toBe(
      'Не знайдено проектів, що відповідають вашим критеріям'
    );
    expect(component.getErrorMessage({ status: 403 }, 'default')).toBe(
      'У вас немає дозволу на перегляд цих проектів'
    );
    expect(component.getErrorMessage({ status: 400 }, 'default')).toBe(
      'Недійсні параметри пошуку'
    );
    expect(component.getErrorMessage({ status: 500 }, 'default')).toBe(
      'default'
    );
  });
});
