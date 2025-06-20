import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { UserDetailsComponent } from './user-details.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '@core/services/admin.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { UserService } from '@core/services/users/user.service';
import { ProjectDTO } from '@models/project.model';
import { IUser } from '@models/user.model';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { UserRole } from '@shared/enums/user.enum';
import { of, throwError } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { ProjectType } from '@shared/enums/categories.enum';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockUser: IUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: UserRole.USER,
    active: true,
    phoneNumber: '1234567890',
    affiliation: 'Test University',
    createdAt: new Date(),
    avatarUrl: 'assets/default-avatar.png',
    publicationCount: 0,
    patentCount: 0,
    researchCount: 0,
    tags: [],
  };

  const mockProjects: ProjectDTO[] = [
    {
      id: '1',
      title: 'Project 1',
      description: 'Test project',
      type: ProjectType.PUBLICATION,
      progress: 75,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: [],
      createdBy: 1,
    },
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', ['getFullUserById']);
    mockAdminService = jasmine.createSpyObj('AdminService', [
      'promoteToAdmin',
      'demoteFromAdmin',
      'deactivateUser',
      'reactivateUser',
      'deleteUser',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getMyProjects',
    ]);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ id: '1' }),
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatTabsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatListModule,
        MatProgressSpinnerModule,
        UserDetailsComponent,
        LoaderComponent,
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AdminService, useValue: mockAdminService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;

    mockUserService.getFullUserById.and.returnValue(of(mockUser));
    mockProjectService.getMyProjects.and.returnValue(
      of({
        data: mockProjects,
        totalItems: 1,
      })
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(mockUserService.getFullUserById).toHaveBeenCalledWith(1);
    expect(component.user()).toEqual(mockUser);
    expect(mockNotificationService.showSuccess).toHaveBeenCalled();
  }));

  it('should handle error when loading user data', fakeAsync(() => {
    const error = { status: 404, message: 'Not found' };
    mockUserService.getFullUserById.and.returnValue(throwError(() => error));

    component.ngOnInit();
    tick();

    expect(component.error()).toBe('Користувача не знайдено');
    expect(mockNotificationService.showError).toHaveBeenCalled();
  }));

  it('should load user projects', fakeAsync(() => {
    component.loadUserProjects();
    tick();

    expect(mockProjectService.getMyProjects).toHaveBeenCalled();
    expect(component.userProjects()).toEqual(mockProjects);
    expect(component.totalItems()).toBe(1);
  }));

  it('should promote user', fakeAsync(async () => {
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    mockAdminService.promoteToAdmin.and.returnValue(of({}));

    await component.promoteUser();
    tick();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockAdminService.promoteToAdmin).toHaveBeenCalledWith(1);
    expect(mockNotificationService.showSuccess).toHaveBeenCalled();
    expect(component.user()?.role).toBe(UserRole.ADMIN);
  }));

  it('should demote user', fakeAsync(async () => {
    component.user.set({ ...mockUser, role: UserRole.ADMIN });
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    mockAdminService.demoteFromAdmin.and.returnValue(of({}));

    await component.demoteUser();
    tick();

    expect(mockAdminService.demoteFromAdmin).toHaveBeenCalledWith(1);
    expect(component.user()?.role).toBe(UserRole.USER);
  }));

  it('should deactivate user', fakeAsync(async () => {
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    mockAdminService.deactivateUser.and.returnValue(of({}));

    await component.deactivateUser();
    tick();

    expect(mockAdminService.deactivateUser).toHaveBeenCalledWith(1);
    expect(component.user()?.active).toBeFalse();
  }));

  it('should reactivate user', fakeAsync(async () => {
    component.user.set({ ...mockUser, active: false });
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    mockAdminService.reactivateUser.and.returnValue(of({}));

    await component.reactivateUser();
    tick();

    expect(mockAdminService.reactivateUser).toHaveBeenCalledWith(1);
    expect(component.user()?.active).toBeTrue();
  }));

  it('should delete user', fakeAsync(async () => {
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    mockAdminService.deleteUser.and.returnValue(of({}));

    await component.deleteUser();
    tick();

    expect(mockAdminService.deleteUser).toHaveBeenCalledWith(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/users']);
  }));

  it('should handle page change', () => {
    const pageEvent = { pageIndex: 1, pageSize: 20 } as PageEvent;
    spyOn(component, 'loadProjects');

    component.onPageChange(pageEvent);

    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(20);
    expect(component.loadProjects).toHaveBeenCalled();
  });

  it('should go back to users list', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/users-management/users',
    ]);
  });
});
