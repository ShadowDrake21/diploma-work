import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { CustomButtonComponent } from '@shared/components/custom-button/custom-button.component';
import { of, throwError } from 'rxjs';
import { UserRole } from '@shared/enums/user.enum';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['register']);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        SignUpComponent,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    })
      .overrideComponent(SignUpComponent, {
        remove: { imports: [CustomButtonComponent] },
        add: { imports: [] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required validators', () => {
    expect(component.signUpForm).toBeTruthy();
    expect(component.signUpForm.controls.name.validator).toBeTruthy();
    expect(component.signUpForm.controls.email.validator).toBeTruthy();
    expect(component.signUpForm.controls.password.validator).toBeTruthy();
    expect(
      component.signUpForm.controls.confirmPassword.validator
    ).toBeTruthy();
    expect(component.signUpForm.controls.role.value).toBe('USER');
  });

  it('should mark all as touched when invalid form is submitted', () => {
    component.onSignUp();

    expect(component.signUpForm.controls.name.touched).toBeTrue();
    expect(component.signUpForm.controls.email.touched).toBeTrue();
    expect(component.signUpForm.controls.password.touched).toBeTrue();
    expect(component.signUpForm.controls.confirmPassword.touched).toBeTrue();
  });

  it('should not call register when form is invalid', () => {
    component.onSignUp();
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should handle successful registration', fakeAsync(() => {
    component.signUpForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: UserRole.USER,
    });

    authServiceMock.register.and.returnValue(of({}));
    component.onSignUp();
    tick();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      username: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.USER,
    });
    expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/authentication/verification-code'],
      { queryParams: { email: 'test@example.com' }, replaceUrl: true }
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle email in use error', fakeAsync(() => {
    component.signUpForm.setValue({
      name: 'Test User',
      email: 'used@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: UserRole.USER,
    });

    const error = {
      error: {
        errorCode: 'EMAIL_IN_USE',
        message: 'Email already in use',
      },
    };
    authServiceMock.register.and.returnValue(throwError(() => error));
    component.onSignUp();
    tick();

    expect(component.signUpForm.controls.email.errors).toEqual({
      emailInUse: true,
    });
    expect(component.errorMessages.email()).toBe('Email already in use');
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle weak password error', fakeAsync(() => {
    component.signUpForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'weak',
      confirmPassword: 'weak',
      role: UserRole.USER,
    });

    const error = {
      error: {
        errorCode: 'WEAK_PASSWORD',
        message: 'Password is too weak',
      },
    };
    authServiceMock.register.and.returnValue(throwError(() => error));
    component.onSignUp();
    tick();

    expect(component.signUpForm.controls.password.errors).toEqual({
      weakPassword: true,
    });
    expect(component.errorMessages.password()).toBe('Password is too weak');
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle generic error', fakeAsync(() => {
    component.signUpForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: UserRole.USER,
    });

    const error = { message: 'Server error' };
    authServiceMock.register.and.returnValue(throwError(() => error));
    component.onSignUp();
    tick();

    expect(component.serverError()).toBe('Server error');
    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Server error'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should update error messages on value changes', () => {
    const emailControl = component.signUpForm.controls.email;
    emailControl.setValue('invalid-email');
    emailControl.markAsTouched();
    fixture.detectChanges();

    expect(component.errorMessages.email()).toBeTruthy();

    const emailError = fixture.debugElement.query(By.css('mat-error'));
    expect(emailError.nativeElement.textContent).toContain(
      component.errorMessages.email()
    );
  });

  it('should disable form while loading', fakeAsync(() => {
    component.signUpForm.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      role: UserRole.USER,
    });

    authServiceMock.register.and.returnValue(of({}));
    component.onSignUp();

    expect(component.isLoading()).toBeTrue();
    expect(component.formDisabled()).toBeTrue();

    tick();

    expect(component.isLoading()).toBeFalse();
    expect(component.formDisabled()).toBeFalse();
  }));
});
