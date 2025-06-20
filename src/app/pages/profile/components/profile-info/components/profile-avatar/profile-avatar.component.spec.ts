import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAvatarComponent } from './profile-avatar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/users/user.service';
import { IUser } from '@models/user.model';
import { of, throwError } from 'rxjs';
import { UserRole, UserType } from '@shared/enums/user.enum';

describe('ProfileAvatarComponent', () => {
  let component: ProfileAvatarComponent;
  let fixture: ComponentFixture<ProfileAvatarComponent>;
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
    userServiceMock = jasmine.createSpyObj('UserService', ['updateUserAvatar']);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ProfileAvatarComponent,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileAvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFileSelected', () => {
    it('should do nothing if no file is selected', () => {
      const event = { target: { files: [] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.selectedFile()).toBeNull();
    });

    it('should validate and accept valid file', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } } as unknown as Event;

      component.onFileSelected(event);

      expect(component.selectedFile()).toEqual(file);
      expect(component.errorMessage()).toBe('');
      expect(component.showPreview()).toBeTrue();
    });

    it('should reject file that is too large', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      spyOnProperty(file, 'size', 'get').and.returnValue(6 * 1024 * 1024); // 6MB
      const event = { target: { files: [file] } } as unknown as Event;

      component.onFileSelected(event);

      expect(component.errorMessage()).toBe('File must be smaller than 5MB');
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'File must be smaller than 5MB'
      );
    });

    it('should reject unsupported file type', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const event = { target: { files: [file] } } as unknown as Event;

      component.onFileSelected(event);

      expect(component.errorMessage()).toBe(
        'Only image files are allowed (JPEG, PNG, GIF, WEBP)'
      );
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Only image files are allowed (JPEG, PNG, GIF, WEBP)'
      );
    });
  });

  describe('onAvatarChanged', () => {
    it('should upload avatar successfully', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      component.selectedFile.set(file);
      const updatedUser = {
        ...mockUser,
        avatarUrl: 'http://example.com/new-avatar.jpg',
      };
      userServiceMock.updateUserAvatar.and.returnValue(of(updatedUser));

      component.onAvatarChanged();

      expect(component.isLoading()).toBeTrue();

      // Simulate async completion
      fixture.detectChanges();

      expect(component.previewUrl()).toBe(updatedUser.avatarUrl);
      expect(component.isLoading()).toBeFalse();
      expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith(
        'Аватар успішно оновлено'
      );
    });

    it('should handle upload error - file too large', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      component.selectedFile.set(file);
      userServiceMock.updateUserAvatar.and.returnValue(
        throwError(() => ({ status: 413 }))
      );

      component.onAvatarChanged();

      // Simulate async completion
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Image size too large (max 5MB)');
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Image size too large (max 5MB)'
      );
      expect(component.isLoading()).toBeFalse();
    });

    it('should handle upload error - unsupported format', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      component.selectedFile.set(file);
      userServiceMock.updateUserAvatar.and.returnValue(
        throwError(() => ({ status: 415 }))
      );

      component.onAvatarChanged();

      // Simulate async completion
      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Unsupported image format');
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Unsupported image format'
      );
      expect(component.isLoading()).toBeFalse();
    });

    it('should handle upload error - network error', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      component.selectedFile.set(file);
      userServiceMock.updateUserAvatar.and.returnValue(
        throwError(() => ({ status: 0 }))
      );

      component.onAvatarChanged();

      // Simulate async completion
      fixture.detectChanges();

      expect(component.errorMessage()).toBe(
        'Network error - please check your connection'
      );
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Network error - please check your connection'
      );
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('cancelUpload', () => {
    it('should reset upload state', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      component.selectedFile.set(file);
      component.previewUrl.set('data:image/jpeg;base64,test');
      component.showPreview.set(true);
      component.errorMessage.set('Test error');

      spyOn(component, 'resetFileInput');
      component.cancelUpload();

      expect(component.showPreview()).toBeFalse();
      expect(component.previewUrl()).toBeNull();
      expect(component.selectedFile()).toBeNull();
      expect(component.errorMessage()).toBe('');
      expect(component.resetFileInput).toHaveBeenCalled();
    });
  });

  it('should return avatar URL with timestamp', () => {
    const timestamp = mockUser.updatedAt?.getTime() || Date.now();
    expect(component.avatarUrl).toContain(`?v=${timestamp}`);
  });

  it('should reset state on destroy', () => {
    spyOn(component, 'resetUploadState');
    component.ngOnDestroy();
    expect(component.resetUploadState).toHaveBeenCalled();
  });
});
