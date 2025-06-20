import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { UserListComponent } from './user-list.component';
import { AdminService } from '@core/services/admin.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { RecentUsersComponent } from './components/recent-users/recent-users.component';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NotificationService } from '@core/services/notification.service';
import { IsCurrentUserPipe } from '@pipes/is-current-user.pipe';
import { UserRoleChipComponent } from '../utils/user-role-chip/user-role-chip.component';
import { UserStatusChipComponent } from '../utils/user-status-chip/user-status-chip.component';
import { IUser } from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';

describe('UserListComponent', () => {
  let component: UserListComponent;

  let fixture: ComponentFixture<UserListComponent>;
  let adminServiceMock: jasmine.SpyObj<AdminService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let routerMock: jasmine.SpyObj<Router>;
  let breakpointObserverMock: jasmine.SpyObj<BreakpointObserver>;

  const mockUsers: IUser[] = [
    {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.USER,
      active: true,
      createdAt: new Date(),
      avatarUrl: 'http://example.com/avatar.jpg',
      affiliation: 'university A',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
    },
  ];

  beforeEach(async () => {
    adminServiceMock = jasmine.createSpyObj('AdminService', [
      'getAllUsers',
      'promoteToAdmin',
      'demoteFromAdmin',
      'deactivateUser',
      'reactivateUser',
      'deleteUser',
    ]);

    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);

    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    breakpointObserverMock = jasmine.createSpyObj('BreakpointObserver', [
      'observe',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        UserRoleChipComponent,
        UserStatusChipComponent,
        RecentUsersComponent,
        IsCurrentUserPipe,
        LoaderComponent,
        UserListComponent,
      ],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: Router, useValue: routerMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load users on init', fakeAsync(() => {
      const response = { success: true, data: mockUsers, totalItems: 1 };
      adminServiceMock.getAllUsers.and.returnValue(of(response));
      breakpointObserverMock.observe.and.returnValue(of({ matches: false }));

      fixture.detectChanges();
      tick();

      expect(adminServiceMock.getAllUsers).toHaveBeenCalled();
      expect(component.users()).toEqual(mockUsers);
      expect(component.totalItems()).toBe(1);
      expect(component.isLoading()).toBeFalse();
    }));

    it('should handle error when loading users', fakeAsync(() => {
      const error = { status: 500, message: 'Server error' };
      adminServiceMock.getAllUsers.and.returnValue(throwError(() => error));
      breakpointObserverMock.observe.and.returnValue(of({ matches: false }));

      fixture.detectChanges();
      tick();

      expect(component.error()).toBe('Помилка завантаження користувачів');
      expect(notificationServiceMock.showError).toHaveBeenCalled();
      expect(component.isLoading()).toBeFalse();
    }));

    it('should detect mobile view', () => {
      breakpointObserverMock.observe.and.returnValue(of({ matches: true }));
      fixture.detectChanges();
      expect(component.isMobile()).toBeFalse();
    });
  });

  describe('User Actions', () => {
    beforeEach(() => {
      const response = { success: true, data: mockUsers, totalItems: 1 };
      adminServiceMock.getAllUsers.and.returnValue(of(response));
      breakpointObserverMock.observe.and.returnValue(of({ matches: false }));
      fixture.detectChanges();
    });

    it('should promote user to admin', () => {
      const dialogRefMock = { afterClosed: () => of(true) };
      dialogMock.open.and.returnValue(dialogRefMock as any);
      adminServiceMock.promoteToAdmin.and.returnValue(of({}));

      component.promoteUser(mockUsers[0]);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(adminServiceMock.promoteToAdmin).toHaveBeenCalledWith(1);
      expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
    });

    it('should demote admin to user', () => {
      const adminUser = { ...mockUsers[0], role: UserRole.ADMIN };
      const dialogRefMock = { afterClosed: () => of(true) };
      dialogMock.open.and.returnValue(dialogRefMock as any);
      adminServiceMock.demoteFromAdmin.and.returnValue(of({}));

      component.demoteUser(adminUser);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(adminServiceMock.demoteFromAdmin).toHaveBeenCalledWith(1);
      expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
    });

    it('should deactivate user', () => {
      const dialogRefMock = { afterClosed: () => of(true) };
      dialogMock.open.and.returnValue(dialogRefMock as any);
      adminServiceMock.deactivateUser.and.returnValue(of({}));

      component.deactivateUser(mockUsers[0]);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(adminServiceMock.deactivateUser).toHaveBeenCalledWith(1);
      expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
    });

    it('should reactivate user', () => {
      const inactiveUser = { ...mockUsers[0], active: false };
      const dialogRefMock = { afterClosed: () => of(true) };
      dialogMock.open.and.returnValue(dialogRefMock as any);
      adminServiceMock.reactivateUser.and.returnValue(of({}));

      component.reactivateUser(inactiveUser);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(adminServiceMock.reactivateUser).toHaveBeenCalledWith(1);
      expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
    });

    it('should delete user', () => {
      const dialogRefMock = { afterClosed: () => of(true) };
      dialogMock.open.and.returnValue(dialogRefMock as any);
      adminServiceMock.deleteUser.and.returnValue(of({}));

      component.deleteUser(mockUsers[0]);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(adminServiceMock.deleteUser).toHaveBeenCalledWith(1);
      expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
    });

    it('should navigate to user details', () => {
      component.viewUserDetails(mockUsers[0]);
      expect(routerMock.navigate).toHaveBeenCalledWith([
        '/admin/users-management/users',
        1,
      ]);
    });
  });

  describe('Pagination and Sorting', () => {
    it('should handle page change', () => {
      const event = { pageIndex: 1, pageSize: 20 } as PageEvent;
      component.onPageChange(event);

      expect(component.currentPage()).toBe(1);
      expect(component.pageSize()).toBe(20);
    });

    it('should handle sort change', () => {
      const sortEvent = { active: 'username', direction: 'desc' } as Sort;
      component.onSortChange(sortEvent);

      expect(component.sortField()).toBe('username');
      expect(component.sortDirection()).toBe('DESC');
      expect(component.currentPage()).toBe(0);
    });
  });

  describe('Template', () => {
    it('should show loader when loading', () => {
      component.isLoading.set(true);
      fixture.detectChanges();

      const loader = fixture.nativeElement.querySelector('custom-loader');
      expect(loader).toBeTruthy();
    });

    it('should show error message when error occurs', () => {
      component.error.set('Test error');
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.text-red-600');
      expect(errorElement.textContent).toContain('Test error');
    });

    it('should show users table when data is loaded', () => {
      component.users.set(mockUsers);
      component.totalItems.set(1);
      fixture.detectChanges();

      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeTruthy();
      const rows = fixture.nativeElement.querySelectorAll('mat-row');
      expect(rows.length).toBe(mockUsers.length);
    });

    it('should show empty state when no users', () => {
      component.users.set([]);
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('.text-red-600');
      expect(emptyState.textContent).toContain('Користувачів не знайдено');
    });
  });
});
