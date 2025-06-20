import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { UsersComponent } from './users.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { IUser } from '@models/user.model';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { of, throwError } from 'rxjs';
import { UserRole } from '@shared/enums/user.enum';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockUsers: IUser[] = [
    {
      id: 1,
      username: 'user1',
      email: 'user1@test.com',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
    {
      id: 1,
      username: 'user2',
      email: 'user2@test.com',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    },
  ];

  const mockResponse = {
    data: mockUsers,
    totalItems: 2,
    page: 0,
    totalPages: 1,
  };

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'getPaginatedUsers',
      'searchUsers',
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatListModule,
        MatChipsModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        UsersComponent,
        UserCardComponent,
        LoaderComponent,
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;

    userService.getPaginatedUsers.and.returnValue(of(mockResponse));
    userService.searchUsers.and.returnValue(of(mockResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form control and signals', () => {
    expect(component.searchControl).toBeDefined();
    expect(component.users()).toEqual([]);
    expect(component.isLoading()).toBeFalse();
    expect(component.searchQuery()).toBe('');
    expect(component.currentPage()).toBe(0);
    expect(component.pageSize()).toBe(10);
    expect(component.totalItems()).toBe(0);
    expect(component.errorOccurred()).toBeFalse();
  });

  it('should load users on init', () => {
    fixture.detectChanges();
    expect(userService.getPaginatedUsers).toHaveBeenCalledWith(0, 10);
    expect(component.users()).toEqual(mockUsers);
    expect(component.totalItems()).toBe(2);
  });

  it('should handle search query changes', fakeAsync(() => {
    fixture.detectChanges();
    component.searchControl.setValue('test');
    tick(300); // debounce time

    expect(component.searchQuery()).toBe('test');
    expect(userService.searchUsers).toHaveBeenCalledWith('test', 0, 10);
  }));

  it('should handle page changes', () => {
    fixture.detectChanges();
    const pageEvent = { pageIndex: 1, pageSize: 5, length: 20 } as PageEvent;
    component.onPageChange(pageEvent);

    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(5);
    expect(userService.getPaginatedUsers).toHaveBeenCalledWith(1, 5);
  });

  it('should display correct message when no search query', () => {
    component.totalItems.set(5);
    expect(component.displayMessage()).toBe('Усі користувачі: 5');
  });

  it('should display correct message with search query', () => {
    component.searchQuery.set('test');
    component.users.set(mockUsers);
    component.totalItems.set(10);
    expect(component.displayMessage()).toBe(
      'Результати пошуку для "test": 2 з 10 знайдених користувачів.'
    );
  });

  it('should display error message when error occurred', () => {
    component.errorOccurred.set(true);
    expect(component.displayMessage()).toBe(
      'Не вдалося завантажити користувачів. Спробуйте пізніше.'
    );
  });

  it('should handle error when loading users', () => {
    userService.getPaginatedUsers.and.returnValue(
      throwError(() => new Error('Error'))
    );
    fixture.detectChanges();

    expect(component.errorOccurred()).toBeTrue();
    expect(notificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити користувачів. Спробуйте пізніше.'
    );
  });

  it('should reload users when retry button clicked', () => {
    component.errorOccurred.set(true);
    fixture.detectChanges();

    const reloadSpy = spyOn(component, 'reloadUsers').and.callThrough();
    const button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();

    expect(reloadSpy).toHaveBeenCalled();
    expect(userService.getPaginatedUsers).toHaveBeenCalledWith(0, 10);
  });

  it('should clear search when clear button clicked', () => {
    component.searchControl.setValue('test');
    fixture.detectChanges();

    const clearButton =
      fixture.debugElement.nativeElement.querySelector('button[matSuffix]');
    clearButton.click();

    expect(component.searchControl.value).toBe('');
    expect(component.searchQuery()).toBe('');
  });

  it('should show loading spinner when loading', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const spinner =
      fixture.debugElement.nativeElement.querySelector('custom-loader');
    expect(spinner).toBeTruthy();
  });

  it('should show no users message when no users found', () => {
    component.users.set([]);
    component.searchQuery.set('nonexistent');
    fixture.detectChanges();

    const message =
      fixture.debugElement.nativeElement.querySelector('.text-red-500');
    expect(message.textContent).toContain(
      'Не знайдено користувачів для запиту:'
    );
  });
});
