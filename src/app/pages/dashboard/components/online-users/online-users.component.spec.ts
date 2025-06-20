import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineUsersComponent } from './online-users.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '@core/services/users/user.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { of, throwError } from 'rxjs';
import { IUser } from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';

describe('OnlineUsersComponent', () => {
  let component: OnlineUsersComponent;
  let fixture: ComponentFixture<OnlineUsersComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'getRecentlyActiveUsers',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        OnlineUsersComponent,
        MatCardModule,
        MatIconModule,
        UserCardComponent,
        LoaderComponent,
      ],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlineUsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load active users on init', () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        username: 'user1',
        avatarUrl: '',
        role: UserRole.USER,
        lastActive: new Date(),
        email: 'user1@test.com',
        affiliation: 'University A',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
      {
        id: 2,
        username: 'user2',
        avatarUrl: '',
        role: UserRole.ADMIN,
        lastActive: new Date(),
        email: 'user2@test.com',
        affiliation: 'University A',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
    ];
    mockUserService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));

    fixture.detectChanges();

    expect(mockUserService.getRecentlyActiveUsers).toHaveBeenCalled();
    expect(component['activeUsers']).toEqual(mockUsers); // Accessing protected property
    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('should handle error when loading active users', () => {
    const errorResponse = new Error('Failed to load users');
    mockUserService.getRecentlyActiveUsers.and.returnValue(
      throwError(() => errorResponse)
    );

    fixture.detectChanges();

    expect(mockUserService.getRecentlyActiveUsers).toHaveBeenCalled();
    expect(component.error()).toContain('Failed to load');
    expect(component.isLoading()).toBeFalse();
  });

  it('should refresh active users', () => {
    const mockUsers: IUser[] = [
      {
        id: 3,
        username: 'user3',
        avatarUrl: '',
        role: UserRole.USER,
        lastActive: new Date(),
        email: 'user3@test.com',
        affiliation: 'University B',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
    ];
    mockUserService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));

    component.refreshActiveUsers();

    expect(mockUserService.getRecentlyActiveUsers).toHaveBeenCalledTimes(1);
    expect(component['activeUsers']).toEqual(mockUsers); // Accessing protected property
  });

  it('should display loading spinner when isLoading is true', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const loader = fixture.nativeElement.querySelector('custom-loader');
    expect(loader).toBeTruthy();
  });

  it('should display error message and retry button when error occurs', () => {
    component.error.set('Test error message');
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('p');
    const retryButton = fixture.nativeElement.querySelector('button');

    expect(errorMessage.textContent).toContain('Test error message');
    expect(retryButton).toBeTruthy();
  });

  it('should display user cards when users are loaded', () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        username: 'user1',
        avatarUrl: '',
        role: UserRole.USER,
        lastActive: new Date(),
        email: 'user1@test.com',
        affiliation: 'University A',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
    ];
    mockUserService.getRecentlyActiveUsers.and.returnValue(of(mockUsers));
    component.refreshActiveUsers();
    component.isLoading.set(false);
    fixture.detectChanges();

    const userCards =
      fixture.nativeElement.querySelectorAll('shared-user-card');
    expect(userCards.length).toBe(1);
  });

  it('should display no users message when activeUsers is empty', () => {
    component['activeUsers'].length = 0;
    component.isLoading.set(false);
    fixture.detectChanges();

    const noUsersMessage =
      fixture.nativeElement.querySelector('.no-users-message');
    expect(noUsersMessage.textContent).toContain('Немає активних користувачів');
  });
});
