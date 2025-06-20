import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDropdownComponent } from './profile-dropdown.component';
import { AuthService } from '@core/authentication/auth.service';
import { UserService } from '@core/services/users/user.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { UserRole } from '@shared/enums/user.enum';
import { DEFAULT_AVATAR_URL } from '@core/constants/default-variables';

describe('ProfileDropdownComponent', () => {
  let component: ProfileDropdownComponent;
  let fixture: ComponentFixture<ProfileDropdownComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);
    mockUserService = jasmine.createSpyObj('UserService', ['getCurrentUser']);

    currentUserSig.set({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      avatarUrl: 'test-avatar.jpg',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    });

    await TestBed.configureTestingModule({
      imports: [ProfileDropdownComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle profile dropdown', () => {
    expect(component.isProfileOpened()).toBeFalse();
    component.toggleProfile();
    expect(component.isProfileOpened()).toBeTrue();
    component.toggleProfile();
    expect(component.isProfileOpened()).toBeFalse();
  });

  it('should close profile dropdown', () => {
    component.isProfileOpened.set(true);
    component.closeProfile();
    expect(component.isProfileOpened()).toBeFalse();
  });

  it('should call logout on authService when onLogout is called', () => {
    component.onLogout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component.isProfileOpened()).toBeFalse();
  });

  it('should display current user information', () => {
    component.isProfileOpened.set(true);
    fixture.detectChanges();

    const usernameElement = fixture.nativeElement.querySelector('h5');
    const emailElement = fixture.nativeElement.querySelector('p');

    expect(usernameElement.textContent).toContain('testuser');
    expect(emailElement.textContent).toContain('test@example.com');
  });

  it('should use default avatar when no avatarUrl is provided', () => {
    currentUserSig.set({
      id: 1,
      username: 'user1',
      email: 'user1@example.com',
      role: UserRole.USER,
      affiliation: '',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
      avatarUrl: DEFAULT_AVATAR_URL,
    });

    fixture.detectChanges();
    expect(component.getAvatarUrl()).toBe('DEFAULT_AVATAR_URL');
  });

  it('should render profile menu items', () => {
    component.isProfileOpened.set(true);
    fixture.detectChanges();

    const menuItems = fixture.nativeElement.querySelectorAll('a');
    expect(menuItems.length).toBe(component.profileMenuItems.length);
  });
});
