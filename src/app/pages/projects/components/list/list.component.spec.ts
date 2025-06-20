import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { ProjectDTO } from '@models/project.model';
import { of, throwError } from 'rxjs';
import { ListProjectsComponent } from './list.component';
import { ProjectType } from '@shared/enums/categories.enum';

describe('ListProjectsComponent', () => {
  let component: ListProjectsComponent;
  let fixture: ComponentFixture<ListProjectsComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProjects: ProjectDTO[] = [
    {
      id: '1',
      title: 'Project 1',
      description: 'Desc 1',
      type: ProjectType.RESEARCH,
      progress: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: [],
      createdBy: 1,
    },
    {
      id: '2',
      title: 'Project 2',
      description: 'Desc 2',
      type: ProjectType.PUBLICATION,
      progress: 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: [],
      createdBy: 1,
    },
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'searchProjects',
      'getMyProjects',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
          keys: [],
        },
      },
      queryParamMap: of({
        get: (key: string) => null,
        keys: [],
      }),
    };

    await TestBed.configureTestingModule({
      imports: [
        ListProjectsComponent,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatButtonModule,
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListProjectsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.projects()).toEqual([]);
    expect(component.isLoading()).toBeFalse();
    expect(component.totalItems()).toBe(0);
    expect(component.currentPage()).toBe(0);
    expect(component.pageSize()).toBe(10);
    expect(component.filters()).toEqual({});
  });

  it('should load projects on init', fakeAsync(() => {
    const mockResponse = { data: mockProjects, totalItems: 2 };
    mockProjectService.searchProjects.and.returnValue(of(mockResponse));

    fixture.detectChanges();
    tick();

    expect(mockProjectService.searchProjects).toHaveBeenCalledWith({}, 0, 10);
    expect(component.projects()).toEqual(mockProjects);
    expect(component.totalItems()).toBe(2);
    expect(component.isLoading()).toBeFalse();
  }));

  it('should load my projects when mode is "mine"', fakeAsync(() => {
    mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue('mine');
    mockActivatedRoute.queryParamMap = of({
      get: (key: string) => 'mine',
      keys: ['mode'],
    });

    const mockResponse = { data: mockProjects, totalItems: 2 };
    mockProjectService.getMyProjects.and.returnValue(of(mockResponse));

    fixture.detectChanges();
    tick();

    expect(mockProjectService.getMyProjects).toHaveBeenCalledWith({}, 0, 10);
    expect(component.projects()).toEqual(mockProjects);
  }));

  it('should handle project loading error', fakeAsync(() => {
    mockProjectService.searchProjects.and.returnValue(
      throwError(() => new Error('Error loading'))
    );

    fixture.detectChanges();
    tick();

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити проекти'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle my projects loading error', fakeAsync(() => {
    mockActivatedRoute.snapshot.queryParamMap.get.and.returnValue('mine');
    mockProjectService.getMyProjects.and.returnValue(
      throwError(() => new Error('Error loading'))
    );

    fixture.detectChanges();
    tick();

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити ваші проекти'
    );
  }));

  it('should apply filters', fakeAsync(() => {
    const mockResponse = { data: mockProjects, totalItems: 2 };
    mockProjectService.searchProjects.and.returnValue(of(mockResponse));

    const testFilters = { search: 'test', type: 'RESEARCH' };
    component.onFiltering(testFilters);
    tick();

    expect(component.filters()).toEqual(testFilters);
    expect(component.currentPage()).toBe(0);
    expect(mockProjectService.searchProjects).toHaveBeenCalledWith(
      testFilters,
      0,
      10
    );
  }));

  it('should reset filters', fakeAsync(() => {
    const mockResponse = { data: mockProjects, totalItems: 2 };
    mockProjectService.searchProjects.and.returnValue(of(mockResponse));

    component.onFiltersReset();
    tick();

    expect(component.filters()).toEqual({});
    expect(component.currentPage()).toBe(0);
    expect(mockProjectService.searchProjects).toHaveBeenCalledWith({}, 0, 10);
  }));

  it('should handle page change', fakeAsync(() => {
    const mockResponse = { data: mockProjects, totalItems: 2 };
    mockProjectService.searchProjects.and.returnValue(of(mockResponse));

    const pageEvent = { pageIndex: 2, pageSize: 20 } as PageEvent;
    component.onPageChange(pageEvent);
    tick();

    expect(component.currentPage()).toBe(2);
    expect(component.pageSize()).toBe(20);
    expect(mockProjectService.searchProjects).toHaveBeenCalledWith({}, 2, 20);
  }));

  it('should detect query params changes', fakeAsync(() => {
    let queryParams: { mode: string | null } = { mode: null };
    mockActivatedRoute.queryParamMap = of({
      get: (key: string) => queryParams.mode,
      keys: Object.keys(queryParams),
    });

    const mockResponse = { data: mockProjects, totalItems: 2 };
    mockProjectService.searchProjects.and.returnValue(of(mockResponse));

    fixture.detectChanges();
    tick();

    queryParams = { mode: 'mine' };
    mockProjectService.getMyProjects.and.returnValue(of(mockResponse));

    fixture.detectChanges();
    tick();

    expect(mockProjectService.getMyProjects).toHaveBeenCalled();
  }));

  it('should unsubscribe on destroy', () => {
    const addSpy = spyOn(component.subscriptions, 'push').and.callThrough();

    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalled();

    const unsubscribeSpy = spyOn(component.subscriptions[0], 'unsubscribe');
    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
