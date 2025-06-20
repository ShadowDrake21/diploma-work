import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ForgotPasswordComponent } from './forgot-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { of, throwError } from 'rxjs';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'requestPasswordReset',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordComponent,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty email field', () => {
    expect(component.emailControl.value).toBe('');
  });

  it('should show error when email is empty', () => {
    component.emailControl.setValue('');
    component.emailControl.markAsTouched();
    fixture.detectChanges();

    expect(component.emailControl.invalid).toBeTrue();
  });

  it('should show error when email is invalid', () => {
    component.emailControl.setValue('invalid-email');
    component.emailControl.markAsTouched();
    fixture.detectChanges();

    expect(component.emailControl.invalid).toBeTrue();
  });

  it('should submit valid form and request password reset', fakeAsync(() => {
    authServiceMock.requestPasswordReset.and.returnValue(of({}));
    component.emailControl.setValue('valid@example.com');
    component.onSubmit();
    tick();

    expect(authServiceMock.requestPasswordReset).toHaveBeenCalledWith({
      email: 'valid@example.com',
    });
    expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith(
      'Посилання для зміни пароля надіслано на вашу електронну адресу'
    );
    expect(component.cooldown()).toBeGreaterThan(0);
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle user not found error', fakeAsync(() => {
    const error = { code: 'USER_NOT_FOUND' };
    authServiceMock.requestPasswordReset.and.returnValue(
      throwError(() => error)
    );
    component.emailControl.setValue('nonexistent@example.com');
    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Обліковий запис із цією електронною адресою не знайдено'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle rate limit error', fakeAsync(() => {
    const error = {
      status: 429,
      headers: { get: (key: string) => '60' },
    };
    authServiceMock.requestPasswordReset.and.returnValue(
      throwError(() => error)
    );
    component.emailControl.setValue('valid@example.com');
    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Забагато запитів. Спробуйте ще раз пізніше.'
    );
    expect(component.cooldown()).toBe(60);
    expect(component.isLoading()).toBeFalse();
  }));

  it('should start and clear cooldown timer', fakeAsync(() => {
    component.startCooldownTimer(5);
    expect(component.cooldown()).toBe(5);

    tick(1000);
    expect(component.cooldown()).toBe(4);

    tick(4000);
    expect(component.cooldown()).toBe(0);

    component.ngOnDestroy();
  }));

  it('should navigate to sign-in page', () => {
    component.goToSignIn();
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/authentication/sign-in',
    ]);
  });
});
