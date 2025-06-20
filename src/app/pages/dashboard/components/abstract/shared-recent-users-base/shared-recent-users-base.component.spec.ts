import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedRecentUsersBase } from './shared-recent-users-base.component';
import { Component, signal } from '@angular/core';
import { RecentUsersService } from '@core/services/users/recent-users.service';
import { IUser } from '@models/user.model';
import { UserRole } from '@shared/enums/user.enum';

@Component({
  template: '',
})
class TestComponent extends SharedRecentUsersBase {}

describe('SharedRecentUsersBase', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let recentUsersServiceMock: jasmine.SpyObj<RecentUsersService>;

  beforeEach(async () => {
    recentUsersServiceMock = jasmine.createSpyObj(
      'RecentUsersService',
      ['refreshActiveUsers'],
      { activeUsers: signal(null) }
    );

    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        { provide: RecentUsersService, useValue: recentUsersServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize signals with default values', () => {
    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('should handle activeUsers response', () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        username: 'User',
        email: 'user@example.com',
        role: UserRole.USER,
        affiliation: 'University',
        publicationCount: 0,
        patentCount: 0,
        researchCount: 0,
        tags: [],
        active: true,
      },
    ];
    spyOnProperty(recentUsersServiceMock, 'activeUsers', 'get').and.returnValue(
      signal(mockUsers)
    );
    fixture.detectChanges();

    expect(component.activeUsers).toEqual(mockUsers);
    expect(component.error()).toBeNull();
  });

  it('should handle error response', () => {
    spyOnProperty(recentUsersServiceMock, 'activeUsers', 'get').and.returnValue(
      signal({
        error: { message: 'Test error' },
      })
    );
    fixture.detectChanges();

    expect(component.error()).toBe('Test error');
    expect(component.activeUsers).toEqual([]);
  });

  it('should refresh active users', () => {
    component.refreshActiveUsers();

    expect(component.isLoading()).toBeTrue();
    expect(component.error()).toBeNull();
    expect(recentUsersServiceMock.refreshActiveUsers).toHaveBeenCalled();
  });

  it('should not refresh if already loading', () => {
    component.isLoading.set(true);
    component.refreshActiveUsers();

    expect(recentUsersServiceMock.refreshActiveUsers).not.toHaveBeenCalled();
  });
});
