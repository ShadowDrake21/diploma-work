import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsComponent } from './user-tabs.component';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { ProjectDTO } from '@models/project.model';
import { IUser } from '@models/user.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { of, throwError } from 'rxjs';
import { UserRole } from '@shared/enums/user.enum';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockUser: IUser = {
    id: 1,
    email: 'user1@test.com',
    role: UserRole.USER,
    active: true,
    username: '',
    affiliation: '',
    publicationCount: 0,
    patentCount: 0,
    researchCount: 0,
    tags: [],
  };

  const mockProjects: ProjectDTO[] = [
    {
      id: '1',
      title: 'Project 1',
      type: ProjectType.PUBLICATION,
      description: '',
      progress: 50,
      createdAt: '',
      updatedAt: '',
      tagIds: [],
      createdBy: 1,
    },
    {
      id: '2',
      title: 'Project 2',
      type: ProjectType.PATENT,
      description: '',
      progress: 50,
      createdAt: '',
      updatedAt: '',
      tagIds: [],
      createdBy: 1,
    },
    {
      id: '3',
      title: 'Project 3',
      type: ProjectType.RESEARCH,
      description: '',
      progress: 50,
      createdAt: '',
      updatedAt: '',
      tagIds: [],
      createdBy: 1,
    },
    {
      id: '4',
      title: 'Project 4',
      type: ProjectType.PUBLICATION,
      description: '',
      progress: 50,
      createdAt: '',
      updatedAt: '',
      tagIds: [],
      createdBy: 1,
    },
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getProjectsWithDetails',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [TabsComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('user', mockUser);
    mockUserService.getProjectsWithDetails.and.returnValue(of(mockProjects));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects when user is set', () => {
    expect(mockUserService.getProjectsWithDetails).toHaveBeenCalledWith(1);
    expect(component.allProjects()).toEqual(mockProjects);
    expect(component.loading()).toBeFalse();
  });

  it('should handle project load error', () => {
    mockUserService.getProjectsWithDetails.and.returnValue(
      throwError(() => new Error('Error'))
    );

    fixture.componentRef.setInput('user', { ...mockUser });

    expect(component.error()).toBe('Failed to load projects');
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Failed to load user projects'
    );
    expect(component.loading()).toBeFalse();
  });

  it('should filter and paginate publications correctly', () => {
    const publications = component.publications();
    expect(publications.length).toBe(2);
    expect(publications[0].type).toBe(ProjectType.PUBLICATION);

    component.tabPagination.update((prev) => ({
      ...prev,
      publications: { pageSize: 1, currentPage: 1 },
    }));

    const paginatedPublications = component.publications();
    expect(paginatedPublications.length).toBe(1);
  });

  it('should update pagination on page change', () => {
    const pageEvent = { pageIndex: 1, pageSize: 2 } as PageEvent;
    component.onPageChange(pageEvent, 'publications');

    expect(component.tabPagination().publications.currentPage).toBe(1);
    expect(component.tabPagination().publications.pageSize).toBe(2);
  });

  it('should calculate totals correctly', () => {
    expect(component.totalPublications()).toBe(2);
    expect(component.totalPatents()).toBe(1);
    expect(component.totalResearches()).toBe(1);
  });
});
