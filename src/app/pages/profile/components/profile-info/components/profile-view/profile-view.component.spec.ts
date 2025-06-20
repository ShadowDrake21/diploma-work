import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileViewComponent } from './profile-view.component';
import { IUser } from '@models/user.model';
import { UserRole, UserType } from '@shared/enums/user.enum';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '@core/services/notification.service';

describe('ProfileViewComponent', () => {
  let component: ProfileViewComponent;
  let fixture: ComponentFixture<ProfileViewComponent>;
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
      imports: [ProfileViewComponent, MatButtonModule, DatePipe],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileViewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user information correctly', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain(mockUser.username);
    expect(compiled.textContent).toContain(mockUser.email);
    expect(compiled.textContent).toContain(mockUser.userType);
    expect(compiled.textContent).toContain(mockUser.universityGroup);
    expect(compiled.textContent).toContain('January 1, 1990');
    expect(compiled.textContent).toContain(mockUser.phoneNumber);
  });

  it('should display social links when available', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.textContent).toContain('GitHub');
    expect(compiled.textContent).toContain('https://github.com/test');
    expect(compiled.textContent).toContain('LinkedIn');
    expect(compiled.textContent).toContain('https://linkedin.com/test');
  });

  it('should not display social links section when none are available', () => {
    fixture.componentRef.setInput('user', { ...mockUser, socialLinks: [] });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).not.toContain('Соціальні посилання');
  });

  it('should emit edit event when edit button is clicked', () => {
    spyOn(component.edit, 'emit');

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.edit.emit).toHaveBeenCalled();
  });

  it('should handle error when emitting edit event fails', () => {
    spyOn(component.edit, 'emit').and.throwError('Test error');

    component.onEdit();

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Не вдалося перейти в режим редагування'
    );
  });

  it('should handle missing social links gracefully', () => {
    fixture.componentRef.setInput('user', {
      ...mockUser,
      socialLinks: undefined,
    });
    fixture.detectChanges();

    expect(component.socialLinks).toEqual([]);
  });

  it('should display default name for social links without name', () => {
    fixture.componentRef.setInput('user', {
      ...mockUser,
      socialLinks: [{ url: 'https://test.com', name: '' }],
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Посилання 1');
  });
});
