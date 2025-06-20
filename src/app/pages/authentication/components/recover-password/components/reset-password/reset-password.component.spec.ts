import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { of, throwError } from 'rxjs';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['resetPassword']);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ResetPasswordComponent,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ token: 'valid-token' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty password field', () => {
    expect(component.passwordControl.value).toBe('');
  });

  it('should show error when password is empty', () => {
    component.passwordControl.setValue('');
    component.passwordControl.markAsTouched();
    fixture.detectChanges();

    expect(component.passwordControl.invalid).toBeTrue();
    expect(component.passwordErrorMessage()).toContain('required');
  });

  it('should show error when password is too short', () => {
    component.passwordControl.setValue('123');
    component.passwordControl.markAsTouched();
    fixture.detectChanges();

    expect(component.passwordControl.invalid).toBeTrue();
    expect(component.passwordErrorMessage()).toContain('minimum length');
  });

  it('should toggle password visibility', () => {
    expect(component.isPasswordHidden()).toBeTrue();
    component.togglePasswordVisibility(new MouseEvent('click'));
    expect(component.isPasswordHidden()).toBeFalse();
  });

  it('should handle token from query params', fakeAsync(() => {
    expect(component.token()).toBe('valid-token');
  }));

  it('should redirect when no token is provided', fakeAsync(() => {
    const routeWithoutToken = {
      queryParams: of({}),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeWithoutToken },
      ],
    }).compileComponents();

    const fixtureWithoutToken = TestBed.createComponent(ResetPasswordComponent);
    fixtureWithoutToken.detectChanges();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Недійсне посилання для скидання пароля'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/authentication/forgot-password',
    ]);
  }));

  it('should submit valid form and reset password', fakeAsync(() => {
    authServiceMock.resetPassword.and.returnValue(of({}));
    component.passwordControl.setValue('ValidPassword123');
    component.onSubmit();
    tick();

    expect(authServiceMock.resetPassword).toHaveBeenCalledWith({
      token: 'valid-token',
      newPassword: 'ValidPassword123',
    });
    expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith(
      'Пароль успішно скинуто'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/authentication/sign-in',
    ]);
  }));

  it('should handle expired token error', fakeAsync(() => {
    const error = { code: 'EXPIRED_TOKEN' };
    authServiceMock.resetPassword.and.returnValue(throwError(() => error));
    component.passwordControl.setValue('ValidPassword123');
    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Термін дії посилання для зміни пароля закінчився'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/authentication/forgot-password',
    ]);
  }));

  it('should handle invalid token error', fakeAsync(() => {
    const error = { code: 'INVALID_TOKEN' };
    authServiceMock.resetPassword.and.returnValue(throwError(() => error));
    component.passwordControl.setValue('ValidPassword123');
    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Недійсне посилання для скидання пароля'
    );
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/authentication/forgot-password',
    ]);
  }));

  it('should handle invalid password format error', fakeAsync(() => {
    const error = { status: 400 };
    authServiceMock.resetPassword.and.returnValue(throwError(() => error));
    component.passwordControl.setValue('ValidPassword123');
    component.onSubmit();
    tick();

    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Недійсний формат пароля'
    );
  }));
});
