import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { SignInComponent } from './sign-in.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { UserStore } from '@core/services/stores/user-store.service';
import { of, throwError } from 'rxjs';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userStoreMock: jasmine.SpyObj<UserStore>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    userStoreMock = jasmine.createSpyObj('UserStore', ['loadCurrentUser']);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        SignInComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserStore, useValue: userStoreMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.signInForm.value).toEqual({
      email: '',
      password: '',
      rememberMe: false,
    });
  });

  it('should mark form as invalid when empty', () => {
    expect(component.signInForm.valid).toBeFalse();
  });

  it('should validate email field', () => {
    const emailControl = component.signInForm.controls.email;

    emailControl.setValue('');
    expect(emailControl.hasError('required')).toBeTrue();

    emailControl.setValue('invalid-email');
    expect(emailControl.hasError('email')).toBeTrue();

    emailControl.setValue('valid@email.com');
    expect(emailControl.valid).toBeTrue();
  });

  it('should validate password field', () => {
    const passwordControl = component.signInForm.controls.password;

    passwordControl.setValue('');
    expect(passwordControl.hasError('required')).toBeTrue();

    passwordControl.setValue('12345');
    expect(passwordControl.hasError('minlength')).toBeTrue();

    passwordControl.setValue('validpassword');
    expect(passwordControl.valid).toBeTrue();
  });

  it('should toggle password visibility', () => {
    expect(component.isPasswordHidden()).toBeTrue();
    component.togglePasswordVisibility(new MouseEvent('click'));
    expect(component.isPasswordHidden()).toBeFalse();
    component.togglePasswordVisibility(new MouseEvent('click'));
    expect(component.isPasswordHidden()).toBeTrue();
  });

  it('should not submit invalid form', () => {
    component.onSubmit();
    expect(component.formError()).toBe(
      "Будь ласка, заповніть всі обов'язкові поля правильно"
    );
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should handle successful login', fakeAsync(() => {
    authServiceMock.login.and.returnValue(of({}));
    userStoreMock.loadCurrentUser.and.returnValue(of({}));

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    });

    component.onSubmit();
    tick();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    });
    expect(userStoreMock.loadCurrentUser).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith(
      'Успішний вхід'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle invalid credentials error', fakeAsync(() => {
    const error = { code: 'INVALID_CREDENTIALS' };
    authServiceMock.login.and.returnValue(throwError(() => error));

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'wrongpassword',
      rememberMe: false,
    });

    component.onSubmit();
    tick();

    expect(component.formError()).toBe('Невірний email або пароль');
    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Невірний email або пароль'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle unverified email error', fakeAsync(() => {
    const error = { code: 'EMAIL_NOT_VERIFIED' };
    authServiceMock.login.and.returnValue(throwError(() => error));

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    });

    component.onSubmit();
    tick();

    expect(component.formError()).toBe(
      'Будь ласка, підтвердіть вашу електронну пошту перед входом.'
    );
    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Будь ласка, підтвердіть вашу електронну пошту перед входом.'
    );
    expect(component.isLoading()).toBeFalse();
  }));

  it('should handle generic login error', fakeAsync(() => {
    const error = { code: 'UNKNOWN_ERROR' };
    authServiceMock.login.and.returnValue(throwError(() => error));

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false,
    });

    component.onSubmit();
    tick();

    expect(component.formError()).toBe('Невдала спроба входу');
    expect(notificationServiceMock.showError).toHaveBeenCalledWith(
      'Невдала спроба входу'
    );
    expect(component.isLoading()).toBeFalse();
  }));
});
