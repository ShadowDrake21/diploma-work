import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEditComponent } from './profile-edit.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '@core/services/notification.service';
import { IUser } from '@models/user.model';
import { UserRole, UserType } from '@shared/enums/user.enum';

describe('ProfileEditComponent', () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  const mockUser: IUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: UserRole.USER,
    userType: UserType.STUDENT,
    universityGroup: 'CS-101',
    dateOfBirth: new Date('1990-01-01'),
    phoneNumber: '+1234567890',
    socialLinks: [
      { url: 'https://github.com/test', name: 'GitHub' },
      { url: 'https://linkedin.com/test', name: 'LinkedIn' },
    ],
    affiliation: '',
    publicationCount: 0,
    patentCount: 0,
    researchCount: 0,
    tags: [],
    active: true,
  };

  beforeEach(async () => {
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ProfileEditComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        FormsModule,
        MatIcon,
      ],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    expect(component.profileForm).toBeDefined();
    expect(component.profileForm.value.userType).toBe(mockUser.userType);
    expect(component.profileForm.value.universityGroup).toBe(
      mockUser.universityGroup
    );
    expect(component.profileForm.value.phoneNumber).toBe(mockUser.phoneNumber);
    expect(component.socialLinksArray.length).toBe(
      mockUser.socialLinks?.length ?? 0
    );
  });

  it('should update form when user input changes', () => {
    const newUser: IUser = {
      ...mockUser,
      userType: UserType.TEACHER,
      universityGroup: undefined,
      phoneNumber: '+9876543210',
    };

    fixture.componentRef.setInput('user', newUser);
    component.ngOnChanges({
      user: {
        currentValue: newUser,
        previousValue: mockUser,
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    fixture.detectChanges();

    expect(component.profileForm.value.userType).toBe(UserType.TEACHER);
    expect(component.profileForm.value.universityGroup).toBeNull();
    expect(component.profileForm.value.phoneNumber).toBe('+9876543210');
  });

  it('should add social link when valid URL is provided', () => {
    const initialLength = component.socialLinksArray.length;
    component.newLink = 'https://twitter.com/test';
    component.addSocialLink();

    expect(component.socialLinksArray.length).toBe(initialLength + 1);
    expect(component.socialLinksArray.at(initialLength).value.url).toBe(
      'https://twitter.com/test'
    );
    expect(component.newLink).toBe('');
  });

  it('should not add social link when URL is invalid', () => {
    const initialLength = component.socialLinksArray.length;
    component.newLink = 'invalid-url';
    component.addSocialLink();

    expect(component.socialLinksArray.length).toBe(initialLength);
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Будь ласка, введіть дійсну URL-адресу'
    );
  });

  it('should remove social link when removeSocialLink is called', () => {
    const initialLength = component.socialLinksArray.length;
    component.removeSocialLink(0);

    expect(component.socialLinksArray.length).toBe(initialLength - 1);
  });

  it('should emit save event when form is valid', () => {
    spyOn(component.save, 'emit');

    component.profileForm.patchValue({
      phoneNumber: '+1234567890',
      userType: UserType.STUDENT,
      universityGroup: 'CS-101',
    });

    component.onSubmit();

    expect(component.save.emit).toHaveBeenCalled();
    expect(component.formError()).toBeNull();
  });

  it('should set error when form is invalid', () => {
    spyOn(component.save, 'emit');

    component.profileForm.patchValue({
      phoneNumber: 'invalid',
      userType: null,
    });

    component.onSubmit();

    expect(component.save.emit).not.toHaveBeenCalled();
    expect(component.formError()).toBe('Будь ласка, виправте помилки у формі');
    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Будь ласка, виправте помилки у формі'
    );
  });

  it('should emit cancel event when onCancel is called', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should show university group field only for student user type', () => {
    // Initial state (student)
    component.profileForm.patchValue({ userType: UserType.STUDENT });
    fixture.detectChanges();

    let groupField = fixture.nativeElement.querySelector(
      'input[formControlName="universityGroup"]'
    );
    expect(groupField).toBeTruthy();

    // Change to teacher
    component.profileForm.patchValue({ userType: UserType.TEACHER });
    fixture.detectChanges();

    groupField = fixture.nativeElement.querySelector(
      'input[formControlName="universityGroup"]'
    );
    expect(groupField).toBeFalsy();
  });

  it('should validate phone number pattern', () => {
    const phoneControl = component.profileForm.get('phoneNumber');

    phoneControl?.setValue('invalid');
    expect(phoneControl?.valid).toBeFalse();

    phoneControl?.setValue('+1234567890');
    expect(phoneControl?.valid).toBeTrue();
  });
});
