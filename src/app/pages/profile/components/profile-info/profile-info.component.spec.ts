import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileInfoComponent } from './profile-info.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { IUser } from '@models/user.model';
import { of, throwError } from 'rxjs';
import { UserRole, UserType } from '@shared/enums/user.enum';

describe('ProfileInfoComponent', () => {
  let component: ProfileInfoComponent;
  let fixture: ComponentFixture<ProfileInfoComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockUser: IUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    avatarUrl: 'http://example.com/avatar.jpg',
    phoneNumber: '1234567890',
    dateOfBirth: new Date('1990-01-01'),
    userType: UserType.STUDENT,
    universityGroup: 'CS-101',
    socialLinks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    role: UserRole.USER,
    affiliation: '',
    publicationCount: 0,
    patentCount: 0,
    researchCount: 0,
    tags: [],
    active: true,
  };

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', [
      'getCurrentUser',
      'updateUserProfile',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ProfileInfoComponent,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadUser', () => {
    it('should load user successfully', () => {
      userServiceMock.getCurrentUser.and.returnValue(of(mockUser));

      component.loadUser();

      expect(component.isProfileLoading()).toBeTrue();
      expect(userServiceMock.getCurrentUser).toHaveBeenCalled();

      fixture.detectChanges();

      expect(component.user()).toEqual(mockUser);
      expect(component.isProfileLoading()).toBeFalse();
      expect(component.error()).toBeNull();
    });

    it('should handle error when loading user', () => {
      const errorMessage = 'Failed to load user';
      userServiceMock.getCurrentUser.and.returnValue(
        throwError(() => ({ error: { message: errorMessage } }))
      );

      component.loadUser();

      expect(component.isProfileLoading()).toBeTrue();

      fixture.detectChanges();

      expect(component.error()).toBe(errorMessage);
      expect(component.isProfileLoading()).toBeFalse();
      expect(notificationServiceMock.showError).toHaveBeenCalled();
    });
  });

  describe('onSave', () => {
    beforeEach(() => {
      component.user.set(mockUser);
      userServiceMock.updateUserProfile.and.returnValue(
        of({ ...mockUser, phoneNumber: '9876543210' })
      );
    });

    it('should update user profile successfully', () => {
      const updatedData = { phoneNumber: '9876543210' };

      component.onSave(updatedData);

      expect(component.isSaving()).toBeTrue();
      expect(userServiceMock.updateUserProfile).toHaveBeenCalledWith(
        jasmine.any(Object)
      );

      fixture.detectChanges();

      expect(component.user()?.phoneNumber).toBe('9876543210');
      expect(currentUserSig()).toEqual(
        jasmine.objectContaining({ phoneNumber: '9876543210' })
      );
      expect(component.isSaving()).toBeFalse();
      expect(component.editMode()).toBeFalse();
      expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
    });

    it('should handle error when updating profile', () => {
      const errorMessage = 'Update failed';
      userServiceMock.updateUserProfile.and.returnValue(
        throwError(() => ({ error: { message: errorMessage } }))
      );

      component.onSave({ phoneNumber: '9876543210' });

      fixture.detectChanges();

      expect(component.error()).toBe(errorMessage);
      expect(component.isSaving()).toBeFalse();
    });
  });

  describe('handleAvatarSuccess', () => {
    it('should update user and currentUserSig when avatar is updated', () => {
      const updatedUser = {
        ...mockUser,
        avatarUrl: 'http://example.com/new-avatar.jpg',
      };

      component.handleAvatarSucess(updatedUser);

      expect(component.user()).toEqual(updatedUser);
      expect(currentUserSig()).toEqual(updatedUser);
      expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
    });
  });

  describe('handleAvatarFailure', () => {
    it('should show appropriate error message for 413 status', () => {
      component.handleAvatarFailure({ status: 413 });
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Розмір зображення завеликий'
      );
    });

    it('should show appropriate error message for 415 status', () => {
      component.handleAvatarFailure({ status: 415 });
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Непідтримуваний формат зображення'
      );
    });

    it('should show generic error message for other errors', () => {
      component.handleAvatarFailure({ status: 500 });
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Не вдалося оновити аватар. Спробуйте ще раз.'
      );
    });
  });

  it('should retry loading user when retryLoadUser is called', () => {
    spyOn(component, 'loadUser');
    component.retryLoadUser();
    expect(component.loadUser).toHaveBeenCalled();
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    const mockSubscription = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    component['subscriptions'] = [mockSubscription];

    component.ngOnDestroy();

    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});
